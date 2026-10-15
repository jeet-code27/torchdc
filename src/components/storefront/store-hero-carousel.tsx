"use client";

import * as React from "react";
import Link from "next/link";

export function StoreHeroCarousel() {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const n = 2;

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % n);
    }, 7500);
    return () => clearInterval(timer);
  }, [n]);

  const goToSlide = (idx: number) => {
    setCurrentSlide(idx);
  };

  // Touch handlers for mobile swipe
  const [touchStart, setTouchStart] = React.useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(diff) > 40) {
      if (diff < 0) {
        setCurrentSlide((prev) => (prev + 1) % n);
      } else {
        setCurrentSlide((prev) => (prev - 1 + n) % n);
      }
    }
    setTouchStart(null);
  };

  return (
    <>
      {/* ================= MOBILE HERO (236px) ================= */}
      <div
        className="hero hero--mobile"
        data-slider
        aria-roledescription="carousel"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="hero__track"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
            display: "flex",
            transition: "transform 0.45s ease",
          }}
        >
          {/* Mobile Slide 1: Free Delivery */}
          <div
            style={{
              flex: "none",
              width: "100%",
              height: "236px",
              boxSizing: "border-box",
              overflow: "hidden",
              background: "#EEF5EE",
              color: "#2F4F30",
              display: "flex",
              alignItems: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                flex: 1,
                padding: "14px 0 14px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                position: "relative",
                zIndex: 1,
              }}
            >
              <span
                style={{
                  fontSize: "56px",
                  fontWeight: 800,
                  lineHeight: 0.92,
                  letterSpacing: "-1px",
                  color: "#E8561E",
                }}
              >
                FREE
              </span>
              <span
                style={{
                  fontSize: "30px",
                  fontWeight: 800,
                  lineHeight: 0.95,
                  letterSpacing: "-0.5px",
                  color: "#2F4F30",
                }}
              >
                DELIVERY
              </span>
              <span
                style={{
                  fontSize: "14px",
                  lineHeight: 1.3,
                  maxWidth: "160px",
                  marginTop: "2px",
                }}
              >
                Delivering to <b>all four quadrants</b> of DC.
              </span>
              <Link
                href="/shop"
                style={{
                  alignSelf: "flex-start",
                  marginTop: "6px",
                  height: "38px",
                  padding: "0 18px",
                  borderRadius: "19px",
                  background: "#5A805B",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  textDecoration: "none",
                }}
              >
                Order now
              </Link>
            </div>

            <svg
              width="176"
              height="220"
              viewBox="0 0 176 220"
              aria-hidden="true"
              style={{ flex: "none", position: "relative", zIndex: 1 }}
            >
              <circle cx="96" cy="112" r="80" fill="#DCEBDB" />
              <g
                fill="none"
                stroke="#5A805B"
                strokeWidth="1.6"
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity="0.5"
              >
                <path d="M-6 150 H182" />
                <path d="M2 150 V60 L6 50 L10 60 V150" />
                <path d="M14 150 V128 H26 V122 L32 117 L38 122 V128 H48 V150" />
                <path d="M60 150 V104 H72 V98 H80 V104 H92 V150" />
                <path d="M170 150 V106 H182" />
                <path d="M126 150 V124 H180 M132 124 V118 H174 V124 M137 118 V113 H169 V118 M139 113 A14 14 0 0 1 167 113 M150 99 H156 V95 L153 90 L150 95 Z" />
              </g>
              <path
                d="M-4 190 C30 188 52 180 76 176 L78 186 C52 190 28 196 -4 196 Z"
                fill="#5A805B"
                opacity="0.25"
              />
              <path
                d="M-2 120 C18 122 6 160 26 172"
                fill="none"
                stroke="#5A805B"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="1 10"
                opacity="0.9"
              />
              <ellipse cx="152" cy="80" rx="22" ry="7" fill="#E8561E" opacity="0.12" />
              <ellipse cx="152" cy="80" rx="12" ry="4" fill="#E8561E" opacity="0.25" />
              <path
                d="M152 80 C142 66 134 58 134 46 A18 18 0 0 1 170 46 C170 58 162 66 152 80 Z"
                fill="#E8561E"
              />
              <circle cx="152" cy="46" r="7" fill="#FFFFFF" />
              <ellipse cx="86" cy="190" rx="62" ry="5" fill="#2F4F30" opacity="0.18" />
              <g transform="translate(0 4)">
                <circle cx="42" cy="168" r="17" fill="#111111" />
                <circle cx="42" cy="168" r="6.5" fill="#C9CFC9" />
                <circle cx="128" cy="168" r="17" fill="#111111" />
                <circle cx="128" cy="168" r="6.5" fill="#C9CFC9" />
                <path
                  d="M121 112 L128 168"
                  stroke="#2B2B2B"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M14 156 C11 136 26 120 50 120 H84 C91 120 93 127 91 134 L87 150 C86 155 82 158 77 158 H20 C17 158 14 158 14 156 Z"
                  fill="#FFFFFF"
                  stroke="#C9D8C8"
                  strokeWidth="1.5"
                />
                <path
                  d="M30 146 H74"
                  stroke="#E9DFD0"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path d="M77 150 H112 L110 160 H74 Z" fill="#EADFCE" />
                <path
                  d="M104 160 C104 134 108 110 114 88 L124 90 C119 112 116 136 114 160 Z"
                  fill="#FFFFFF"
                  stroke="#C9D8C8"
                  strokeWidth="1.5"
                />
                <path
                  d="M109 162 A19 19 0 0 1 147 162 L139 162 A11 11 0 0 0 117 162 Z"
                  fill="#2F4F30"
                />
                <rect x="40" y="111" width="46" height="11" rx="5.5" fill="#2B2B2B" />
                <rect x="11" y="136" width="6" height="10" rx="2" fill="#B8391A" />
                <path
                  d="M58 106 L86 110 C95 111 99 117 97 123 L95 128 L64 125 C57 123 55 114 58 106 Z"
                  fill="#383838"
                />
                <path d="M87 121 L98 119 L100 147 L90 147 Z" fill="#383838" />
                <path
                  d="M87 145 H102 C106 145 107 150 104 152 H87 C86 150 86 147 87 145 Z"
                  fill="#111111"
                />
                <path
                  d="M55 114 C52 100 55 88 63 81 C70 76 81 76 85 83 C89 91 87 104 83 114 Z"
                  fill="#1E1E1E"
                />
                <path
                  d="M66 80 C70 84 78 84 82 79"
                  stroke="#FBF6EE"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M64 65 C64 53 74 47 84 49 C93 51 97 59 95 68 L93 74 C91 77 87 78 81 78 H70 C66 78 64 73 64 65 Z"
                  fill="#FFFFFF"
                  stroke="#C9D8C8"
                  strokeWidth="1.5"
                />
                <path
                  d="M80 57 H95 C96 62 95 67 93 69 H83 C80 69 78 66 78 62 C78 59 78 57 80 57 Z"
                  fill="#1F1F1F"
                />
                <rect x="110" y="84" width="20" height="12" rx="5" fill="#FBF6EE" />
                <path
                  d="M99 91 H124"
                  stroke="#111111"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M70 87 C73 82 81 81 85 85 L93 96 L100 88 L106 92 L97 104 C94 108 89 108 87 105 Z"
                  fill="#1E1E1E"
                />
                <circle
                  cx="130"
                  cy="94"
                  r="6"
                  fill="#FFE7C2"
                  stroke="#FBF6EE"
                  strokeWidth="3"
                />
                <rect x="14" y="78" width="30" height="32" rx="3" fill="#FBF6EE" />
                <path d="M44 78 V110 H34 V78 Z" fill="#F1E8DA" />
                <path
                  d="M12 72 L16 68 L20 72 L24 68 L28 72 L32 68 L36 72 L40 68 L44 72 L46 72 L45 82 H13 L12 72 Z"
                  fill="#2F4F30"
                />
                <path
                  d="M29 88c1.5 3.4 4.6 4.5 4.6 8.5a4.6 4.6 0 0 1-9.2 0c0-2.2 1-3.4 2.3-4.4.2 1.8.9 2.7 1.9 2.7 0-2.7-1.1-4.3.4-6.8z"
                  fill="#E8561E"
                />
              </g>
            </svg>
          </div>

          {/* Mobile Slide 2: Open Late */}
          <div
            style={{
              flex: "none",
              width: "100%",
              height: "236px",
              boxSizing: "border-box",
              overflow: "hidden",
              background:
                "linear-gradient(180deg, #0F2217 0%, #1B3523 45%, #2A4A31 80%, #36593C 100%)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                flex: "none",
                width: "200px",
                padding: "14px 0 14px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "5px",
                position: "relative",
                zIndex: 2,
              }}
            >
              <span
                style={{
                  alignSelf: "flex-start",
                  margin: "-12px 0 8px",
                  background: "#E8561E",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.8px",
                  padding: "4px 10px",
                  borderRadius: "999px",
                }}
              >
                OPEN LATE
              </span>
              <span
                style={{
                  fontSize: "36px",
                  fontWeight: 800,
                  lineHeight: 0.95,
                  letterSpacing: "-1px",
                }}
              >
                LIGHT UP
                <br />
                LATE
              </span>
              <span style={{ fontSize: "13px", lineHeight: 1.35, opacity: 0.9 }}>
                We deliver till 11PM.
              </span>
              <Link
                href="/shop"
                style={{
                  alignSelf: "flex-start",
                  marginTop: "6px",
                  height: "38px",
                  padding: "0 18px",
                  borderRadius: "19px",
                  background: "#FFFFFF",
                  color: "#2F4F30",
                  fontWeight: 700,
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  textDecoration: "none",
                }}
              >
                Order now
              </Link>
            </div>

            <svg
              width="100%"
              height="100%"
              viewBox="0 0 358 236"
              preserveAspectRatio="xMaxYMax meet"
              aria-hidden="true"
              style={{ position: "absolute", inset: 0, zIndex: 1 }}
            >
              <circle cx="300" cy="56" r="26" fill="#FFF4DE" />
              <g
                fill="none"
                stroke="#E9DFC9"
                strokeWidth="1.6"
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity="0.75"
              >
                <path d="M0 234 H358" />
                <path d="M176 234 V204 H188 V198 L194 192 L200 198 V204 H212 V196 H226 V234" />
                <path d="M234 234 V106 L240 92 L246 106 V234" />
                <path d="M284 234 V206 H358 M292 206 V198 H350 V206 M298 198 V190 H344 V198" />
              </g>
              <g fill="#FFC56B" opacity="0.9">
                <rect x="182" y="210" width="3" height="4" />
                <rect x="204" y="212" width="3" height="4" />
                <rect x="258" y="206" width="3" height="4" />
                <rect x="304" y="214" width="3" height="4" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Mobile Dots */}
      <div className="dots hero--mobile-dots">
        {[0, 1].map((idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`Go to slide ${idx + 1}`}
            aria-current={currentSlide === idx ? "true" : "false"}
            onClick={() => goToSlide(idx)}
          >
            <span />
          </button>
        ))}
      </div>

      {/* ================= DESKTOP HERO (400px) ================= */}
      <div
        className="hero hero--desktop"
        data-slider
        aria-roledescription="carousel"
      >
        <div
          className="hero__track"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
            display: "flex",
            transition: "transform 0.45s ease",
          }}
        >
          {/* Desktop Slide 1: Free Delivery */}
          <div
            style={{
              flex: "none",
              width: "100%",
              height: "400px",
              boxSizing: "border-box",
              background: "#EEF5EE",
              color: "#2F4F30",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 30px 0 56px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                position: "relative",
                zIndex: 1,
              }}
            >
              <span
                style={{
                  fontSize: "104px",
                  fontWeight: 800,
                  lineHeight: 0.9,
                  letterSpacing: "-2px",
                  color: "#E8561E",
                }}
              >
                FREE
              </span>
              <span
                style={{
                  fontSize: "62px",
                  fontWeight: 800,
                  lineHeight: 0.95,
                  letterSpacing: "-1px",
                  color: "#2F4F30",
                }}
              >
                DELIVERY
              </span>
              <span
                style={{
                  fontSize: "19px",
                  lineHeight: 1.35,
                  color: "#2F4F30",
                  marginTop: "4px",
                }}
              >
                Delivering to <b>all four quadrants</b> of DC.
              </span>
              <Link
                href="/shop"
                style={{
                  alignSelf: "flex-start",
                  marginTop: "12px",
                  height: "50px",
                  padding: "0 26px",
                  borderRadius: "25px",
                  background: "#5A805B",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "16px",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Order now
              </Link>
            </div>

            <svg
              width="330"
              height="400"
              viewBox="-6 0 188 228"
              aria-hidden="true"
              style={{ flex: "none", position: "relative", zIndex: 1 }}
            >
              <circle cx="96" cy="112" r="80" fill="#DCEBDB" />
              <g
                fill="none"
                stroke="#5A805B"
                strokeWidth="1.6"
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity="0.5"
              >
                <path d="M-6 150 H182" />
                <path d="M2 150 V60 L6 50 L10 60 V150" />
                <path d="M14 150 V128 H26 V122 L32 117 L38 122 V128 H48 V150" />
                <path d="M60 150 V104 H72 V98 H80 V104 H92 V150" />
                <path d="M170 150 V106 H182" />
                <path d="M126 150 V124 H180 M132 124 V118 H174 V124 M137 118 V113 H169 V118 M139 113 A14 14 0 0 1 167 113 M150 99 H156 V95 L153 90 L150 95 Z" />
              </g>
              <path
                d="M-4 190 C30 188 52 180 76 176 L78 186 C52 190 28 196 -4 196 Z"
                fill="#5A805B"
                opacity="0.25"
              />
              <path
                d="M-2 120 C18 122 6 160 26 172"
                fill="none"
                stroke="#5A805B"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="1 10"
                opacity="0.9"
              />
              <ellipse cx="152" cy="80" rx="22" ry="7" fill="#E8561E" opacity="0.12" />
              <ellipse cx="152" cy="80" rx="12" ry="4" fill="#E8561E" opacity="0.25" />
              <path
                d="M152 80 C142 66 134 58 134 46 A18 18 0 0 1 170 46 C170 58 162 66 152 80 Z"
                fill="#E8561E"
              />
              <circle cx="152" cy="46" r="7" fill="#FFFFFF" />
              <ellipse cx="86" cy="190" rx="62" ry="5" fill="#2F4F30" opacity="0.18" />
              <g transform="translate(0 4)">
                <circle cx="42" cy="168" r="17" fill="#111111" />
                <circle cx="42" cy="168" r="6.5" fill="#C9CFC9" />
                <circle cx="128" cy="168" r="17" fill="#111111" />
                <circle cx="128" cy="168" r="6.5" fill="#C9CFC9" />
                <path
                  d="M121 112 L128 168"
                  stroke="#2B2B2B"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M14 156 C11 136 26 120 50 120 H84 C91 120 93 127 91 134 L87 150 C86 155 82 158 77 158 H20 C17 158 14 158 14 156 Z"
                  fill="#FFFFFF"
                  stroke="#C9D8C8"
                  strokeWidth="1.5"
                />
                <path
                  d="M30 146 H74"
                  stroke="#E9DFD0"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path d="M77 150 H112 L110 160 H74 Z" fill="#EADFCE" />
                <path
                  d="M104 160 C104 134 108 110 114 88 L124 90 C119 112 116 136 114 160 Z"
                  fill="#FFFFFF"
                  stroke="#C9D8C8"
                  strokeWidth="1.5"
                />
                <path
                  d="M109 162 A19 19 0 0 1 147 162 L139 162 A11 11 0 0 0 117 162 Z"
                  fill="#2F4F30"
                />
                <rect x="40" y="111" width="46" height="11" rx="5.5" fill="#2B2B2B" />
                <rect x="11" y="136" width="6" height="10" rx="2" fill="#B8391A" />
                <path
                  d="M58 106 L86 110 C95 111 99 117 97 123 L95 128 L64 125 C57 123 55 114 58 106 Z"
                  fill="#383838"
                />
                <path d="M87 121 L98 119 L100 147 L90 147 Z" fill="#383838" />
                <path
                  d="M87 145 H102 C106 145 107 150 104 152 H87 C86 150 86 147 87 145 Z"
                  fill="#111111"
                />
                <path
                  d="M55 114 C52 100 55 88 63 81 C70 76 81 76 85 83 C89 91 87 104 83 114 Z"
                  fill="#1E1E1E"
                />
                <path
                  d="M66 80 C70 84 78 84 82 79"
                  stroke="#FBF6EE"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M64 65 C64 53 74 47 84 49 C93 51 97 59 95 68 L93 74 C91 77 87 78 81 78 H70 C66 78 64 73 64 65 Z"
                  fill="#FFFFFF"
                  stroke="#C9D8C8"
                  strokeWidth="1.5"
                />
                <path
                  d="M80 57 H95 C96 62 95 67 93 69 H83 C80 69 78 66 78 62 C78 59 78 57 80 57 Z"
                  fill="#1F1F1F"
                />
                <rect x="110" y="84" width="20" height="12" rx="5" fill="#FBF6EE" />
                <path
                  d="M99 91 H124"
                  stroke="#111111"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M70 87 C73 82 81 81 85 85 L93 96 L100 88 L106 92 L97 104 C94 108 89 108 87 105 Z"
                  fill="#1E1E1E"
                />
                <circle
                  cx="130"
                  cy="94"
                  r="6"
                  fill="#FFE7C2"
                  stroke="#FBF6EE"
                  strokeWidth="3"
                />
                <rect x="14" y="78" width="30" height="32" rx="3" fill="#FBF6EE" />
                <path d="M44 78 V110 H34 V78 Z" fill="#F1E8DA" />
                <path
                  d="M12 72 L16 68 L20 72 L24 68 L28 72 L32 68 L36 72 L40 68 L44 72 L46 72 L45 82 H13 L12 72 Z"
                  fill="#2F4F30"
                />
                <path
                  d="M29 88c1.5 3.4 4.6 4.5 4.6 8.5a4.6 4.6 0 0 1-9.2 0c0-2.2 1-3.4 2.3-4.4.2 1.8.9 2.7 1.9 2.7 0-2.7-1.1-4.3.4-6.8z"
                  fill="#E8561E"
                />
              </g>
            </svg>
          </div>

          {/* Desktop Slide 2: Open Late */}
          <div
            style={{
              flex: "none",
              width: "100%",
              height: "400px",
              boxSizing: "border-box",
              overflow: "hidden",
              background:
                "linear-gradient(180deg, #0F2217 0%, #1B3523 45%, #2A4A31 80%, #36593C 100%)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              padding: "0 56px",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                position: "relative",
                zIndex: 2,
              }}
            >
              <span
                style={{
                  alignSelf: "flex-start",
                  background: "#E8561E",
                  color: "#FFFFFF",
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "1px",
                  padding: "6px 14px",
                  borderRadius: "999px",
                }}
              >
                OPEN LATE
              </span>
              <span
                style={{
                  fontSize: "80px",
                  fontWeight: 800,
                  lineHeight: 0.92,
                  letterSpacing: "-2px",
                }}
              >
                LIGHT UP
                <br />
                LATE
              </span>
              <span style={{ fontSize: "19px", opacity: 0.95 }}>
                We deliver till 11PM.
              </span>
              <Link
                href="/shop"
                style={{
                  alignSelf: "flex-start",
                  marginTop: "8px",
                  height: "50px",
                  padding: "0 26px",
                  borderRadius: "25px",
                  background: "#FFFFFF",
                  color: "#2F4F30",
                  fontWeight: 700,
                  fontSize: "16px",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Order now
              </Link>
            </div>

            <svg
              width="100%"
              height="100%"
              viewBox="-340 0 698 236"
              preserveAspectRatio="xMaxYMax slice"
              aria-hidden="true"
              style={{ position: "absolute", inset: 0, zIndex: 1 }}
            >
              <circle cx="300" cy="56" r="26" fill="#FFF4DE" />
              <g
                fill="none"
                stroke="#E9DFC9"
                strokeWidth="1.6"
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity="0.75"
              >
                <path d="M-340 234 H0" />
                <path d="M0 234 H358" />
                <path d="M176 234 V204 H188 V198 L194 192 L200 198 V204 H212 V196 H226 V234" />
                <path d="M234 234 V106 L240 92 L246 106 V234" />
                <path d="M284 234 V206 H358 M292 206 V198 H350 V206 M298 198 V190 H344 V198" />
              </g>
              <g fill="#FFC56B" opacity="0.9">
                <rect x="182" y="210" width="3" height="4" />
                <rect x="204" y="212" width="3" height="4" />
                <rect x="258" y="206" width="3" height="4" />
                <rect x="304" y="214" width="3" height="4" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}
