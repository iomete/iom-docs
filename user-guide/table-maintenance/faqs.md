---
title: Table Maintenance FAQs
description: Frequently asked questions about IOMETE table maintenance — configuration, troubleshooting, and operational behavior.
sidebar_label: FAQs
last_update:
  date: 03/09/2026
  author: Shashank Chaudhary
---

import FAQSection from '@site/src/components/FAQSection';

<FAQSection faqs={[
  {
    question: "I saved my configuration but nothing changed. Why?",
    answerContent: (
      <>
        <p>Configuration changes can take up to 1 minute to take effect. The detection pipeline caches table configuration with a 1-minute TTL, so newly saved settings apply after the next cache refresh.</p>
      </>
    )
  },
  {
    question: "Why can't I configure maintenance for my catalog?",
    answerContent: (
      <>
        <p>Maintenance is supported only for IOMETE-managed internal Iceberg REST catalogs. Unsupported catalog types include <code>spark_catalog</code>, external catalogs (not managed by IOMETE), non-Iceberg catalogs, and non-REST Iceberg implementations.</p>
        <p>If your catalog falls into one of these categories, you'll need to use a supported catalog type. See the <a href="./overview#prerequisites">Prerequisites</a> section for the full requirements.</p>
      </>
    )
  },
  {
    question: "Why are maintenance controls disabled?",
    answerContent: (
      <>
        <p>The catalog might not have an owner domain assigned. All maintenance resources (compute clusters and service accounts) are scoped to the owner domain, so one must be assigned before maintenance can be configured.</p>
        <p>See <a href="./catalog-configuration#catalog-owner-domain">Catalog Owner Domain</a> to assign one.</p>
      </>
    )
  },
  {
    question: "Why can't I enable table maintenance?",
    answerContent: (
      <>
        <p>Catalog-level maintenance must be enabled before table maintenance can be turned on. The catalog setting acts as a master switch: table-level operations will not run until catalog maintenance is enabled.</p>
        <p>See <a href="./catalog-configuration">Catalog-Level Configuration</a>.</p>
      </>
    )
  },
  {
    question: "Table not found or not accessible?",
    answerContent: (
      <>
        <p>This usually means the table doesn't exist in the selected catalog, or your account doesn't have the required permissions to access it.</p>
        <p>Verify the table exists, confirm you're looking in the right catalog, and check that you're a member of the catalog's owner domain or a platform administrator.</p>
      </>
    )
  },
  {
    question: "What happens if the catalog owner domain is changed?",
    answerContent: (
      <>
        <p>Reassigning the owner domain disables maintenance and clears all configured resources (compute clusters and service accounts). After the change, you must re-enable maintenance and reconfigure resources under the new owner domain.</p>
      </>
    )
  },
  {
    question: "Can concurrent writes affect maintenance operations?",
    answerContent: (
      <>
        <p>Yes, in two ways:</p>
        <p><strong>Commit failures.</strong> Iceberg uses optimistic concurrency control. Maintenance operations rewrite files and attempt to commit a new snapshot. If concurrent writes modify the table before the commit completes, the operation may fail because the snapshot has changed. Iceberg may automatically retry metadata-only conflicts, but data conflicts (for example, compaction overlapping with streaming writes to the same partition) can cause the operation to fail. The maintenance service retries the operation on the next cycle.</p>
        <p><strong>Metric discrepancies.</strong> Before-and-after metrics are captured at job start and completion. If concurrent writes occur during the run, the recorded metrics may reflect those writes in addition to the maintenance operation. This is expected behavior for tables with frequent writes.</p>
        <p>Both cases are uncommon under normal workloads but are more likely for tables with continuous streaming ingestion.</p>
      </>
    )
  },
  {
    question: "Why did a pending job fail without ever running?",
    answerContent: (
      <>
        <p>Jobs that remain in <code>PENDING</code> for more than <strong>24 hours</strong> are automatically marked as failed. This prevents stale jobs from accumulating.</p>
      </>
    )
  },
  {
    question: "Why isn't the history table updating automatically?",
    answerContent: (
      <>
        <p>The history table does not auto-refresh. Status changes (for example <code>PENDING</code> → <code>RUNNING</code> → <code>COMPLETED</code>) are not pushed to the page automatically.</p>
        <p>Use the <strong>Refresh</strong> button to load the latest job status. Real-time updates are planned for a future release.</p>
      </>
    )
  },
  {
    question: "Does the system retry failed maintenance operations?",
    answerContent: (
      <>
        <p>Yes. When a maintenance operation fails (for example, due to commit conflicts from concurrent writes), the system automatically returns the job to <code>PENDING</code> and retries it.</p>
        <p>Up to <strong>3 retries</strong> are attempted. If all retries fail, the operation moves to <code>FAILED</code> and is not retried automatically. You can view the retry count in the History tab by enabling the <strong>Retries</strong> column.</p>
      </>
    )
  },
  {
    question: "Orphan cleanup aborted — orphan percentage threshold exceeded. What should I do?",
    answerContent: (
      <>
        <p>The operation aborts if orphan files exceed 30% of total files. This safeguard prevents accidental mass deletion.</p>
        <p>First, check for misconfiguration or data corruption — a high orphan ratio is unusual under normal conditions. Once verified, run <code>remove_orphan_files</code> manually via the SQL Editor to clean up the files directly.</p>
      </>
    )
  },
  {
    question: "Why don't I see any maintenance runs for my table?",
    answerContent: (
      <>
        <p>Maintenance follows <strong>detect → evaluate → execute</strong> pipeline. The system first detects tables that have changed, then evaluates whether any operation is actually needed based on the configured thresholds. Only when a table exceeds a threshold (e.g., too many small files, too many snapshots) does the system create an execution entry that appears in the History tab.</p>
        <p>Each operation is evaluated independently — a table may qualify for one but not another. If none of the operations find a threshold exceeded, no run is created.</p>
        <p>Also note that only tables with recent changes are evaluated. If the table hasn't been modified since the last maintenance cycle, it won't be picked up for evaluation at all.</p>
        <p>If needed, you can always <a href="./run-history-and-metrics#manually-triggering-an-operation">manually trigger</a> an operation to run it on demand.</p>
      </>
    )
  },
  {
    question: "Why are some files skipped during orphan file cleanup?",
    answerContent: (
      <>
        <p>There are two common reasons:</p>
        <p><strong>1. File is newer than the retention period.</strong> Orphan cleanup only deletes files older than the configured <code>Older Than</code> threshold (minimum 3 days). Files newer than this are skipped even if they appear unreferenced — they may belong to in-progress operations that haven't committed yet.</p>
        <p><strong>2. File belongs to an active Flink job.</strong> If the table is written by a Flink streaming job, orphan cleanup skips files belonging to that job. Flink temporarily stores checkpoint data as metadata files before committing them to a snapshot. These files may appear unreferenced but deleting them would corrupt the Flink job state. IOMETE reads the <code>flink.job-id</code> from snapshot summaries and excludes metadata files whose names match that job ID. This exclusion applies only to metadata files — data files written by Flink are not affected.</p>
      </>
    )
  }
]} />
