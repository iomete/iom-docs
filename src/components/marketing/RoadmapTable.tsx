import Link from "@docusaurus/Link";

import styles from "./RoadmapTable.module.css";

type RoadmapItem = {
  name: string;
  status: "Completed" | "In-Progress" | "Planned" | "Backlog";
  priority: "High" | "Medium" | "Low";
  lastUpdated: string;
  href?: string;
};

type RoadmapGroup = {
  groupTitle: string;
  items: RoadmapItem[];
};

type RoadmapTableProps = {
  groups: RoadmapGroup[];
};

const statusClassMap: Record<RoadmapItem["status"], string> = {
  Completed: styles.statusCompleted,
  "In-Progress": styles.statusInProgress,
  Planned: styles.statusPlanned,
  Backlog: styles.statusBacklog,
};

const toId = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

// Roadmap view grouped by category with status badges and table layout.
export default function RoadmapTable({ groups }: RoadmapTableProps) {
  return (
    <div className={styles.wrapper}>
      <nav className={styles.nav} aria-label="Roadmap categories">
        {groups.map((group) => {
          const id = toId(group.groupTitle);
          return (
            <a key={group.groupTitle} className={styles.navLink} href={`#${id}`}>
              {group.groupTitle}
            </a>
          );
        })}
      </nav>
      <div className={styles.groups}>
        {groups.map((group) => {
          const id = toId(group.groupTitle);
          return (
            <section key={group.groupTitle} className={styles.group}>
              <h3 id={id} className={styles.groupTitle}>
                {group.groupTitle}
              </h3>
              <div className={styles.tableWrap}>
                <table className={styles.table} aria-labelledby={id}>
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Status</th>
                      <th scope="col">Priority</th>
                      <th scope="col">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((item) => (
                      <tr key={`${group.groupTitle}-${item.name}`}>
                        <td className={styles.name}>
                          {item.href ? (
                            <Link to={item.href} className={styles.link}>
                              {item.name}
                            </Link>
                          ) : (
                            item.name
                          )}
                        </td>
                        <td>
                          <span className={`${styles.status} ${statusClassMap[item.status]}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className={styles.priority}>{item.priority}</td>
                        <td className={styles.updated}>{item.lastUpdated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
