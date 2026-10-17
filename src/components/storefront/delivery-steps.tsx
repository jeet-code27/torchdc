/** "Delivery in 3 easy steps" block from the client homepage; neighborhood pages reuse it too. */
export function DeliverySteps() {
  return (
    <section className="steps" aria-labelledby="steps-h">
      <h2 id="steps-h">Delivery in 3 easy steps</h2>
      <div className="step">
        <div className="step__rail">
          <span className="step__icon" style={{ background: "#85AD85" }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="18" cy="20" r="1.5" />
              <path d="M2 3h3l2.6 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.5L22 7H6" />
            </svg>
          </span>
          <span className="step__line" />
        </div>
        <div className="step__body">
          <strong>Pick your products</strong>
          <span>Order online in a few taps, or call us.</span>
        </div>
      </div>
      <div className="step">
        <div className="step__rail">
          <span className="step__icon" style={{ background: "#5A805B" }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="9" cy="11" r="2.2" />
              <path d="M5.8 16.2c.6-1.6 1.8-2.4 3.2-2.4s2.6.8 3.2 2.4M14 10h4M14 13.5h3" />
            </svg>
          </span>
          <span className="step__line" />
        </div>
        <div className="step__body">
          <strong>Verify your ID</strong>
          <span>Text us a photo of your ID and a quick selfie.</span>
        </div>
      </div>
      <div className="step">
        <div className="step__rail">
          <span className="step__icon" style={{ background: "#2F4F30" }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 6h13v10H1zM14 9h4l4 4v3h-8z" />
              <circle cx="6" cy="18" r="2" />
              <circle cx="18" cy="18" r="2" />
            </svg>
          </span>
        </div>
        <div className="step__body">
          <strong>Get your delivery</strong>
          <span>We deliver it right to you.</span>
        </div>
      </div>
    </section>
  );
}
