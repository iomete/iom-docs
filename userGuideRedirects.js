/**
 * Redirects from old URL slugs to new user-guide paths.
 * These preserve backward compatibility for previously published and indexed URLs.
 *
 * Two categories:
 * 1. Files moved from docs/ to user-guide/ — old URLs had no /user-guide/ prefix
 * 2. Files already in user-guide/ but with custom slugs — old URLs had /user-guide/ prefix
 */
const userGuideRedirects = [
  // ──────────────────────────────────────────────
  // Files moved from docs/ → old URLs without /user-guide/ prefix
  // ──────────────────────────────────────────────

  // Data Sources (reference → user-guide/reference)
  { from: "/reference/data-sources/csv-files", to: "/user-guide/reference/data-sources/csv-files" },
  { from: "/reference/data-sources/json-files", to: "/user-guide/reference/data-sources/json-files" },
  { from: "/reference/data-sources/parquet-files", to: "/user-guide/reference/data-sources/parquet-files" },
  { from: "/reference/data-sources/orc-files", to: "/user-guide/reference/data-sources/orc-files" },
  { from: "/reference/data-sources/jdbc-sources", to: "/user-guide/reference/data-sources/jdbc-sources" },
  { from: "/reference/data-sources/snowflake-connector", to: "/user-guide/reference/data-sources/snowflake-connector" },

  // Client & Libraries (developer-guide → user-guide/driver)
  { from: "/developer-guide/jdbc-driver", to: "/user-guide/driver/hive-jdbc-driver" },
  { from: "/user-guide/driver/jdbc-driver", to: "/user-guide/driver/hive-jdbc-driver" },
  { from: "/developer-guide/sql-alchemy-driver", to: "/user-guide/driver/sql-alchemy-driver" },

  // Jupyter Containers (developer-guide/notebook → user-guide/notebook)
  { from: "/developer-guide/notebook/jupyter-containers", to: "/user-guide/notebook/jupyter-containers" },
  { from: "/developer-guide/notebook/manage-containers", to: "/user-guide/notebook/manage-containers" },
  { from: "/developer-guide/notebook/using-jupyterlab", to: "/user-guide/notebook/using-jupyterlab" },

  // Spark Jobs (developer-guide/spark-job → user-guide/spark-jobs)
  { from: "/developer-guide/spark-job/getting-started", to: "/user-guide/spark-jobs/creating-spark-job" },
  { from: "/user-guide/spark-jobs/getting-started", to: "/user-guide/spark-jobs/creating-spark-job" },
  { from: "/developer-guide/spark-job/spark-application-config", to: "/user-guide/spark-jobs/spark-application-config" },
  { from: "/developer-guide/spark-job/iomete-sdk", to: "/user-guide/spark-jobs/iomete-sdk" },
  { from: "/developer-guide/spark-job/airflow", to: "/user-guide/spark-jobs/airflow" },
  { from: "/developer-guide/spark-job/nessie-integration", to: "/user-guide/spark-jobs/nessie-integration" },
  { from: "/developer-guide/spark-job/spark-logging", to: "/user-guide/spark-jobs/spark-logging" },
  { from: "/developer-guide/spark-job/job-orchestrator", to: "/user-guide/spark-jobs/job-orchestrator" },

  // AWS (aws → user-guide/aws)
  { from: "/aws/s3-bucket-permissions", to: "/user-guide/aws/s3-bucket-permissions" },
  { from: "/aws/glue-catalog-permissions", to: "/user-guide/aws/glue-catalog-permissions" },

  // Kubernetes (k8s → user-guide/k8s)
  { from: "/k8s/cpu-vs-vcpu", to: "/user-guide/k8s/cpu-vs-vcpu" },
  { from: "/k8s/monitoring", to: "/user-guide/k8s/monitoring" },
  { from: "/k8s/private-docker-registry", to: "/user-guide/k8s/private-docker-registry" },
  { from: "/k8s/spark-executor-shuffle-storage-options", to: "/user-guide/k8s/spark-executor-shuffle-storage-options" },
  { from: "/k8s/sizing-nodes-in-kubernetes-for-iomete-installation", to: "/user-guide/k8s/sizing-nodes-in-kubernetes-for-iomete-installation" },
  { from: "/k8s/database-migration", to: "/user-guide/k8s/database-migration" },

  // Note: Files already in user-guide/ with custom slugs (IAM, SSO, RAS, misc, troubleshooting)
  // preserve their old URLs via slug frontmatter — no redirects needed.

  // ──────────────────────────────────────────────
  // Renamed / moved pages within user-guide
  // ──────────────────────────────────────────────

  // health-check, query-monitoring grouped under monitoring/
  { from: "/user-guide/health-check", to: "/user-guide/monitoring/health-check" },
  { from: "/user-guide/query-monitoring", to: "/user-guide/monitoring/query-monitoring" },

  { from: "/user-guide/node-type-sizing", to: "/user-guide/node-types/node-type-sizing" },
  { from: "/user-guide/workspaces", to: "/user-guide/sql-editor/workspaces" },

  // Slug removed — old slug-based URL → new file-path-based URL
  { from: "/developer-guide/jupyter-containers", to: "/user-guide/notebook/jupyter-containers" },

  // ──────────────────────────────────────────────
  // Deleted pages split into multiple — redirect to primary page
  // ──────────────────────────────────────────────

  // virtual-lakehouses → compute-clusters
  { from: "/user-guide/virtual-lakehouses", to: "/user-guide/compute-clusters/overview" },

  // data-catalog (single page) → data-catalog sub-pages
  { from: "/user-guide/data-catalog", to: "/user-guide/data-catalog/overview" },

  // node-types (single page) → node-types sub-pages
  { from: "/user-guide/node-types", to: "/user-guide/node-types/overview" },

  // access tokens grouped under category
  { from: "/user-guide/create-a-personal-access-token", to: "/user-guide/access-tokens/personal" },

  // spark-rest-catalogs merged into spark-catalogs/internal
  { from: "/user-guide/spark-rest-catalogs", to: "/user-guide/spark-catalogs/internal" },
];

export default userGuideRedirects;
