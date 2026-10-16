"use client";

import * as React from "react";
import Link from "next/link";

/** Contact page, generated from client-reference/contact-us.html (markup kept 1:1 with the client site). */
export function ContactView() {
  // Same as the client site: the form opens the email app with the message filled in
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget.elements as unknown as Record<string, HTMLInputElement>;
    const body = `Name: ${f.name.value}\nReply to: ${f.reply.value}\n\n${f.message.value}`;
    window.location.href =
      "mailto:info@torchdc.co?subject=" +
      encodeURIComponent("Message from torchdc.co") +
      "&body=" +
      encodeURIComponent(body);
  };

  return (
    <main>
      <div className="narrow">
        <section className="dealhead">
          <span className="eyebrow">WE&apos;RE HERE TO HELP</span>
          <h1>Contact Us</h1>
          <span className="muted">
            Questions about an order, a strain or delivery? Reach us any way you like.
          </span>
        </section>
        <div className="contacts">
          <a href="tel:+12024681966">
            <span className="cic">
              <svg
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"></path>
              </svg>
            </span>
            Call
          </a>
          <a href="sms:+12024681966">
            <span className="cic">✉</span>Text
          </a>
          <a href="mailto:info@torchdc.co">
            <span className="cic">@</span>Email
          </a>
        </div>
        <div className="mapcard">
          <iframe
            title="Map to Torch, 1000 G St NW"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=1000+G+St+NW,+Washington,+DC+20001&output=embed"
          ></iframe>
          <div className="mapcard__row">
            <span>
              <strong>1000 G St NW</strong>
              <span>Washington, DC 20001 · Curbside pickup</span>
            </span>
            <a className="smallpill" href="https://maps.google.com/?q=1000+G+St+NW,+Washington,+DC+20001">
              Directions
            </a>
          </div>
        </div>
        <div className="hours">
          <strong>Hours</strong>
          <div>
            <span>Monday to Saturday</span>
            <span>7AM to 11PM</span>
          </div>
          <div>
            <span>Sunday</span>
            <span>10AM to 9PM</span>
          </div>
        </div>
        <section className="msg">
          <h2>Send us a message</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="cn">Name</label>
            <input id="cn" name="name" autoComplete="name" required />
            <label htmlFor="cp">Phone or email</label>
            <input id="cp" name="reply" required />
            <label htmlFor="cm">Message</label>
            <textarea id="cm" name="message" rows={4} required></textarea>
            <button className="placebtn" type="submit">
              Send message
            </button>
            <span className="fine">This opens your email app with your message ready to send.</span>
          </form>
        </section>
        <Link className="tierlink" href="/faq">
          <span>
            <strong>Quick answers</strong>
            <span>Hours, ID, payment and more in our FAQ</span>
          </span>
          <svg
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 6l6 6-6 6"></path>
          </svg>
        </Link>
      </div>
    </main>
  );
}
