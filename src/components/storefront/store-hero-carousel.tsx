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
              style={{ position: "absolute", inset: 0, zIndex: 0 }}
            >
              <defs>
                <radialGradient id="mglow" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0" stopColor="#FFF4DE" stopOpacity="0.45" />
                  <stop offset="1" stopColor="#E9DFC9" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="haze" cx="0.75" cy="1" r="0.8">
                  <stop offset="0" stopColor="#E9DFC9" stopOpacity="0.10" />
                  <stop offset="1" stopColor="#E9DFC9" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="shoot2" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
                  <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.9" />
                </linearGradient>
                <mask id="moonCut2">
                  <rect x="0" y="0" width="358" height="236" fill="#FFFFFF" />
                  <circle cx="312" cy="48" r="24" fill="#000000" />
                </mask>
                <linearGradient id="cityglowM" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#F2B45E" stopOpacity="0" />
                  <stop offset="1" stopColor="#F2B45E" stopOpacity="0.22" />
                </linearGradient>
                <radialGradient id="lampM" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0" stopColor="#FFD58A" stopOpacity="0.75" />
                  <stop offset="1" stopColor="#FFD58A" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="beamM" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#FFE3A8" stopOpacity="0.7" />
                  <stop offset="1" stopColor="#FFE3A8" stopOpacity="0" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="358" height="236" fill="url(#haze)" />
              <g>
                <circle cx="162.3" cy="91.3" r="1.2" fill="#FFFFFF" opacity="0.62" className="tw tw0" />
                <circle cx="303.3" cy="33.6" r="1.6" fill="#FFFFFF" opacity="0.64" />
                <circle cx="218.9" cy="33.0" r="1.2" fill="#FFFFFF" opacity="0.53" />
                <circle cx="35.7" cy="130.3" r="0.8" fill="#FFFFFF" opacity="0.71" />
                <circle cx="142.7" cy="74.7" r="1.6" fill="#FFFFFF" opacity="0.74" className="tw tw1" />
                <circle cx="222.1" cy="133.7" r="0.8" fill="#FFFFFF" opacity="0.39" />
                <circle cx="70.6" cy="41.7" r="0.8" fill="#FFFFFF" opacity="0.82" />
                <circle cx="118.2" cy="96.2" r="1" fill="#FFFFFF" opacity="0.66" />
                <circle cx="228.1" cy="82.0" r="0.8" fill="#FFFFFF" opacity="0.62" className="tw tw2" />
                <circle cx="101.4" cy="159.6" r="0.8" fill="#FFFFFF" opacity="0.77" />
                <circle cx="114.3" cy="39.8" r="1" fill="#FFFFFF" opacity="0.37" />
                <circle cx="201.1" cy="20.8" r="0.8" fill="#FFFFFF" opacity="0.86" />
                <circle cx="139.3" cy="153.5" r="0.8" fill="#FFFFFF" opacity="0.48" className="tw tw0" />
                <circle cx="328.5" cy="12.2" r="1.2" fill="#FFFFFF" opacity="0.94" />
                <circle cx="143.1" cy="15.4" r="1" fill="#FFFFFF" opacity="0.82" />
                <circle cx="98.4" cy="17.6" r="1" fill="#FFFFFF" opacity="0.36" />
                <circle cx="147.5" cy="148.0" r="1" fill="#FFFFFF" opacity="0.50" className="tw tw1" />
                <circle cx="39.4" cy="13.3" r="1.2" fill="#FFFFFF" opacity="0.46" />
                <circle cx="199.8" cy="73.8" r="1" fill="#FFFFFF" opacity="0.94" />
                <circle cx="273.3" cy="69.4" r="1.2" fill="#FFFFFF" opacity="0.42" />
                <circle cx="151.3" cy="37.2" r="1" fill="#FFFFFF" opacity="0.87" className="tw tw2" />
                <circle cx="345.2" cy="96.5" r="0.8" fill="#FFFFFF" opacity="0.48" />
                <circle cx="142.0" cy="137.3" r="1.6" fill="#FFFFFF" opacity="0.41" />
                <circle cx="350.3" cy="37.3" r="1" fill="#FFFFFF" opacity="0.36" />
                <circle cx="217.6" cy="133.5" r="1.2" fill="#FFFFFF" opacity="0.39" className="tw tw0" />
                <circle cx="35.5" cy="94.9" r="1" fill="#FFFFFF" opacity="0.36" />
                <circle cx="133.0" cy="101.1" r="1" fill="#FFFFFF" opacity="0.93" />
                <circle cx="173.3" cy="93.6" r="1.2" fill="#FFFFFF" opacity="0.46" />
                <circle cx="57.9" cy="145.7" r="1.6" fill="#FFFFFF" opacity="0.50" className="tw tw1" />
                <circle cx="70.4" cy="119.4" r="1.6" fill="#FFFFFF" opacity="0.47" />
                <circle cx="336.5" cy="141.6" r="1.6" fill="#FFFFFF" opacity="0.40" />
                <circle cx="20.6" cy="21.0" r="1.6" fill="#FFFFFF" opacity="0.93" />
                <circle cx="87.4" cy="113.9" r="1" fill="#FFFFFF" opacity="0.60" className="tw tw2" />
                <circle cx="320.7" cy="80.6" r="1.6" fill="#FFFFFF" opacity="0.46" />
                <circle cx="256.1" cy="14.7" r="1" fill="#FFFFFF" opacity="0.64" />
                <circle cx="232.7" cy="100.1" r="0.8" fill="#FFFFFF" opacity="0.52" />
                <circle cx="325.1" cy="35.8" r="0.8" fill="#FFFFFF" opacity="0.39" className="tw tw0" />
                <circle cx="148.0" cy="42.9" r="0.8" fill="#FFFFFF" opacity="0.46" />
                <circle cx="133.1" cy="93.3" r="1" fill="#FFFFFF" opacity="0.41" />
                <circle cx="52.4" cy="74.3" r="1" fill="#FFFFFF" opacity="0.74" />
                <circle cx="245.9" cy="95.2" r="1" fill="#FFFFFF" opacity="0.70" className="tw tw1" />
                <circle cx="327.3" cy="78.1" r="1" fill="#FFFFFF" opacity="0.77" />
                <circle cx="341.0" cy="7.3" r="0.8" fill="#FFFFFF" opacity="0.64" />
                <circle cx="259.7" cy="53.7" r="0.8" fill="#FFFFFF" opacity="0.40" />
                <circle cx="195.1" cy="119.0" r="1" fill="#FFFFFF" opacity="0.83" className="tw tw2" />
                <circle cx="324.3" cy="58.9" r="1.2" fill="#FFFFFF" opacity="0.89" />
                <circle cx="308.9" cy="69.1" r="0.8" fill="#FFFFFF" opacity="0.87" />
                <circle cx="204.5" cy="101.5" r="1.2" fill="#FFFFFF" opacity="0.58" />
                <circle cx="8.4" cy="15.3" r="0.8" fill="#FFFFFF" opacity="0.73" className="tw tw0" />
                <circle cx="351.7" cy="141.2" r="1" fill="#FFFFFF" opacity="0.58" />
                <circle cx="261.3" cy="94.6" r="1.2" fill="#FFFFFF" opacity="0.63" />
                <circle cx="193.4" cy="84.9" r="1.6" fill="#FFFFFF" opacity="0.37" />
              </g>
              <path d="M168 22 L212 38" stroke="url(#shoot2)" strokeWidth="2" strokeLinecap="round" />
              <circle cx="300" cy="56" r="58" fill="url(#mglow)" />
              <circle cx="300" cy="56" r="26" fill="#FFF4DE" mask="url(#moonCut2)" />
              <g fill="none" stroke="#E9DFC9" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" opacity="0.75">
                <path d="M0 234 H358" />
                <path d="M0 234 V220 H16 V214 H30 V220 H42 V212 H58 V234" />
                <path d="M176 234 V204 H188 V198 L194 192 L200 198 V204 H212 V196 H226 V234 M188 204 V234 M212 204 V234" />
                <path d="M234 234 V106 L240 92 L246 106 V234" />
                <path d="M254 234 V200 H262 V188 H274 V200 H280 V234" />
                <path d="M284 234 V206 H358 M292 206 V198 H350 V206 M298 198 V190 H344 V198 M301 190 A20 20 0 0 1 341 190 M316 170 H326 V164 L321 156 L316 164 Z" />
                <path d="M300 206 V234 M312 206 V234 M330 206 V234 M342 206 V234" />
              </g>
              <g fill="#FFC56B" opacity="0.9">
                <rect x="182" y="210" width="3" height="4" />
                <rect x="204" y="212" width="3" height="4" />
                <rect x="218" y="202" width="3" height="4" />
                <rect x="218" y="214" width="3" height="4" />
                <rect x="258" y="206" width="3" height="4" />
                <rect x="268" y="194" width="3" height="4" />
                <rect x="304" y="214" width="3" height="4" />
                <rect x="334" y="214" width="3" height="4" />
                <rect x="20" y="224" width="3" height="4" />
                <rect x="48" y="218" width="3" height="4" />
              </g>
              <g>
                <rect x="-340" y="150" width="698" height="86" fill="url(#cityglowM)" />
                <g fill="#E6EFE4" opacity="0.16">
                  <ellipse cx="262" cy="74" rx="34" ry="7" />
                  <ellipse cx="282" cy="68" rx="20" ry="6" />
                  <ellipse cx="336" cy="30" rx="26" ry="5" />
                  <ellipse cx="-150" cy="60" rx="40" ry="7" />
                  <ellipse cx="-128" cy="54" rx="22" ry="6" />
                </g>
                <g fill="#FFF6E0">
                  <path d="M150 26 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4z" opacity="0.9" />
                  <path d="M208 74 l1 3 3 1 -3 1 -1 3 -1 -3 -3 -1 3 -1z" opacity="0.8" />
                  <path d="M352 112 l1 3 3 1 -3 1 -1 3 -1 -3 -3 -1 3 -1z" opacity="0.7" />
                  <path d="M-110 30 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4z" opacity="0.85" />
                  <path d="M-40 96 l1 3 3 1 -3 1 -1 3 -1 -3 -3 -1 3 -1z" opacity="0.7" />
                  <path d="M-250 70 l1 3 3 1 -3 1 -1 3 -1 -3 -3 -1 3 -1z" opacity="0.7" />
                </g>
                <g fill="#FFC56B">
                  <rect x="180" y="208" width="3" height="4" />
                  <rect x="180" y="220" width="3" height="4" />
                  <rect x="216" y="204" width="3" height="4" />
                  <rect x="216" y="216" width="3" height="4" />
                  <rect x="220" y="226" width="3" height="4" />
                  <rect x="258" y="194" width="3" height="4" />
                  <rect x="266" y="206" width="3" height="4" />
                  <rect x="272" y="218" width="3" height="4" />
                  <rect x="292" y="212" width="3" height="4" />
                  <rect x="304" y="222" width="3" height="4" />
                  <rect x="320" y="212" width="3" height="4" />
                  <rect x="334" y="222" width="3" height="4" />
                  <rect x="348" y="212" width="3" height="4" />
                  <rect x="6" y="224" width="3" height="4" />
                  <rect x="34" y="218" width="3" height="4" />
                  <rect x="48" y="216" width="3" height="4" />
                  <rect x="-100" y="224" width="3" height="4" />
                  <rect x="-70" y="218" width="3" height="4" />
                </g>
                <g>
                  <circle cx="165" cy="212" r="12" fill="url(#lampM)" />
                  <circle cx="252" cy="212" r="12" fill="url(#lampM)" />
                  <circle cx="-180" cy="212" r="12" fill="url(#lampM)" />
                  <g stroke="#E9DFC9" strokeWidth="1.4" strokeLinecap="round" opacity="0.85">
                    <path d="M165 234 V213 M165 213 h3" />
                    <path d="M252 234 V213 M252 213 h-3" />
                    <path d="M-180 234 V213 M-180 213 h3" />
                  </g>
                  <g fill="#FFE3A8">
                    <circle cx="168" cy="214" r="1.6" />
                    <circle cx="249" cy="214" r="1.6" />
                    <circle cx="-177" cy="214" r="1.6" />
                  </g>
                </g>
                <g transform="translate(112 0)">
                  <path d="M30 226 L64 219 L64 233 Z" fill="url(#beamM)" />
                  <g fill="none" stroke="#E9DFC9" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="10" cy="230.5" r="3.5" />
                    <circle cx="26" cy="230.5" r="3.5" />
                    <path d="M10 230.5 H22 L26 222 H29 M24 222 L27 230.5" />
                    <path d="M8 224 H16 V230" />
                    <path d="M13 224 L16 216 L20 217 L22 222" />
                  </g>
                  <circle cx="18" cy="213" r="3" fill="#E9DFC9" />
                  <circle cx="29.5" cy="225.5" r="1.4" fill="#FFE3A8" />
                  <rect x="6" y="219" width="7" height="5" rx="1" fill="#E8561E" />
                </g>
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
              style={{ position: "absolute", inset: 0, zIndex: 0 }}
            >
              <defs>
                <radialGradient id="mglowD" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0" stopColor="#FFF4DE" stopOpacity="0.45" />
                  <stop offset="1" stopColor="#E9DFC9" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="hazeD" cx="0.75" cy="1" r="0.8">
                  <stop offset="0" stopColor="#E9DFC9" stopOpacity="0.10" />
                  <stop offset="1" stopColor="#E9DFC9" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="shoot2D" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
                  <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.9" />
                </linearGradient>
                <mask id="moonCutD">
                  <rect x="0" y="0" width="358" height="236" fill="#FFFFFF" />
                  <circle cx="312" cy="48" r="24" fill="#000000" />
                </mask>
                <linearGradient id="cityglowD" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#F2B45E" stopOpacity="0" />
                  <stop offset="1" stopColor="#F2B45E" stopOpacity="0.22" />
                </linearGradient>
                <radialGradient id="lampD" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0" stopColor="#FFD58A" stopOpacity="0.75" />
                  <stop offset="1" stopColor="#FFD58A" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="beamD" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#FFE3A8" stopOpacity="0.7" />
                  <stop offset="1" stopColor="#FFE3A8" stopOpacity="0" />
                </linearGradient>
              </defs>
              <rect x="-340" y="0" width="698" height="236" fill="url(#hazeD)" />
              <g>
                <circle cx="-9.2" cy="189.9" r="0.8" fill="#FFFFFF" opacity="0.31" />
                <circle cx="-84.6" cy="78.3" r="1" fill="#FFFFFF" opacity="0.37" />
                <circle cx="-98.6" cy="91.1" r="0.8" fill="#FFFFFF" opacity="0.64" />
                <circle cx="-12.0" cy="24.8" r="1.2" fill="#FFFFFF" opacity="0.57" />
                <circle cx="-119.6" cy="127.0" r="1" fill="#FFFFFF" opacity="0.50" />
                <circle cx="-115.0" cy="157.5" r="1.2" fill="#FFFFFF" opacity="0.50" />
                <circle cx="-101.0" cy="46.3" r="1.2" fill="#FFFFFF" opacity="0.50" />
                <circle cx="-29.3" cy="76.3" r="1.2" fill="#FFFFFF" opacity="0.45" />
                <circle cx="-3.1" cy="116.3" r="1" fill="#FFFFFF" opacity="0.40" />
                <circle cx="-63.1" cy="159.1" r="1.2" fill="#FFFFFF" opacity="0.65" />
                <circle cx="-99.8" cy="39.0" r="1" fill="#FFFFFF" opacity="0.67" />
                <circle cx="-58.6" cy="118.1" r="0.8" fill="#FFFFFF" opacity="0.35" />
                <circle cx="-117.3" cy="58.0" r="1.2" fill="#FFFFFF" opacity="0.45" />
                <circle cx="-50.0" cy="25.4" r="1" fill="#FFFFFF" opacity="0.60" />
                <circle cx="-12.9" cy="93.1" r="0.8" fill="#FFFFFF" opacity="0.44" />
                <circle cx="-108.9" cy="157.6" r="1.2" fill="#FFFFFF" opacity="0.74" />
                <circle cx="-61.9" cy="68.3" r="0.8" fill="#FFFFFF" opacity="0.81" />
                <circle cx="-49.7" cy="189.3" r="0.8" fill="#FFFFFF" opacity="0.55" />
                <circle cx="162.3" cy="91.3" r="1.2" fill="#FFFFFF" opacity="0.62" className="tw tw0" />
                <circle cx="303.3" cy="33.6" r="1.6" fill="#FFFFFF" opacity="0.64" />
                <circle cx="218.9" cy="33.0" r="1.2" fill="#FFFFFF" opacity="0.53" />
                <circle cx="35.7" cy="130.3" r="0.8" fill="#FFFFFF" opacity="0.71" />
                <circle cx="142.7" cy="74.7" r="1.6" fill="#FFFFFF" opacity="0.74" className="tw tw1" />
                <circle cx="222.1" cy="133.7" r="0.8" fill="#FFFFFF" opacity="0.39" />
                <circle cx="70.6" cy="41.7" r="0.8" fill="#FFFFFF" opacity="0.82" />
                <circle cx="118.2" cy="96.2" r="1" fill="#FFFFFF" opacity="0.66" />
                <circle cx="228.1" cy="82.0" r="0.8" fill="#FFFFFF" opacity="0.62" className="tw tw2" />
                <circle cx="101.4" cy="159.6" r="0.8" fill="#FFFFFF" opacity="0.77" />
                <circle cx="114.3" cy="39.8" r="1" fill="#FFFFFF" opacity="0.37" />
                <circle cx="201.1" cy="20.8" r="0.8" fill="#FFFFFF" opacity="0.86" />
                <circle cx="139.3" cy="153.5" r="0.8" fill="#FFFFFF" opacity="0.48" className="tw tw0" />
                <circle cx="328.5" cy="12.2" r="1.2" fill="#FFFFFF" opacity="0.94" />
                <circle cx="143.1" cy="15.4" r="1" fill="#FFFFFF" opacity="0.82" />
                <circle cx="98.4" cy="17.6" r="1" fill="#FFFFFF" opacity="0.36" />
                <circle cx="147.5" cy="148.0" r="1" fill="#FFFFFF" opacity="0.50" className="tw tw1" />
                <circle cx="39.4" cy="13.3" r="1.2" fill="#FFFFFF" opacity="0.46" />
                <circle cx="199.8" cy="73.8" r="1" fill="#FFFFFF" opacity="0.94" />
                <circle cx="273.3" cy="69.4" r="1.2" fill="#FFFFFF" opacity="0.42" />
                <circle cx="151.3" cy="37.2" r="1" fill="#FFFFFF" opacity="0.87" className="tw tw2" />
                <circle cx="345.2" cy="96.5" r="0.8" fill="#FFFFFF" opacity="0.48" />
                <circle cx="142.0" cy="137.3" r="1.6" fill="#FFFFFF" opacity="0.41" />
                <circle cx="350.3" cy="37.3" r="1" fill="#FFFFFF" opacity="0.36" />
                <circle cx="217.6" cy="133.5" r="1.2" fill="#FFFFFF" opacity="0.39" className="tw tw0" />
                <circle cx="35.5" cy="94.9" r="1" fill="#FFFFFF" opacity="0.36" />
                <circle cx="133.0" cy="101.1" r="1" fill="#FFFFFF" opacity="0.93" />
                <circle cx="173.3" cy="93.6" r="1.2" fill="#FFFFFF" opacity="0.46" />
                <circle cx="57.9" cy="145.7" r="1.6" fill="#FFFFFF" opacity="0.50" className="tw tw1" />
                <circle cx="70.4" cy="119.4" r="1.6" fill="#FFFFFF" opacity="0.47" />
                <circle cx="336.5" cy="141.6" r="1.6" fill="#FFFFFF" opacity="0.40" />
                <circle cx="20.6" cy="21.0" r="1.6" fill="#FFFFFF" opacity="0.93" />
                <circle cx="87.4" cy="113.9" r="1" fill="#FFFFFF" opacity="0.60" className="tw tw2" />
                <circle cx="320.7" cy="80.6" r="1.6" fill="#FFFFFF" opacity="0.46" />
                <circle cx="256.1" cy="14.7" r="1" fill="#FFFFFF" opacity="0.64" />
                <circle cx="232.7" cy="100.1" r="0.8" fill="#FFFFFF" opacity="0.52" />
                <circle cx="325.1" cy="35.8" r="0.8" fill="#FFFFFF" opacity="0.39" className="tw tw0" />
                <circle cx="148.0" cy="42.9" r="0.8" fill="#FFFFFF" opacity="0.46" />
                <circle cx="133.1" cy="93.3" r="1" fill="#FFFFFF" opacity="0.41" />
                <circle cx="52.4" cy="74.3" r="1" fill="#FFFFFF" opacity="0.74" />
                <circle cx="245.9" cy="95.2" r="1" fill="#FFFFFF" opacity="0.70" className="tw tw1" />
                <circle cx="327.3" cy="78.1" r="1" fill="#FFFFFF" opacity="0.77" />
                <circle cx="341.0" cy="7.3" r="0.8" fill="#FFFFFF" opacity="0.64" />
                <circle cx="259.7" cy="53.7" r="0.8" fill="#FFFFFF" opacity="0.40" />
                <circle cx="195.1" cy="119.0" r="1" fill="#FFFFFF" opacity="0.83" className="tw tw2" />
                <circle cx="324.3" cy="58.9" r="1.2" fill="#FFFFFF" opacity="0.89" />
                <circle cx="308.9" cy="69.1" r="0.8" fill="#FFFFFF" opacity="0.87" />
                <circle cx="204.5" cy="101.5" r="1.2" fill="#FFFFFF" opacity="0.58" />
                <circle cx="8.4" cy="15.3" r="0.8" fill="#FFFFFF" opacity="0.73" className="tw tw0" />
                <circle cx="351.7" cy="141.2" r="1" fill="#FFFFFF" opacity="0.58" />
                <circle cx="261.3" cy="94.6" r="1.2" fill="#FFFFFF" opacity="0.63" />
                <circle cx="193.4" cy="84.9" r="1.6" fill="#FFFFFF" opacity="0.37" />
              </g>
              <g>
                <circle cx="-269.3" cy="35.3" r="1.2" fill="#FFFFFF" opacity="0.32" />
                <circle cx="-163.9" cy="24.3" r="1.2" fill="#FFFFFF" opacity="0.33" />
                <circle cx="-230.4" cy="13.3" r="1.0" fill="#FFFFFF" opacity="0.49" />
                <circle cx="-287.0" cy="112.9" r="0.8" fill="#FFFFFF" opacity="0.67" />
                <circle cx="-311.8" cy="49.3" r="1.2" fill="#FFFFFF" opacity="0.56" />
                <circle cx="-324.9" cy="119.6" r="0.8" fill="#FFFFFF" opacity="0.74" />
                <circle cx="-328.1" cy="172.5" r="1.0" fill="#FFFFFF" opacity="0.49" />
                <circle cx="-223.4" cy="116.8" r="1.2" fill="#FFFFFF" opacity="0.67" />
                <circle cx="-299.7" cy="118.8" r="1.2" fill="#FFFFFF" opacity="0.38" />
                <circle cx="-317.3" cy="144.1" r="1.2" fill="#FFFFFF" opacity="0.33" />
                <circle cx="-294.3" cy="138.0" r="1.0" fill="#FFFFFF" opacity="0.65" />
                <circle cx="-239.3" cy="185.1" r="1.0" fill="#FFFFFF" opacity="0.43" />
                <circle cx="-169.6" cy="141.6" r="0.8" fill="#FFFFFF" opacity="0.34" />
                <circle cx="-274.3" cy="102.1" r="1.0" fill="#FFFFFF" opacity="0.63" />
                <circle cx="-277.0" cy="196.2" r="0.8" fill="#FFFFFF" opacity="0.53" />
                <circle cx="-303.0" cy="72.4" r="1.0" fill="#FFFFFF" opacity="0.49" />
                <circle cx="-134.1" cy="21.1" r="1.2" fill="#FFFFFF" opacity="0.56" />
                <circle cx="-152.4" cy="66.9" r="1.2" fill="#FFFFFF" opacity="0.46" />
                <circle cx="-232.7" cy="160.6" r="0.8" fill="#FFFFFF" opacity="0.68" />
                <circle cx="-137.7" cy="98.0" r="1.2" fill="#FFFFFF" opacity="0.33" />
                <circle cx="-183.0" cy="66.1" r="1.2" fill="#FFFFFF" opacity="0.75" />
                <circle cx="-163.8" cy="61.2" r="1.0" fill="#FFFFFF" opacity="0.70" />
              </g>
              <path d="M168 22 L212 38" stroke="url(#shoot2D)" strokeWidth="2" strokeLinecap="round" />
              <circle cx="300" cy="56" r="58" fill="url(#mglowD)" />
              <circle cx="300" cy="56" r="26" fill="#FFF4DE" mask="url(#moonCutD)" />
              <g fill="none" stroke="#E9DFC9" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" opacity="0.75">
                <path d="M-340 234 H0 M-124 234 V222 H-104 V216 H-90 V222 H-76 V212 H-60 V234 M-40 234 V224 H-20 V234" />
                <path d="M0 234 H358" />
                <path d="M0 234 V220 H16 V214 H30 V220 H42 V212 H58 V234" />
                <path d="M176 234 V204 H188 V198 L194 192 L200 198 V204 H212 V196 H226 V234 M188 204 V234 M212 204 V234" />
                <path d="M234 234 V106 L240 92 L246 106 V234" />
                <path d="M254 234 V200 H262 V188 H274 V200 H280 V234" />
                <path d="M284 234 V206 H358 M292 206 V198 H350 V206 M298 198 V190 H344 V198 M301 190 A20 20 0 0 1 341 190 M316 170 H326 V164 L321 156 L316 164 Z" />
                <path d="M300 206 V234 M312 206 V234 M330 206 V234 M342 206 V234" />
              </g>
              <g fill="#FFC56B" opacity="0.9">
                <rect x="182" y="210" width="3" height="4" />
                <rect x="204" y="212" width="3" height="4" />
                <rect x="218" y="202" width="3" height="4" />
                <rect x="218" y="214" width="3" height="4" />
                <rect x="258" y="206" width="3" height="4" />
                <rect x="268" y="194" width="3" height="4" />
                <rect x="304" y="214" width="3" height="4" />
                <rect x="334" y="214" width="3" height="4" />
                <rect x="20" y="224" width="3" height="4" />
                <rect x="48" y="218" width="3" height="4" />
              </g>
              <g>
                <rect x="-340" y="150" width="698" height="86" fill="url(#cityglowD)" />
                <g fill="#E6EFE4" opacity="0.16">
                  <ellipse cx="262" cy="74" rx="34" ry="7" />
                  <ellipse cx="282" cy="68" rx="20" ry="6" />
                  <ellipse cx="336" cy="30" rx="26" ry="5" />
                  <ellipse cx="-150" cy="60" rx="40" ry="7" />
                  <ellipse cx="-128" cy="54" rx="22" ry="6" />
                </g>
                <g fill="#FFF6E0">
                  <path d="M150 26 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4z" opacity="0.9" />
                  <path d="M208 74 l1 3 3 1 -3 1 -1 3 -1 -3 -3 -1 3 -1z" opacity="0.8" />
                  <path d="M352 112 l1 3 3 1 -3 1 -1 3 -1 -3 -3 -1 3 -1z" opacity="0.7" />
                  <path d="M-110 30 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4z" opacity="0.85" />
                  <path d="M-40 96 l1 3 3 1 -3 1 -1 3 -1 -3 -3 -1 3 -1z" opacity="0.7" />
                  <path d="M-250 70 l1 3 3 1 -3 1 -1 3 -1 -3 -3 -1 3 -1z" opacity="0.7" />
                </g>
                <g fill="#FFC56B">
                  <rect x="180" y="208" width="3" height="4" />
                  <rect x="180" y="220" width="3" height="4" />
                  <rect x="216" y="204" width="3" height="4" />
                  <rect x="216" y="216" width="3" height="4" />
                  <rect x="220" y="226" width="3" height="4" />
                  <rect x="258" y="194" width="3" height="4" />
                  <rect x="266" y="206" width="3" height="4" />
                  <rect x="272" y="218" width="3" height="4" />
                  <rect x="292" y="212" width="3" height="4" />
                  <rect x="304" y="222" width="3" height="4" />
                  <rect x="320" y="212" width="3" height="4" />
                  <rect x="334" y="222" width="3" height="4" />
                  <rect x="348" y="212" width="3" height="4" />
                  <rect x="6" y="224" width="3" height="4" />
                  <rect x="34" y="218" width="3" height="4" />
                  <rect x="48" y="216" width="3" height="4" />
                  <rect x="-100" y="224" width="3" height="4" />
                  <rect x="-70" y="218" width="3" height="4" />
                </g>
                <g>
                  <circle cx="165" cy="212" r="12" fill="url(#lampD)" />
                  <circle cx="252" cy="212" r="12" fill="url(#lampD)" />
                  <circle cx="-180" cy="212" r="12" fill="url(#lampD)" />
                  <g stroke="#E9DFC9" strokeWidth="1.4" strokeLinecap="round" opacity="0.85">
                    <path d="M165 234 V213 M165 213 h3" />
                    <path d="M252 234 V213 M252 213 h-3" />
                    <path d="M-180 234 V213 M-180 213 h3" />
                  </g>
                  <g fill="#FFE3A8">
                    <circle cx="168" cy="214" r="1.6" />
                    <circle cx="249" cy="214" r="1.6" />
                    <circle cx="-177" cy="214" r="1.6" />
                  </g>
                </g>
                <g transform="translate(112 0)">
                  <path d="M30 226 L64 219 L64 233 Z" fill="url(#beamD)" />
                  <g fill="none" stroke="#E9DFC9" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="10" cy="230.5" r="3.5" />
                    <circle cx="26" cy="230.5" r="3.5" />
                    <path d="M10 230.5 H22 L26 222 H29 M24 222 L27 230.5" />
                    <path d="M8 224 H16 V230" />
                    <path d="M13 224 L16 216 L20 217 L22 222" />
                  </g>
                  <circle cx="18" cy="213" r="3" fill="#E9DFC9" />
                  <circle cx="29.5" cy="225.5" r="1.4" fill="#FFE3A8" />
                  <rect x="6" y="219" width="7" height="5" rx="1" fill="#E8561E" />
                </g>
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Desktop Dots */}
      <div className="dots hero--desktop-dots">
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
    </>
  );
}
