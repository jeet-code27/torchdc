import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | Torch",
  description: "Terms and Conditions for Torch Cannabis Delivery, Washington, DC.",
};

export const revalidate = 86400;

export default function TermsConditionsPage() {
  return (
    <div className="narrow py-8 sm:py-12">
      <section className="dealhead">
        <h1>Terms and Conditions</h1>
        <span className="muted">Last updated October 2026</span>
      </section>

      <section className="prose legaltext mt-6 space-y-6 text-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Who can use Torch</h2>
          <p className="text-neutral-600 leading-relaxed">
            You must be 21 or older to use this site or place an order. A valid government-issued
            photo ID is checked at delivery or pickup, and orders are not handed over without one.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Orders and payment</h2>
          <p className="text-neutral-600 leading-relaxed">
            Orders are paid in cash when they are delivered or picked up. Prices and availability
            can change, and we may cancel an order if an item is out of stock or the order cannot be
            verified.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Delivery</h2>
          <p className="text-neutral-600 leading-relaxed">
            We deliver within Washington, DC only. The adult receiving the order must be 21+ and
            show ID. We may refuse delivery if the recipient appears intoxicated or cannot show
            valid ID.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Deals</h2>
          <p className="text-neutral-600 leading-relaxed">
            Deals apply as described on the Deals page and may change or end at any time. Wake &amp;
            Bake is limited to 1 per customer per day.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Responsible use</h2>
          <p className="text-neutral-600 leading-relaxed">
            Do not drive or operate machinery after using cannabis. Keep products away from
            children and pets. Do not take cannabis across state lines.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Contact</h2>
          <p className="text-neutral-600 leading-relaxed">
            Questions about these terms: <a href="mailto:info@torchdc.co" className="text-[#5A805B] font-semibold underline">info@torchdc.co</a> or{" "}
            <a href="tel:+12024681966" className="text-[#5A805B] font-semibold underline">(202) 468-1966</a>.
          </p>
        </div>
      </section>
    </div>
  );
}
