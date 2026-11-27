import React, { useEffect, useRef, useState } from "react";
import styles from "./styles.module.scss";

const steps = [
  {
    label: "BI queries",
    description: "The BI cluster reads Iceberg tables in object storage.",
  },
  {
    label: "Add ETL",
    description:
      "A separate ETL cluster reads and writes the same tables. Each cluster has its own CPU and memory.",
  },
  {
    label: "Stop ETL",
    description:
      "Stop the ETL cluster when its work finishes. The BI cluster keeps running, and the tables stay in object storage.",
  },
];

/**
 * A schematic, not live telemetry. Keep storage mounted across all steps:
 * starting or stopping a compute cluster does not copy or remove table data.
 * The complete middle step is also the SSR / no-JavaScript fallback.
 */
export default function SharedStorageDiagram() {
  const root = useRef(null);
  const [step, setStep] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      setReducedMotion(preference.matches);
      // Do not restart playback when a preference changes back.
      if (preference.matches) setPlaying(false);
    };
    updatePreference();
    setMounted(true);
    if (!preference.matches) {
      setStep(0);
      setPlaying(true);
    }
    preference.addEventListener("change", updatePreference);
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.25 }
    );
    observer.observe(root.current);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", updatePreference);
    };
  }, []);

  useEffect(() => {
    if (!playing || !visible || reducedMotion) return undefined;
    const timer = window.setInterval(() => {
      setStep((current) => (current + 1) % steps.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [playing, visible, reducedMotion]);

  const etlActive = step === 1;
  const running = playing && visible && !reducedMotion;

  function selectStep(index) {
    setPlaying(false);
    setStep(index);
  }

  return (
    <figure
      ref={root}
      className={styles.figure}
      data-shared-storage-diagram
      data-step={step}
      data-running={running}
      aria-label="Separate compute, shared table storage"
    >
      <div className={styles.canvas}>
        <div className={styles.heading}>Separate compute, shared tables</div>
        <div className={styles.computeLabel}>Compute on Kubernetes</div>
        <div className={styles.compute}>
          <div className={`${styles.node} ${styles.bi}`}>
            <span className={styles.nodeTitle}>BI cluster</span>
            <span className={styles.detail}>Apache Spark</span>
            <span className={styles.state}>Running</span>
          </div>
          <div
            className={`${styles.node} ${styles.etl}`}
            data-active={etlActive}
          >
            <span className={styles.nodeTitle}>ETL cluster</span>
            <span className={styles.detail}>Apache Spark</span>
            <span className={styles.state}>
              {etlActive ? "Running" : step === 0 ? "Not started" : "Stopped"}
            </span>
          </div>
        </div>
        <div className={styles.connections} aria-hidden="true">
          <div className={styles.route}>
            <span className={styles.line} />
            <span className={styles.flowLabel}>Read</span>
          </div>
          <div className={styles.route} data-inactive={!etlActive}>
            <span className={styles.line} />
            <span className={styles.flowLabel}>Read / write</span>
          </div>
        </div>
        <div className={styles.storage}>
          <span className={styles.nodeTitle}>Apache Iceberg tables</span>
          <span className={styles.detail}>Object storage in your infrastructure</span>
        </div>
        <p className={styles.note}>
          Adding compute does not require a separate copy of the tables.
        </p>
      </div>
      <div className={styles.controls}>
        {mounted && (
          <>
            <div className={styles.steps} role="group" aria-label="Workload steps">
              {steps.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  aria-pressed={step === index}
                  onClick={() => selectStep(index)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            {!reducedMotion && (
              <button
                className={styles.playback}
                type="button"
                onClick={() => setPlaying((current) => !current)}
                aria-label={playing ? "Pause diagram animation" : "Play diagram animation"}
              >
                {playing ? "Pause" : "Play"}
              </button>
            )}
          </>
        )}
      </div>
      <figcaption className={styles.caption}>
        <span>{steps[step].description}</span>
        <span className={styles.scope}>
          Schematic: catalog and access controls are not shown.
        </span>
      </figcaption>
    </figure>
  );
}
