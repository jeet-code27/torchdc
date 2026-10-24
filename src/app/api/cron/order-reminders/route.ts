import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/push/adapters';
import { alertStillPending, type OrderForAlert } from '@/lib/push/order-alerts';
import { isPushConfigured } from '@/lib/push/webpush';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WAIT_MINUTES = Number(process.env.ORDER_REMINDER_MINUTES || 5);
const LOOKBACK_HOURS = 6; // never nag about very old pending orders

/**
 * Runs every minute from the server's crontab (see PUSH_ALERTS_SETUP in the admin update notes).
 * Sends one "Still waiting" alert per order that is still pending after WAIT_MINUTES.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isPushConfigured()) return NextResponse.json({ ok: true, checked: 0, reminded: 0, skipped: 'push not configured' });

  await connectDB();
  const orders = mongoose.connection.collection(process.env.ORDERS_COLLECTION || 'orders');
  const now = Date.now();
  const due = await orders
    .find({
      orderStatus: 'pending',
      isTest: { $ne: true },
      alertReminderSentAt: { $exists: false },
      createdAt: { $lte: new Date(now - WAIT_MINUTES * 60_000), $gte: new Date(now - LOOKBACK_HOURS * 3_600_000) },
    })
    .limit(25)
    .toArray();

  let reminded = 0;
  for (const order of due) {
    // Claim first so two overlapping runs can't double-send.
    const claim = await orders.updateOne(
      { _id: order._id, alertReminderSentAt: { $exists: false } },
      { $set: { alertReminderSentAt: new Date() } }
    );
    if (claim.modifiedCount !== 1) continue;
    try {
      await alertStillPending(order as unknown as OrderForAlert);
      reminded++;
    } catch (err) {
      console.error('[push] reminder failed', String(order._id), err);
    }
  }
  return NextResponse.json({ ok: true, checked: due.length, reminded });
}
