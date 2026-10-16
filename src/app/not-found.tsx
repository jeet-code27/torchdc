import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found | Torch",
};

/** Generated from client-reference/404.html (markup kept 1:1 with the client site). */
export default function NotFound() {
  return (
    <main>
      <div className="narrow center">
        <section className="dealhead">
          <h1>Page not found</h1>
          <span className="muted">That page moved or doesn&apos;t exist.</span>
        </section>
        <div className="orderbtns">
          <Link className="pill pill--green" href="/shop">
            Shop the menu
          </Link>
          <Link className="pill pill--black" href="/">
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
