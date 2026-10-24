import { NextResponse } from 'next/server';
import { getAdminUserId } from '@/lib/push/adapters';
import { isPushConfigured, sendAlert } from '@/lib/push/webpush';

export const runtime = 'nodejs';

/** "Send a test alert" button: pushes to the signed-in admin's own devices only. */
export async function POST(req: Request) {
  const userId = await getAdminUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isPushConfigured()) {
    return NextResponse.json({ ok: false, error: 'Push alerts are not set up on the server yet (VAPID keys missing).' }, { status: 503 });
  }

  const result = await sendAlert(
    { title: 'Alerts are working', body: 'This phone will get new order alerts.', url: '/admin', tag: 'test-alert' },
    { userId }
  );
  return NextResponse.json({ ok: result.sent > 0, ...result });
}
