import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo-settings";

// Title and description: built-in default (src/lib/seo-pages.ts) or the one set on Admin › SEO
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("privacy");
}

export const revalidate = 86400;

/** Generated from client-reference-new/torch-site-2026-10-22/torch-site/privacy-policy.html (markup kept 1:1 with the client site). */
export default function PrivacyPolicyPage() {
  return (
    <main>
      <div className="narrow">
        <section className="dealhead">
          <h1>Privacy Policy</h1>
          <span className="muted">Last updated October 2026</span>
        </section>
        <section className="prose legaltext">
          <h2>What we collect</h2>
          <p>
            When you place an order we collect your name, phone number, delivery address and, if you give it,
            your email. We use it only to fill your order, text you updates and answer questions.
          </p>
          <h2>What we don&apos;t do</h2>
          <p>
            We don&apos;t sell your information. We share it only with the systems we use to run orders, such
            as our store software.
          </p>
          <h2>Cookies</h2>
          <p>
            We store your cart and your age confirmation in your browser so they&apos;re there when you come
            back. You can clear them at any time in your browser settings.
          </p>
          <h2>Your choices</h2>
          <p>Ask us to see, correct or delete your information at info@torchdc.co.</p>
        </section>
      </div>
    </main>
  );
}
