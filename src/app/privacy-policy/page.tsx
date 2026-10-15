import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Torch",
  description: "Privacy Policy for Torch Cannabis Delivery, Washington, DC.",
};

export const revalidate = 86400;

export default function PrivacyPolicyPage() {
  return (
    <div className="narrow py-8 sm:py-12">
      <section className="dealhead">
        <h1>Privacy Policy</h1>
        <span className="muted">Last updated October 2026</span>
      </section>

      <section className="prose legaltext mt-6 space-y-6 text-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">What we collect</h2>
          <p className="text-neutral-600 leading-relaxed">
            When you place an order we collect your name, phone number, delivery address and, if you
            give it, your email. We use it only to fill your order, text you updates and answer
            questions.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">What we don&apos;t do</h2>
          <p className="text-neutral-600 leading-relaxed">
            We don&apos;t sell your information. We share it only with the systems we use to run
            orders, such as our store software.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Cookies</h2>
          <p className="text-neutral-600 leading-relaxed">
            We store your cart and your age confirmation in your browser so they&apos;re there when
            you come back. You can clear them at any time in your browser settings.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Your choices</h2>
          <p className="text-neutral-600 leading-relaxed">
            Ask us to see, correct or delete your information at{" "}
            <a href="mailto:info@torchdc.co" className="text-[#5A805B] font-semibold underline">
              info@torchdc.co
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
