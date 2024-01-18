import React from "react";
import Card from "./Card";
import styles from "./styles.module.scss";

const cards = [
  {
    to: "community-deployment/overview",
    title: "Community Deployment",
    description: "Learn how to deploy a community edition of IOMETE on Cloud or On-Premise.",
    label: "Getting Started",
  },
  {
    to: "user-guide/virtual-lakehouses",
    title: "Virtual Lakehouses",
    description:
      "Learn how to create and manage virtual lakehouses which provides an SQL interface to query and process data in your data lakehouse.",
    label: "User Guide",
  },
  {
    to: "reference/sql-quick-start/sql-ddl-examples",
    title: "SQL Quickstart",
    description: "A quickstart guides to using SQL to query and process data in your data lakehouse.",
    label: "Reference",
  },
  {
    to: "tutorials/read-files-from-aws-s3",
    title: "Loading Data",
    description: "Tutorials on how to query data files in S3 and from operational databases using JDBC providers.",
    label: "Tutorials",
  },
];

function Features() {
  return (
    <>
      <div className={styles.FeatureHeaderText}>
        <h3>Featured Resources</h3>
        <p>Dive into our top picks</p>
      </div>

      <div className="row">
        {cards.map((card) => (
          <div className="col col--3" key={card.to}>
            <Card label={card.label} title={card.title} link={card.to} description={card.description}></Card>
          </div>
        ))}
      </div>
    </>
  );
}

export default Features;
