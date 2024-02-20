import React from "react";
import Heading from "@theme/Heading";
import style from "./resources.module.scss";
import { DownloadSimple } from "@phosphor-icons/react";

function Resources() {
  return (
    <div className={style.Resources}>
      <Heading as="h2">Getting Started Resources</Heading>

      <div className={style.GridContainer}>
        <div className={style.Card_1}>
          <div className={style.Card}>
            <div className={style.Content}>
              <div>
                <h4>User Guides on using IOMETE Platform Console.</h4>
                <p>
                  Learn how to create / manage various resources in IOMETE
                  Platform.
                </p>
                <p>From basics to advanced security settings.</p>
              </div>
              <div className={style.Img}>
                <img src="img/hero/lakehouses.png" alt="Lakahouses" />
              </div>
            </div>
          </div>
        </div>

        <div className={style.Card_2}>
          <div className={style.Card}>
            <div className={style.CardHeader}>
              <DownloadSimple size={32} />
            </div>
            <div>
              <h4>Loading Data</h4>
              <p>Tutorials on how to query data files from various sources.</p>
            </div>
          </div>
        </div>

        <div className={style.Card_3}>
          <div className={style.Card}>
            <div>
              <div>
                <h4>Integrations and Connections</h4>
                <p>
                  Find step by step tutorials on how to connect various BI
                  Tools, integrate with dbt, Apache Airflow, etc.
                </p>
              </div>
              <div className={style.Connections}>
                <div>
                  <button style={{ width: "30%" }}>
                    <img
                      src="img/hero/connections/power-bi.svg"
                      alt="Power BI"
                    />
                    Power BI
                  </button>
                  <button style={{ width: "40%" }}>
                    <img src="img/hero/connections/tableau.svg" alt="Tableau" />
                    Tableau BI
                  </button>
                  <button style={{ width: "30%" }}>
                    <img
                      src="img/hero/connections/redash-bi.svg"
                      alt="Redash BI"
                    />
                    Redash BI
                  </button>
                </div>

                <div>
                  <button style={{ width: "40%" }}>
                    <img src="img/hero/connections/airflow.svg" alt="Airflow" />
                    Apache Airflow
                  </button>
                  <button style={{ width: "20%" }}>
                    <img src="img/hero/connections/dbt.svg" alt="DBT" />
                    dbt
                  </button>
                  <button style={{ width: "40%" }}>
                    <img src="img/hero/connections/prefect.svg" alt="Prefect" />
                    Prefect
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={style.Card_4}>
          <div className={style.Card}>
            <div>
              <div>
                <h4>SQL Quickstart</h4>
                <p>
                  A quickstart guides to using SQL to query and process data in
                  your data lakehouse.
                </p>
              </div>
              <div>
                <img
                  style={{ borderRadius: 2 }}
                  src="img/hero/sql-quickstart.png"
                  alt="Lakahouses"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Resources;
