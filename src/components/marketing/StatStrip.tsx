import styles from "./StatStrip.module.css";

type Stat = {
  value: string;
  label: string;
};

type StatStripProps = {
  stats: Stat[];
};

// Compact stat callouts used to emphasize key numbers.
export default function StatStrip({ stats }: StatStripProps) {
  return (
    <div className={styles.strip}>
      <div className={styles.grid}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <div className={styles.value}>{stat.value}</div>
            <div className={styles.label}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
