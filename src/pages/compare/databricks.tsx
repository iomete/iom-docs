import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";

import FeatureGrid from "../../components/marketing/FeatureGrid";
import FeatureGrid2 from "../../components/marketing/FeatureGrid2";
import HeroSection from "../../components/marketing/HeroSection";
import Section from "../../components/marketing/Section";
import styles from "./databricks.module.css";
import Section2 from "../../components/marketing/Section2";

const comparisonSections = [
  {
    title: "Deployment model — flexibility vs SaaS-only operating model",
    iomete: "Self-hosted / hybrid deployment model designed to run inside the customer’s infrastructure.",
    databricks: "Managed SaaS experience delivered via public cloud providers.",
  },
  {
    title: "Data ownership, security & privacy — control boundary matters",
    iomete:
      "Processing stays inside the customer-controlled environment; security controls can remain within the customer perimeter.",
    databricks: "Managed environment; customers own data, but execution is operated as a managed service.",
  },
  {
    title: "Architecture & open standards — Iceberg-first vs ecosystem gravity",
    iomete: "Apache Iceberg-first approach to reduce lock-in and keep lakehouse tables portable.",
    databricks:
      "Strongly promotes Delta Lake; open source exists, but deeper optimization often favors staying inside the Databricks ecosystem.",
  },
  {
    title: "Cost — self-hosted control vs managed-service premium",
    iomete:
      "Lower TCO potential when using existing infrastructure and negotiated cloud pricing, with more direct control over resource usage.",
    databricks: "Managed-service pricing can include premiums for platform operations and associated services.",
  },
  {
    title: "Operations — supported self-hosting vs fully managed",
    iomete:
      "Customer controls upgrade cycles and infrastructure; platform support reduces the burden of self-managed systems.",
    databricks: "Fully managed operations, but less control over the managed boundary.",
  },
];

const featureRows = [
  {
    feature: "Platform Type",
    databricks: "Fully managed SaaS",
    iomete: "Self-hosted within customer's infrastructure",
    notes: "IOMETE runs anywhere (Public/Private Cloud, On-Prem).",
  },
  {
    feature: "Deployment Flexibility",
    databricks: "Public Cloud Only (AWS, Azure, GCP)",
    iomete: "Public Cloud (AWS, Azure, GCP), Private Cloud, On-Premises",
    notes: "Key differentiator for IOMETE.",
  },
  {
    feature: "Core Engine",
    databricks: "Apache Spark (Databricks optimized)",
    iomete: "Apache Spark (IOMETE-distributed; confirm exact packaging wording)",
    notes: "Both leverage Spark.",
  },
  {
    feature: "Core Table Format",
    databricks: "Delta Lake (Databricks-led)",
    iomete: "Apache Iceberg (open standard)",
    notes: "Position around portability / lock-in risk.",
  },
  {
    feature: "Data Storage",
    databricks: "Customer's cloud storage",
    iomete: "Customer's cloud storage / object storage",
    notes: "Emphasize storage remains customer-controlled.",
  },
  {
    feature: "Data Processing Location",
    databricks: "Databricks managed environment",
    iomete: "Customer’s controlled environment (cloud or on-prem)",
    notes: "Boundary matters for sovereignty requirements.",
  },
  {
    feature: "Data Mesh Support",
    databricks: "Add-on features, evolving",
    iomete: "Built for domain-oriented / Data Mesh-aligned deployments (confirm native features)",
    notes: "Clarify native capabilities as needed.",
  },
  {
    feature: "Security & Privacy",
    databricks: "Managed by Databricks, robust features",
    iomete: "Managed entirely by customer within their perimeter",
    notes: "Emphasize control boundary, not superiority claims.",
  },
  {
    feature: "ETL/ELT Capabilities",
    databricks: "Integrated notebooks & workflows",
    iomete: "Integrated notebooks & workflows in customer environment",
    notes: "Both capable; avoid unverified “better”.",
  },
  {
    feature: "Data Governance",
    databricks: "Built-in tools (Unity Catalog)",
    iomete: "Built-in governance controls (policies)",
    notes: "Keep generic unless you have exact feature list.",
  },
  {
    feature: "Machine Learning",
    databricks: "Integrated MLflow (managed)",
    iomete: "Integrate ML tooling within customer environment",
    notes: "Avoid claiming feature parity.",
  },
  {
    feature: "SQL Interface",
    databricks: "Databricks SQL",
    iomete: "SQL access (e.g., Flight SQL / JDBC / ODBC depending on deployment; confirm exact connectors)",
    notes: "Confirm exact SQL connectivity + naming.",
  },
  {
    feature: "Scalability",
    databricks: "Auto-scaling (managed)",
    iomete: "Auto-scaling (Kubernetes-native)",
    notes: "Focus on scale characteristics without hard numbers.",
  },
  {
    feature: "Open Source Alignment",
    databricks: "Moderate (risk of ecosystem gravity)",
    iomete: "High (open standards alignment)",
    notes: "Keep as positioning.",
  },
  {
    feature: "Maintenance",
    databricks: "Fully managed by Databricks",
    iomete: "Managed by customer + IOMETE support",
    notes: "“Supported control” framing.",
  },
  {
    feature: "Cost (TCO)",
    databricks: "Higher (managed premium)",
    iomete: "Lower potential TCO",
    notes: "Avoid absolute claims; keep as “potential”.",
  },
];

