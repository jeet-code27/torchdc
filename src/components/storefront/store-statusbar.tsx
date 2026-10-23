"use client";

import * as React from "react";

const HOURS: [number, number][] = [
  [420, 1380], // Sun: 7:00 AM - 11:00 PM (open 7 days a week, same as every day)
  [420, 1380], // Mon: 7:00 AM - 11:00 PM (420 - 1380 mins)
  [420, 1380], // Tue: 7:00 AM - 11:00 PM
  [420, 1380], // Wed: 7:00 AM - 11:00 PM
  [420, 1380], // Thu: 7:00 AM - 11:00 PM
  [420, 1380], // Fri: 7:00 AM - 11:00 PM
  [420, 1380], // Sat: 7:00 AM - 11:00 PM
];

function fmt(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const ap = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 || 12;
  return `${displayH}${m ? `:${m < 10 ? "0" : ""}${m}` : ""}${ap}`;
}

function getDCStatus(): { isOpen: boolean; text: string } {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).formatToParts(new Date());

    const p: Record<string, string> = {};
    parts.forEach((x) => {
      p[x.type] = x.value;
    });

    const dayIdx = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
      p.weekday
    );
    const day = dayIdx >= 0 ? dayIdx : 0;
    const nowMins =
      (parseInt(p.hour || "0", 10) % 24) * 60 + parseInt(p.minute || "0", 10);
    const today = HOURS[day];

    if (today && nowMins >= today[0] && nowMins < today[1]) {
      return {
        isOpen: true,
        text: `Taking orders until ${fmt(today[1])}`,
      };
    } else {
      const next =
        nowMins < today[0] ? today[0] : HOURS[(day + 1) % 7][0];
      const isTomorrow = nowMins >= today[0];
      return {
        isOpen: false,
        text: `Order ahead, we open at ${fmt(next)}${isTomorrow ? " tomorrow" : ""}`,
      };
    }
  } catch {
    return {
      isOpen: true,
      text: "Taking orders until 11PM",
    };
  }
}

export function StoreStatusbar() {
  const [status, setStatus] = React.useState(getDCStatus);

  React.useEffect(() => {
    const check = () => setStatus(getDCStatus());
    check();
    const timer = setInterval(check, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={`openbar ${status.isOpen ? "" : "is-closed"}`}
      role="status"
    >
      <span className="openbar__dot" aria-hidden="true" />
      <span className="openbar__text">
        <strong>{status.isOpen ? "Open now" : "Closed now"}</strong> ·{" "}
        {status.text}
      </span>
    </div>
  );
}

export const StoreStatusBar = StoreStatusbar;
