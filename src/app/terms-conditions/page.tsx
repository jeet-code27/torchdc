import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | Torch",
  description:
    "Terms for ordering from Torch: 21+ only, cash on delivery, delivery within Washington, DC, deals and responsible use.",
};

export const revalidate = 86400;

/** Generated from client-reference-new/torch-site-2026-10-22/torch-site/terms-conditions.html (markup kept 1:1 with the client site). */
export default function TermsConditionsPage() {
  return (
    <main>
      <div className="narrow">
        <section className="dealhead">
          <h1>Terms and Conditions</h1>
          <span className="muted">Last updated October 2026</span>
        </section>
        <section className="prose legaltext">
          <h2>Who can use Torch</h2>
          <p>
            You must be 21 or older to use this site or place an order. A valid government-issued photo ID is
            checked at delivery or pickup, and orders are not handed over without one.
          </p>
          <h2>Orders and payment</h2>
          <p>
            Orders are paid in cash when they are delivered or picked up. Prices and availability can change,
            and we may cancel an order if an item is out of stock or the order cannot be verified.
          </p>
          <h2>Delivery</h2>
          <p>
            We deliver within Washington, DC only. The adult receiving the order must be 21+ and show ID. We
            may refuse delivery if the recipient appears intoxicated or cannot show valid ID.
          </p>
          <h2>Deals</h2>
          <p>
            Deals apply as described on the Deals page and may change or end at any time. Wake & Bake is
            limited to 1 per customer per day.
          </p>
          <h2>Responsible use</h2>
          <p>
            Do not drive or operate machinery after using cannabis. Keep products away from children and pets.
            Do not take cannabis across state lines.
          </p>
          <h2>Contact</h2>
          <p>Questions about these terms: info@torchdc.co or (202) 468-1966.</p>
        </section>
      </div>
    </main>
  );
}
