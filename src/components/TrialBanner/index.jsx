import React from "react";
import { DEMO_PATH, FREE_TRIAL_PATH } from "../DemoCta/paths";
import "./style.scss";

export const TRIAL_COPY = {
  eyebrow: "Self-hosted data lakehouse",
  title: "Try IOMETE free for 60 days",
  body: "Full access to the platform with no vCPU cap. It runs on your own infrastructure, so your data never leaves your network.",
  primary: "Start free trial",
  secondary: "Talk to a data architect",
};

// Docs keep the DemoCta `ref`/`cta` convention; blog keeps the BlogCTA UTM
// convention with its own medium, so the banner and the slim in-article CTA
// can be told apart in analytics.
function query(placement, page) {
  if (placement === "blog") {
    const campaign = encodeURIComponent(page || "blog");
    return `?utm_source=blog&utm_medium=end_of_post_banner&utm_campaign=${campaign}`;
  }
  const ref = encodeURIComponent(`docs-${page || "page"}`);
  return `?ref=${ref}&cta=trial-banner-end`;
}

/**
 * 60-day free trial banner, appended to the end of blog posts and docs pages
 * by plugins/remark-trial-banner.js. On blog posts it is an addition to the
 * slim in-article BlogCTA, not a replacement.
 *
 * Line-only design: a hairline frame with short corner marks and a hairline
 * divider before the actions. No fill and no artwork.
 */
export default function TrialBanner({ page, placement = "docs" }) {
  const q = query(placement, page);

  return (
    <aside
      className={`trial-banner trial-banner--${placement}`}
      data-cta="trial-banner"
      aria-label="IOMETE 60-day free trial"
    >
      <div className="trial-banner__copy">
        <p className="trial-banner__eyebrow">{TRIAL_COPY.eyebrow}</p>
        <p className="trial-banner__title">{TRIAL_COPY.title}</p>
        <p className="trial-banner__body">{TRIAL_COPY.body}</p>
      </div>
      <div className="trial-banner__actions">
        <a
          className="iomete-btn trial-banner__btn"
          data-cta-type="free"
          href={FREE_TRIAL_PATH + q}
        >
          {TRIAL_COPY.primary}
          <span className="trial-banner__arrow" aria-hidden="true">
            →
          </span>
        </a>
        <a
          className="trial-banner__link"
          data-cta-type="demo"
          href={DEMO_PATH + q}
        >
          {TRIAL_COPY.secondary} →
        </a>
      </div>
    </aside>
  );
}
