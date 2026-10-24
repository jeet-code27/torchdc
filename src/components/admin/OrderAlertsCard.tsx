'use client';

import { useCallback, useEffect, useState } from 'react';

type Status = 'loading' | 'install' | 'unsupported' | 'prompt' | 'on' | 'denied' | 'dismissed';

const SW_URL = '/admin-sw.js';
const DISMISS_KEY = 'torch-alerts-dismissed';

// Return type left to inference so this compiles on TypeScript before and after 5.7.
function urlBase64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function readDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

async function getRegistration() {
  return (await navigator.serviceWorker.getRegistration('/admin')) || navigator.serviceWorker.register(SW_URL, { scope: '/admin' });
}

/** Dashboard card: "Get new order alerts" → Allow → "Alerts are on" + test button. */
export default function OrderAlertsCard() {
  const [status, setStatus] = useState<Status>('loading');
  const [busy, setBusy] = useState(false);
  const [testState, setTestState] = useState<'idle' | 'sent' | 'failed'>('idle');

  const refresh = useCallback(async () => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    if (!supported) {
      setStatus(isIOS() && !isStandalone() ? 'install' : 'unsupported');
      return;
    }
    if (isIOS() && !isStandalone()) return setStatus('install');
    if (Notification.permission === 'denied') return setStatus('denied');

    const reg = await getRegistration();
    const sub = await reg.pushManager.getSubscription();
    if (Notification.permission === 'granted' && sub) {
      // Re-send on every load so the server always has the current subscription.
      fetch('/api/admin/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      }).catch(() => {});
      return setStatus('on');
    }
    setStatus(readDismissed() ? 'dismissed' : 'prompt');
  }, []);

  useEffect(() => {
    refresh().catch(() => setStatus('unsupported'));
  }, [refresh]);

  // Must run straight from the button tap: iPhone only shows the Allow prompt after a user gesture.
  const turnOn = async () => {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus(permission === 'denied' ? 'denied' : 'prompt');
        return;
      }
      const reg = await getRegistration();
      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!key) throw new Error('NEXT_PUBLIC_VAPID_PUBLIC_KEY missing');
      const sub =
        (await reg.pushManager.getSubscription()) ||
        (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key) }));
      const res = await fetch('/api/admin/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });
      if (!res.ok) throw new Error(`subscribe failed: ${res.status}`);
      setStatus('on');
    } catch (err) {
      console.error('[alerts] could not turn on', err);
      setStatus('prompt');
    } finally {
      setBusy(false);
    }
  };

  const notNow = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {}
    setStatus('dismissed');
  };

  const sendTest = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/push/test', { method: 'POST' });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean };
      setTestState(res.ok && data.ok ? 'sent' : 'failed');
    } catch {
      setTestState('failed');
    } finally {
      setBusy(false);
    }
  };

  if (status === 'loading' || status === 'dismissed' || status === 'unsupported') return null;

  if (status === 'install') {
    return (
      <section className="mx-4 mt-4 flex flex-col gap-3 rounded-[14px] border border-[#e4e4e7] bg-[#fafafa] p-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[17px] font-bold">One step before alerts</h2>
          <p className="text-sm leading-snug text-[#3f3f46]">iPhone only sends alerts to the admin when it&apos;s on your home screen.</p>
        </div>
        <ol className="flex flex-col gap-3 text-[15px]">
          <li>1. Tap Share in Safari</li>
          <li>2. Choose <strong>Add to Home Screen</strong></li>
          <li>3. Open <strong>Torch Admin</strong> from your home screen and tap Turn on alerts</li>
        </ol>
        <p className="text-[13px] text-[#52525b]">Already added it before this update? Delete the old icon and add it again.</p>
      </section>
    );
  }

  if (status === 'denied') {
    return (
      <section className="mx-4 mt-4 flex flex-col gap-2 rounded-[14px] border border-[#f3d9a4] bg-[#fffaf0] p-4">
        <h2 className="text-base font-bold">Alerts are blocked</h2>
        <p className="text-sm leading-snug text-[#3f3f46]">To turn them on: iPhone Settings › Notifications › Torch Admin › Allow Notifications.</p>
        <button type="button" onClick={() => refresh()} className="h-11 rounded-[10px] border border-[#d4a24c] bg-white text-sm font-semibold">
          I turned them on
        </button>
      </section>
    );
  }

  if (status === 'on') {
    return (
      <section className="mx-4 mt-4 flex flex-col gap-3 rounded-[14px] border border-[#e4e4e7] p-4">
        <h2 className="text-[17px] font-bold">Alerts are on for this phone</h2>
        <p className="text-sm text-[#3f3f46]">Lock your phone and tap below to make sure it works.</p>
        <button
          type="button"
          disabled={busy}
          onClick={sendTest}
          className={
            testState === 'sent'
              ? 'h-12 rounded-[10px] border border-[#b9d1b4] bg-[#dfeadb] text-[15px] font-semibold text-[#3f5e3c]'
              : 'h-12 rounded-[10px] border border-[#d4d4d8] bg-white text-[15px] font-semibold'
          }
        >
          {testState === 'sent' ? 'Test alert sent' : testState === 'failed' ? 'Test failed, tap to retry' : 'Send a test alert'}
        </button>
      </section>
    );
  }

  return (
    <section className="mx-4 mt-4 flex flex-col gap-3 rounded-[14px] border-2 border-[#3f6b40] bg-[#f3f8f2] p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-[17px] font-bold">Get new order alerts</h2>
        <p className="text-sm leading-snug text-[#3f3f46]">Your phone buzzes the moment an order comes in, even with the admin closed.</p>
      </div>
      <button type="button" disabled={busy} onClick={turnOn} className="h-12 rounded-[10px] bg-[#3f6b40] text-[15px] font-semibold text-white">
        {busy ? 'Turning on…' : 'Turn on alerts'}
      </button>
      <button type="button" onClick={notNow} className="h-10 text-sm font-medium text-[#52525b]">
        Not now
      </button>
    </section>
  );
}
