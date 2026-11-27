import React from "react";
import { FREE_TRIAL_PATH } from "../DemoCta/paths";
import "./style.scss";

export const TRIAL_COPY = {
  eyebrow: "Free trial",
  title: "Try IOMETE free for 60 days",
  body: "Full access to the platform with no vCPU cap. It runs on your own infrastructure, so your data never leaves your network.",
  primary: "Start free trial",
};

// Flat-top hexagon lattice, the same motif as the brand hex matrix: hairline
// cells, a dot in each centre, one fluoro cell. R is the cell radius in px.
const R = 16;
const H = +(Math.sqrt(3) * R).toFixed(2);
const TILE_W = 3 * R;
const LATTICE = [
  `M0 ${H / 2}L${R / 2} 0H${1.5 * R}L${2 * R} ${H / 2}L${1.5 * R} ${H}H${R / 2}Z`,
  `M${2 * R} ${H / 2}H${3 * R}`,
].join("");
// Centre of the accent cell: column 5, row 3 of the lattice.
const ACCENT_X = 5 * TILE_W + R;
const ACCENT_Y = 3 * H + H / 2;
const ACCENT = [
  [-R, 0],
  [-R / 2, -H / 2],
  [R / 2, -H / 2],
  [R, 0],
  [R / 2, H / 2],
  [-R / 2, H / 2],
]
  .map(([x, y]) => `${ACCENT_X + x},${(ACCENT_Y + y).toFixed(2)}`)
  .join(" ");

function HexLattice() {
  return (
    <svg
      className="trial-banner__art"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMaxYMid slice"
      viewBox={`0 0 ${8 * TILE_W} ${8 * H}`}
    >
      <defs>
        <pattern
          id="trial-banner-hex"
          width={TILE_W}
          height={H}
          patternUnits="userSpaceOnUse"
        >
          <path className="trial-banner__line" d={LATTICE} />
          <circle className="trial-banner__dot" cx={R} cy={H / 2} r="1" />
          <circle className="trial-banner__dot" cx={2.5 * R} cy="0" r="1" />
          <circle className="trial-banner__dot" cx={2.5 * R} cy={H} r="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#trial-banner-hex)" />
      <polygon className="trial-banner__accent" points={ACCENT} />
    </svg>
  );
}

function docsQuery(page) {
  const ref = `docs-${page || "page"}`;
  return `?ref=${encodeURIComponent(ref)}&cta=trial-banner-end`;
}

/**
 * 60-day free trial banner for blog posts and docs pages.
 *
 * Blog posts get it mid-article through BlogCTA (plugins/remark-blog-cta.js),
 * which passes a UTM-tagged `href` and a `secondary` link. Docs pages get it
 * at the end of the page through plugins/remark-docs-trial-banner.js, which
 * passes `page` for the `ref` query value (same convention as DemoCta).
 *
 * Surface, type and button match the CTA card on iomete.com. The hex lattice
 * is decorative and hidden on narrow screens.
 */
export default function TrialBanner({ href, page, secondary, placement = "docs" }) {
  const primaryHref = href || FREE_TRIAL_PATH + docsQuery(page);

  return (
    <aside
      className={`trial-banner trial-banner--${placement}`}
      data-cta="trial-banner"
      aria-label="IOMETE 60-day free trial"
    >
      <HexLattice />
      <div className="trial-banner__content">
        <p className="trial-banner__eyebrow">{TRIAL_COPY.eyebrow}</p>
        <p className="trial-banner__title">{TRIAL_COPY.title}</p>
        <p className="trial-banner__body">{TRIAL_COPY.body}</p>
        <p className="trial-banner__actions">
          <a
            className="iomete-btn trial-banner__btn"
            data-cta-type="free"
            href={primaryHref}
          >
            {TRIAL_COPY.primary}
            <span className="trial-banner__arrow" aria-hidden="true">
              →
            </span>
          </a>
          {secondary && secondary.href && (
            <a
              className="trial-banner__link"
              data-cta-type="secondary"
              href={secondary.href}
            >
              {secondary.label}
            </a>
          )}
        </p>
      </div>
    </aside>
  );
}
