import Link from "next/link";

/** Order confirmation screen (client site confirmation(), Oct 24). */

export type PlacedOrder = {
  orderNumber: string;
  firstName: string;
  isDelivery: boolean;
  address: string;
  lines: Array<{ name: string; weight?: string; quantity: number; total: number }>;
  deals: Array<{ label: string; amount: number }>;
  fee: number;
  total: number;
};

const money = (n: number) => `$${(Math.round(n * 100) / 100).toLocaleString("en-US")}`;

const svg = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, "aria-hidden": true };
const ICONS = {
  id: (
    <svg {...svg} width="18" height="18">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <circle cx="9" cy="11" r="2" />
      <path d="M6 16c.6-1.4 1.7-2 3-2s2.4.6 3 2M14.5 10h3.5M14.5 13.5h2.5" />
    </svg>
  ),
  clock: (
    <svg {...svg} width="18" height="18">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  ),
  car: (
    <svg {...svg} width="18" height="18" strokeLinejoin="round">
      <path d="M5 16V11l2-4.5h10L19 11v5M3.5 16h17M7 16v2M17 16v2" />
      <circle cx="8" cy="13" r=".6" />
      <circle cx="16" cy="13" r=".6" />
    </svg>
  ),
  cash: (
    <svg {...svg} width="20" height="20">
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 9.5v5M18 9.5v5" />
    </svg>
  ),
};

export function OrderConfirmation({ order }: { order: PlacedOrder }) {
  const del = order.isDelivery;
  const steps: [React.ReactNode, string, string][] = [
    [ICONS.id, "We'll Reach Out to Verify Your Age", "Someone from our team will contact you shortly. Have your ID ready."],
    [
      ICONS.clock,
      del ? "Delivery in 30 to 90 Minutes" : "Ready for Curbside Pickup",
      del
        ? "After we confirm your order, your driver usually arrives in 30 to 90 minutes, depending on traffic."
        : "Once your order is confirmed, we'll text you when it's ready at 1000 G St NW.",
    ],
  ];
  if (del) {
    steps.push([ICONS.car, "Step Out and Grab Your Order", "Your driver will text you when they're on the way, and once again when they're outside."]);
  }

  return (
    <div className="conf">
      <div className="conf__hero">
        <span className="conf__check" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <h2>Your order has been placed{order.firstName ? `, ${order.firstName}` : ""}!</h2>
        <p>Order {order.orderNumber}</p>
      </div>

      <div className="conf__card">
        <h3>What happens next</h3>
        <ol className="conf__steps">
          {steps.map(([icon, title, text]) => (
            <li key={title}>
              <span className="conf__ico">{icon}</span>
              <span>
                <b>{title}</b>
                <span>{text}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="conf__cash">
        <span className="conf__ico conf__ico--cash">{ICONS.cash}</span>
        <span>
          <b>Our drivers don&apos;t carry change.</b>
          <span>
            Please have exact cash ready: <b>{money(order.total)}</b>
          </span>
        </span>
      </div>

      <div className="conf__card conf__sum">
        <h3>Order summary</h3>
        {order.lines.map((l, i) => (
          <div key={i}>
            <span>
              <b>{l.quantity}×</b> {l.name}
              {l.weight ? <> <small>{l.weight}</small></> : null}
            </span>
            <span>{money(l.total)}</span>
          </div>
        ))}
        {order.deals.map((d, i) => (
          <div key={`d${i}`} className="conf__deal">
            <span>{d.label}</span>
            <span>−{money(d.amount)}</span>
          </div>
        ))}
        <div>
          <span>{del ? "Delivery" : "Pickup"}</span>
          <span>{order.fee ? money(order.fee) : <span className="ok">Free</span>}</span>
        </div>
        <div className="conf__total">
          <span>Total, paid in cash</span>
          <span>{money(order.total)}</span>
        </div>
        {del && order.address ? (
          <p className="conf__addr">
            <span>Delivering to</span>
            {order.address}
          </p>
        ) : (
          <p className="conf__addr">
            <span>Pickup at</span>1000 G St NW, Washington, DC 20001
          </p>
        )}
      </div>

      <div className="conf__btns">
        <Link className="pill pill--green" href="/">
          Back to home
        </Link>
        <a className="conf__help" href="sms:+12024681966">
          Questions? Text (202) 468-1966
        </a>
      </div>
    </div>
  );
}
