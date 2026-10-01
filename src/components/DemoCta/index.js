import React from "react";
import { DEMO_PATH, FREE_PLAN_PATH } from "./paths";
// Styles live in ./style.scss and are pulled in from src/css/custom.scss so
// the navbar can share .iomete-btn on pages that do not render this component.

const COPY = {
  A: {
    title: "Run Spark and Iceberg on your own infrastructure",
    body: "IOMETE is a self-hosted data lakehouse: SQL, Spark jobs, streaming and notebooks on Apache Iceberg. It runs on your own Kubernetes, on-premises, in your cloud account or air-gapped.",
    secondary: "Try the free plan →",
  },
  B: {
    title: "Evaluating a lakehouse for on-prem or sovereign data?",
    body: "See IOMETE running in an environment like yours. It's a 30-minute walkthrough with a data architect, focused on your deployment and use case.",
    secondary: "Or start with the free plan →",
  },
};

function query({ page, refId, variant, position }) {
  const ref = refId || `docs-${page}`;
  return `?ref=${encodeURIComponent(ref)}&cta=${encodeURIComponent(`${variant}-${position}`)}`;
}

/**
 * Demo-first call to action. Book a demo is the primary action; the free
 * plan is the secondary link. Change DEMO_PATH in ./paths.js to point every
 * placement (including the navbar) at /demo when that page exists.
 *
 * `refId` sets the ref query value as-is (blog and solution drafts).
 * `page` is prefixed with `docs-` (reference and guide pages).
 */
export default function DemoCta({
  variant = "A",
  page,
  refId,
  position = "mid",
  primaryLabel = "Book a demo",
}) {
  const q = query({ page, refId, variant, position });

  if (variant === "C") {
    return (
      <aside className="iomete-cta iomete-cta--c" data-cta="C">
        <strong>Data that can't leave your perimeter?</strong> IOMETE runs the
        whole lakehouse inside it, even air-gapped.{" "}
        <a
          className="iomete-btn iomete-cta__btn iomete-cta__btn--sm"
          data-cta-type="demo"
          href={DEMO_PATH + q}
        >
          {primaryLabel}
        </a>
      </aside>
    );
  }

  const c = COPY[variant] || COPY.A;
  return (
    <aside
      className={`iomete-cta iomete-cta--${String(variant).toLowerCase()}`}
      data-cta={variant}
    >
      {variant === "A" && <p className="iomete-cta__eyebrow">IOMETE</p>}
      <p className="iomete-cta__title">{c.title}</p>
      <p className="iomete-cta__body">{c.body}</p>
      <p className="iomete-cta__actions">
        <a
          className="iomete-btn iomete-cta__btn"
          data-cta-type="demo"
          href={DEMO_PATH + q}
        >
          {primaryLabel}
        </a>
        <a
          className="iomete-cta__link"
          data-cta-type="free"
          href={FREE_PLAN_PATH + q}
        >
          {c.secondary}
        </a>
      </p>
    </aside>
  );
}
