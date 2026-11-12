"use client";

import * as React from "react";
import Link from "next/link";
import { LOCATION_STATES, MORE_AREAS_HREF, type LocationState } from "@/lib/location-groups";
import { useAreaGroups } from "./area-groups";

/**
 * Neighborhood lists grouped by state (client site, Nov 8): homepage tabs, footer and phone menu.
 * Every link stays in the HTML (collapsed sections, hidden tabs) so search engines see them all.
 */

const Pin = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);

const Chevron = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/** Homepage "We Deliver to Your Neighborhood": Washington, DC / Maryland / Virginia tabs */
export function HomeNeighborhoodTabs() {
  const [tab, setTab] = React.useState<LocationState>("DC");
  const LOCATION_GROUPS = useAreaGroups();
  return (
    <section className="hoods" aria-labelledby="hoods-h">
      <div className="sec__head">
        <h2 id="hoods-h">We Deliver to Your Neighborhood</h2>
      </div>
      <p className="hoods__sub">Free delivery across DC. $20 or $40 in Maryland and Virginia. Tap yours.</p>
      <div className="htabs" role="tablist">
        {LOCATION_STATES.map((s) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={tab === s.key}
            className={`htab${tab === s.key ? " is-on" : ""}`}
            onClick={() => setTab(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>
      {LOCATION_STATES.map((s) => (
        <div key={s.key} className="hoods__rail" hidden={tab !== s.key}>
          {LOCATION_GROUPS[s.key].map((a) => (
            <Link key={a.slug} href={`/${a.slug}`}>
              <Pin />
              <span>{a.name}</span>
            </Link>
          ))}
          <Link className="more" href={MORE_AREAS_HREF}>
            <span>+ More areas</span>
          </Link>
        </div>
      ))}
    </section>
  );
}

/** Footer: three collapsed sections with a count */
export function FooterNeighborhoods() {
  const LOCATION_GROUPS = useAreaGroups();
  return (
    <div className="fgrps">
      {LOCATION_STATES.map((s) => (
        <details key={s.key} className="fgrp">
          <summary>
            {s.label}
            <span>{LOCATION_GROUPS[s.key].length}</span>
            <Chevron />
          </summary>
          <div className="areas">
            {LOCATION_GROUPS[s.key].map((a) => (
              <Link key={a.slug} href={`/${a.slug}`}>
                {a.name}
              </Link>
            ))}
            <Link className="more" href={MORE_AREAS_HREF}>
              + More areas
            </Link>
          </div>
        </details>
      ))}
      <p className="fmore-note">Don&apos;t see yours? We deliver anywhere in DC and up to 25 miles into Maryland and Virginia.</p>
    </div>
  );
}

/** Phone menu: Neighborhoods accordion with a collapsed section per state */
export function MenuNeighborhoods({ onNavigate }: { onNavigate?: () => void }) {
  const LOCATION_GROUPS = useAreaGroups();
  return (
    <details className="mnav__acc">
      <summary>
        Neighborhoods
        <Chevron />
      </summary>
      <div className="mgrps">
        {LOCATION_STATES.map((s) => (
          <details key={s.key} className="mgrp">
            <summary>
              {s.label}
              <span>{LOCATION_GROUPS[s.key].length}</span>
              <Chevron />
            </summary>
            <div className="mnav__areas">
              {LOCATION_GROUPS[s.key].map((a) => (
                <Link key={a.slug} href={`/${a.slug}`} onClick={onNavigate}>
                  <Pin />
                  {a.name}
                </Link>
              ))}
              <Link className="more" href={MORE_AREAS_HREF} onClick={onNavigate}>
                + More areas
              </Link>
            </div>
          </details>
        ))}
      </div>
    </details>
  );
}
