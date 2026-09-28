// Copy and routing for the in-article blog CTA.
//
// Three variants, because blog readers are not one audience:
//   sovereign — BoFu posts (compliance, on-prem, migration, regulated industry).
//               These are the posts that produce pipeline, so they get the ask.
//   product   — educational/architecture posts: bridge from concept to product.
//   reference — developer reference posts (PySpark, SQL syntax, file formats).
//               Historically zero leads, so no sales ask: docs and GitHub only.
//
// Override per post with frontmatter `cta: sovereign | product | reference`.
// Override the primary destination with `ctaLink: https://...`.
//
// Marketing pages must be absolute `https://iomete.com/...` links — a
// root-relative `/product/...` gets the `/resources/` baseUrl prepended.

export const VARIANTS = {
  sovereign: {
    eyebrow: "Sovereign by architecture",
    line: "IOMETE runs this inside your own perimeter — on-premises, private cloud, or air-gapped.",
    primary: {
      label: "Talk to a data architect",
      href: "https://iomete.com/contact-us",
    },
  },
  product: {
    eyebrow: "How IOMETE does this",
    line: "Spark, ETL, notebooks, SQL, catalog and RBAC in one self-hosted platform.",
    primary: {
      label: "Explore the platform",
      href: "https://iomete.com/product/data-platform/platform-overview",
    },
  },
  reference: {
    eyebrow: "Try it on your own data",
    line: "Run this on your own lakehouse — Spark, notebooks and an Iceberg catalog you control.",
    primary: {
      label: "Read the docs",
      href: "/resources/getting-started/what-is-iomete",
    },
  },
};

export const DEFAULT_VARIANT = "product";

// Signals that a post is bottom-of-funnel: a reader here has a deployment,
// regulatory, or migration problem, not a syntax question.
const SOVEREIGN_SIGNALS = [
  "sovereign",
  "sovereignty",
  "on-prem",
  "on prem",
  "air-gap",
  "air gap",
  "self-host",
  "compliance",
  "compliant",
  "regulat",
  "dora",
  "gdpr",
  "ai act",
  "nis2",
  "data residency",
  "data protection",
  "bank",
  "financial services",
  "fintech",
  "government",
  "public sector",
  "defense",
  "defence",
  "healthcare",
  "migration",
  "migrate",
  "cloudera",
  "hadoop",
  "reference architecture",
  "governance",
  "rbac",
  "audit",
];

// Developer reference material: high traffic, no buying intent.
const REFERENCE_SIGNALS = [
  "cheat sheet",
  "cheatsheet",
  "pyspark",
  "spark sql",
  "sql function",
  "syntax",
  "tutorial",
  "cte",
  "window function",
  "join types",
  "regex",
  "date format",
  "how to write",
  "dataframe",
  "udf",
  "arrow",
];

function haystack({ title = "", description = "", keywords = [], slug = "" }) {
  return [title, description, slug, ...keywords].join(" ").toLowerCase();
}

/**
 * Pick a CTA variant for a post. Explicit frontmatter always wins; otherwise
 * BoFu signals beat reference signals (a "Cloudera migration SQL cheat sheet"
 * is a migration post first).
 */
export function selectVariant(post) {
  const explicit = post.cta && VARIANTS[post.cta] ? post.cta : null;
  if (explicit) return explicit;

  const text = haystack(post);
  if (SOVEREIGN_SIGNALS.some((s) => text.includes(s))) return "sovereign";
  if (REFERENCE_SIGNALS.some((s) => text.includes(s))) return "reference";
  return DEFAULT_VARIANT;
}

/**
 * Tag CTA clicks so blog-driven leads are attributable per post. Applies to
 * absolute links and to root-relative ones (`/resources/...`, `/product/...`),
 * because the reference variant points at internal pages and those clicks were
 * otherwise invisible in analytics. Anchors and query-only hrefs are left alone.
 */
export function withUtm(href, slug) {
  if (typeof href !== "string" || !href) return href;
  const isAbsolute = /^https?:\/\//.test(href);
  const isRootRelative = href.startsWith("/");
  if (!isAbsolute && !isRootRelative) return href;
  const [base, hash = ""] = href.split("#");
  const separator = base.includes("?") ? "&" : "?";
  const campaign = encodeURIComponent(slug || "blog");
  const tagged = `${base}${separator}utm_source=blog&utm_medium=in_article_cta&utm_campaign=${campaign}`;
  return hash ? `${tagged}#${hash}` : tagged;
}
