import Card from "./Card";
import { BookOpen, Rocket, ShieldStar, TreeStructure } from "@phosphor-icons/react";

import "./resources.scss";

const cards = [
  {
    seeAllLink: "docs",
    title: "Getting Started",
    description: "A beginner's guide to understanding and navigating the Snowflake platform.",
    links: [
      { label: "Introduction", path: "docs/introduction" },
      { label: "Platform", path: "docs/platform" },
    ],
    icon: <Rocket size={64} weight="fill" className="resource-icon" />,
  },
  {
    seeAllLink: "docs/guides",
    title: "User Guide",
    description: "Step-by-step guides for various features and functionalities.",
    links: [
      { label: "Virtual lakehouses", path: "docs/virtual-lakehouses" },
      { label: "Private Docker Registries", path: "docs/private-docker-registries" },
      { label: "Personal access token", path: "docs/personal-access-token" },
      { label: "SQL Editor overview", path: "docs/sql-editor-overview" },
    ],
    icon: <BookOpen size={64} weight="fill" className="resource-icon" />,
  },
  {
    seeAllLink: "docs/data-sources",
    title: "Data sources",
    description: "Explore different data sources compatible with Snowflake.",
    links: [
      { label: "JDBC Sources", path: "docs/jdbc-sources" },
      { label: "Snowflake Connector", path: "docs/snowflake-connector" },
      { label: "CSV Files", path: "docs/csv-files" },
    ],
    icon: <TreeStructure size={64} weight="fill" className="resource-icon" />,
  },
  {
    seeAllLink: "docs/data-security",
    title: "Data Security",
    description: "Learn about data security measures and policies within Snowflake.",
    links: [
      { label: "Overview", path: "docs/overview" },
      { label: "Data Access Policy", path: "docs/data-access-policy" },
      { label: "Data Masking Policy", path: "docs/data-masking-policy" },
      { label: "Data Row Level Filter", path: "docs/data-row-level-filter" },
    ],
    icon: <ShieldStar size={64} weight="fill" className="resource-icon" />,
  },
];

export default function Resources() {
  return (
    <div className="resource-container">
      <h3>Discover the Most Popular Resources</h3>
      <div className="row">
        {cards.map((card) => (
          <div className="col col--4" key={card.seeAllLink}>
            <Card seeAllLink={card.seeAllLink} title={card.title} description={card.description} links={card.links} icon={card.icon}></Card>
          </div>
        ))}
      </div>
    </div>
  );
}
