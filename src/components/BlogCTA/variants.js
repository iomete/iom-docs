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
    heading: "Need this running inside your own perimeter?",
    body: "IOMETE deploys as a Kubernetes-native lakehouse on your own infrastructure — on-premises, private cloud, or air-gapped — on open Apache Iceberg and Spark, so your data and your exit rights stay yours.",
    primary: {
      label: "Talk to a data architect",
      href: "https://iomete.com/contact-us",
    },
    secondary: {
      label: "See on-premises deployment",
      href: "https://iomete.com/product/deployment?type=on-premises",
    },
  },
  product: {
    eyebrow: "How IOMETE does this",
    heading: "See it in the platform",
    body: "IOMETE brings Spark compute, ETL jobs, notebooks, SQL, catalog, and RBAC together in one self-hosted platform you run yourself.",
    primary: {
      label: "Explore the platform",
      href: "https://iomete.com/product/data-platform/platform-overview",
    },
    secondary: {
      label: "See pricing",
      href: "https://iomete.com/pricing",
    },
  },
  reference: {
    eyebrow: "Try it on your own data",
    heading: "Run this on your own lakehouse",
    body: "Managed Spark, notebooks, and an Iceberg catalog on infrastructure you control. Start in the docs — no sales call required.",
    primary: {
      label: "Read the docs",
      href: "/resources/getting-started/what-is-iomete",
    },
    secondary: {
      label: "IOMETE on GitHub",
      href: "https://github.com/iomete",
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
 * Tag outbound clicks so blog-driven leads are attributable per post.
 * Internal `/resources/...` links are left alone.
 */
export function withUtm(href, slug) {
  if (!/^https?:\/\//.test(href)) return href;
  const separator = href.includes("?") ? "&" : "?";
  const campaign = encodeURIComponent(slug || "blog");
  return `${href}${separator}utm_source=blog&utm_medium=in_article_cta&utm_campaign=${campaign}`;
}
