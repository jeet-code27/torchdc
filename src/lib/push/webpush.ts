import webpush from 'web-push';
import { PushSubscriptionModel } from '@/models/PushSubscription';
import { connectDB } from './adapters';

export type AlertPayload = {
  title: string;
  body: string;
  url: string;
  tag?: string;
};

let configured = false;

/**
 * Public VAPID key, read when the server runs (not baked in at build time like a plain
 * process.env.NEXT_PUBLIC_* read would be), so adding it to .env only needs a restart.
 */
export function vapidPublicKey(): string {
  const env = process.env as Record<string, string | undefined>;
  return (env["VAPID_PUBLIC_KEY"] || env["NEXT_PUBLIC_" + "VAPID_PUBLIC_KEY"] || "").trim();
}

/** True once the three VAPID env vars are set on the server. */
export function isPushConfigured() {
  return Boolean(vapidPublicKey() && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT);
}

function configure() {
  if (configured) return;
  const publicKey = vapidPublicKey();
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT; // e.g. "mailto:torchdc@icloud.com"
  if (!publicKey || !privateKey || !subject) {
    throw new Error('Push is not configured: set NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY and VAPID_SUBJECT');
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

type Filter = { userId?: string; remindersOnly?: boolean };

/** Sends a push to every matching admin device. Dead subscriptions are removed automatically. */
export async function sendAlert(payload: AlertPayload, filter: Filter = {}): Promise<{ sent: number; removed: number }> {
  configure();
  await connectDB();

  const query: Record<string, unknown> = {};
  if (filter.userId) query.userId = filter.userId;
  if (filter.remindersOnly) query.reminders = true;

  const subs = await PushSubscriptionModel.find(query).lean();
  const body = JSON.stringify(payload);
  let sent = 0;
  const dead: string[] = [];

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.keys!.p256dh, auth: s.keys!.auth } },
          body,
          { TTL: 60 * 30, urgency: 'high' }
        );
        sent++;
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) dead.push(s.endpoint);
        else console.error('[push] send failed', status, (err as Error).message);
      }
    })
  );

  if (dead.length) await PushSubscriptionModel.deleteMany({ endpoint: { $in: dead } });
  if (sent) {
    await PushSubscriptionModel.updateMany(
      { endpoint: { $in: subs.map((s) => s.endpoint).filter((e) => !dead.includes(e)) } },
      { $set: { lastSuccessAt: new Date() } }
    );
  }
  return { sent, removed: dead.length };
}