const quadrantBackgrounds = ["var(--base-0)", "var(--stone-50)", "var(--lake-100)", "var(--base-50)"];

const quadrant = (index: number) => quadrantBackgrounds[index % quadrantBackgrounds.length];

export default function CompareDatabricksPage() {
  return (
    <Layout
      title="IOMETE vs Databricks"
      description="Compare IOMETE and Databricks across deployment model, data sovereignty, open standards, and operational control."
    >
      <div className={styles.page}>
        <HeroSection
          eyebrow="Platform comparison"
          title="IOMETE vs Databricks"
          subtitle="A comparative view of two modern data platforms, focused on deployment control, sovereignty, open standards, and enterprise operations."
          primaryCta={{ label: "Talk to an expert", href: "/get-in-touch" }}
          secondaryCta={{ label: "See deployment options", href: "/product/deployment" }}
        />

        <div className={styles.content}>
          <Section2 title="Introduction" background={quadrant(0)}>
            <div className={styles.intro}>
              <p>
                Both IOMETE and Databricks provide data lakehouse capabilities. This page focuses on
                differences that matter in enterprise environments: deployment flexibility
                (including on-prem), control boundaries, open standards, and operational fit for
                modern architectures (including Data Mesh).
              </p>
            </div>
          </Section2>

          <Section2
            title="IOMETE is a strong fit when you prioritize"
            description="Where deployment flexibility, control, and open standards are non-negotiable."
            background={quadrant(1)}
          >
            <FeatureGrid2
              items={[
                {
                  title: "Deployment flexibility",
                  description: "Deploy on-premises, in private cloud, or across multiple public clouds.",
                },
                {
                  title: "Maximum control & security",
                  description:
                    "Keep processing inside your controlled environment for regulated or sensitive workloads.",
                },
                {
                  title: "Avoiding vendor lock-in",
                  description: "Prefer solutions built on open standards (e.g., Apache Iceberg).",
                },
                {
                  title: "Modern data architecture",
                  description:
                    "Building toward a Data Mesh model and want platform primitives that align with it.",
                },
                {
                  title: "Cost efficiency",
                  description:
                    "Optimize TCO by using existing infrastructure and avoiding SaaS markups.",
                },
                {
                  title: "Partnership & collaborative support",
                  description:
                    "Prefer a hands-on vendor relationship that supports implementation and operations.",
                },
              ]}
            />
          </Section2>

          {comparisonSections.map((section, idx) => (
            <Section
              key={section.title}
              title={section.title}
              tone={idx % 2 === 1 ? "subtle" : "default"}
              background={quadrant(idx + 2)}
            >
              <div className={styles.comparison}>
                <div className={styles.comparisonGrid}>
                  <div className={styles.comparisonCard}>
                    <div className={styles.label}>IOMETE</div>
                    <p className={styles.comparisonTitle}>{section.iomete}</p>
                  </div>
                  <div className={styles.comparisonCard}>
                    <div className={styles.label}>Databricks</div>
                    <p className={styles.comparisonTitle}>{section.databricks}</p>
                  </div>
                </div>
              </div>
            </Section>
          ))}

          <Section
            title="Feature comparison"
            description="High-level differences across architecture, deployment, and operations."
            background={quadrant(comparisonSections.length + 2)}
          >
            <div className={styles.tableWrap}>
              <div className={styles.tableOverflow}>
                <div className={styles.headerRow}>
                  <div className={styles.headerCol}>Feature</div>
                  <div className={styles.headerCol}>Databricks</div>
                  <div className={styles.headerCol}>IOMETE</div>
                  <div className={styles.headerCol}>Notes</div>
                </div>
                {featureRows.map((row) => (
                  <div key={row.feature} className={styles.itemRow}>
                    <div className={`${styles.itemCol} ${styles.itemColFirst}`}>{row.feature}</div>
                    <div className={styles.itemCol}>{row.databricks}</div>
                    <div className={`${styles.itemCol} ${styles.itemColIomete}`}>{row.iomete}</div>
                    <div className={styles.itemCol}>{row.notes}</div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section title="Summary" background={quadrant(comparisonSections.length + 3)}>
            <div className={styles.intro}>
              <p>
                Databricks can be a strong choice for teams that want a managed SaaS experience.
                IOMETE is built for organizations that need deployment flexibility (including
                on-prem), stronger sovereignty boundaries, and an open-standards-first lakehouse
                approach.
              </p>
            </div>
          </Section>

          <div className={styles.ctaBand}>
            <h3 className={styles.ctaTitle}>Want a side-by-side walkthrough?</h3>
            <p className={styles.ctaSubtitle}>
              Tell us your requirements (deployment model, governance constraints, and workloads) and we’ll map the
              best architecture.
            </p>
            <Link className={styles.ctaAction} to="/get-in-touch">
              Talk to an expert
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
