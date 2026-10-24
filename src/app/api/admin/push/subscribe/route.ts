import { NextResponse } from 'next/server';
import { PushSubscriptionModel } from '@/models/PushSubscription';
import { connectDB, getAdminUserId } from '@/lib/push/adapters';

export const runtime = 'nodejs';

type Body = {
  subscription?: { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  endpoint?: string;
  reminders?: boolean;
};

/** Save (or refresh) this device's push subscription. */
export async function POST(req: Request) {
  const userId = await getAdminUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Body;
  const s = body.subscription;
  if (!s?.endpoint || !s.keys?.p256dh || !s.keys?.auth) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
  }

  await connectDB();
  await PushSubscriptionModel.updateOne(
    { endpoint: s.endpoint },
    {
      $set: {
        userId,
        keys: { p256dh: s.keys.p256dh, auth: s.keys.auth },
        userAgent: req.headers.get('user-agent') || undefined,
      },
      $setOnInsert: { reminders: true },
    },
    { upsert: true }
  );
  return NextResponse.json({ ok: true });
}

/** Change this device's "Remind if not confirmed" setting. */
export async function PATCH(req: Request) {
  const userId = await getAdminUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Body;
  if (!body.endpoint || typeof body.reminders !== 'boolean') {
    return NextResponse.json({ error: 'endpoint and reminders are required' }, { status: 400 });
  }
  await connectDB();
  await PushSubscriptionModel.updateOne({ endpoint: body.endpoint, userId }, { $set: { reminders: body.reminders } });
  return NextResponse.json({ ok: true });
}

/** Turn alerts off for this device. */
export async function DELETE(req: Request) {
  const userId = await getAdminUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Body;
  if (!body.endpoint) return NextResponse.json({ error: 'endpoint is required' }, { status: 400 });

  await connectDB();
  await PushSubscriptionModel.deleteOne({ endpoint: body.endpoint, userId });
  return NextResponse.json({ ok: true });
}
