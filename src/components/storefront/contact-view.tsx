"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Phone, MessageSquare, Mail, ChevronRight } from "lucide-react";

export function ContactView() {
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement)?.value || "";
    const reply = (form.elements.namedItem("reply") as HTMLInputElement)?.value || "";
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement)?.value || "";

    const body = `Name: ${name}\nReply to: ${reply}\n\n${message}`;
    const mailtoUrl = `mailto:info@torchdc.co?subject=${encodeURIComponent(
      "Message from torchdc.co"
    )}&body=${encodeURIComponent(body)}`;

    setSubmitted(true);
    window.location.href = mailtoUrl;
  };

  return (
    <main className="w-full">
      <div className="narrow">
        {/* ================= HEADER SECTION ================= */}
        <section className="dealhead">
          <span className="eyebrow">WE&apos;RE HERE TO HELP</span>
          <h1>Contact Us</h1>
          <span className="muted !text-[#4F5A50]" style={{ color: "#4F5A50" }}>
            Questions about an order, a strain or delivery? Reach us any way you like.
          </span>
        </section>

        {/* ================= 3 CONTACT QUICK ACTIONS ================= */}
        <div className="contacts">
          <a href="tel:+12024681966" aria-label="Call Torch">
            <span className="cic">
              <Phone className="w-4 h-4 stroke-[2.2]" />
            </span>
            <span>Call</span>
          </a>
          <a href="sms:+12024681966" aria-label="Text Torch">
            <span className="cic">
              <MessageSquare className="w-4 h-4 stroke-[2.2]" />
            </span>
            <span>Text</span>
          </a>
          <a href="mailto:info@torchdc.co" aria-label="Email Torch">
            <span className="cic">
              <Mail className="w-4 h-4 stroke-[2.2]" />
            </span>
            <span>Email</span>
          </a>
        </div>

        {/* ================= MAP CARD (CLIENT REFERENCE) ================= */}
        <div className="mapcard">
          <iframe
            title="Map to Torch, 1000 G St NW"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=1000+G+St+NW,+Washington,+DC+20001&output=embed"
          />
          <div className="mapcard__row">
            <span>
              <strong>1000 G St NW</strong>
              <span>Washington, DC 20001 · Curbside pickup</span>
            </span>
            <a
              className="smallpill"
              href="https://maps.google.com/?q=1000+G+St+NW,+Washington,+DC+20001"
              target="_blank"
              rel="noopener noreferrer"
            >
              Directions
            </a>
          </div>
        </div>

        {/* ================= HOURS CARD ================= */}
        <div className="hours">
          <strong className="!text-[#1F2820]" style={{ color: "#1F2820" }}>Hours</strong>
          <div>
            <span className="!text-[#4F5A50] font-medium" style={{ color: "#4F5A50" }}>Monday to Saturday</span>
            <span className="!text-[#1F2820] font-bold" style={{ color: "#1F2820" }}>7AM to 11PM</span>
          </div>
          <div>
            <span className="!text-[#4F5A50] font-medium" style={{ color: "#4F5A50" }}>Sunday</span>
            <span className="!text-[#1F2820] font-bold" style={{ color: "#1F2820" }}>10AM to 9PM</span>
          </div>
        </div>

        {/* ================= SEND US A MESSAGE FORM ================= */}
        <section className="msg">
          <h2 className="!text-[#1F2820]" style={{ color: "#1F2820" }}>Send us a message</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="cn" className="!text-[#364F37] font-bold" style={{ color: "#364F37" }}>
              Name
            </label>
            <input
              id="cn"
              name="name"
              autoComplete="name"
              placeholder="Your name"
              required
              className="!text-[#1F2820]"
              style={{ color: "#1F2820" }}
            />

            <label htmlFor="cp" className="!text-[#364F37] font-bold" style={{ color: "#364F37" }}>
              Phone or email
            </label>
            <input
              id="cp"
              name="reply"
              placeholder="e.g. (202) 555-0199 or name@email.com"
              required
              className="!text-[#1F2820]"
              style={{ color: "#1F2820" }}
            />

            <label htmlFor="cm" className="!text-[#364F37] font-bold" style={{ color: "#364F37" }}>
              Message
            </label>
            <textarea
              id="cm"
              name="message"
              rows={4}
              placeholder="How can we help you today?"
              required
              className="!text-[#1F2820]"
              style={{ color: "#1F2820" }}
            />

            <button className="placebtn" type="submit">
              {submitted ? "Opening Email App..." : "Send message"}
            </button>
            <span className="fine !text-[#4F5A50]" style={{ color: "#4F5A50" }}>
              This opens your email app with your message ready to send.
            </span>
          </form>
        </section>

        {/* ================= QUICK ANSWERS FAQ LINK ================= */}
        <Link className="tierlink" href="/faq">
          <span>
            <strong>Quick answers</strong>
            <span>Hours, ID, payment and more in our FAQ</span>
          </span>
          <ChevronRight className="w-5 h-5 stroke-[2.4]" />
        </Link>

        {/* ================= BOTTOM READY TO ORDER BANNER ================= */}
        <div className="mt-8 rounded-3xl bg-[#EEF5EE] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border border-[#E2ECE1]">
          <div className="space-y-1 text-left">
            <h3 className="text-lg sm:text-xl font-bold text-[#1F2820]">
              Ready to place your order?
            </h3>
            <p className="text-xs sm:text-sm text-[#4F5A50]">
              Average delivery time across DC is 30 to 60 minutes with cash on delivery.
            </p>
          </div>
          <Link
            href="/shop"
            className="placebtn !mt-0 !w-auto !h-12 !px-7 !text-sm !shadow-sm shrink-0"
          >
            <span className="flex items-center gap-2 text-white font-bold">
              <span>Shop All Products</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
