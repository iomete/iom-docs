import React from "react";

import { DownloadSimple } from "@phosphor-icons/react";
import Card from "./Card";

function Resources() {
  return (
    <div className="mt-[52px]">
      <h2 className="mb-6">Getting Started Resources</h2>
      <div className="grid grid-cols-8 gap-4">
        <div className="col-span-6">
          <Card>
            <div className="flex justify-between relative">
              <div style={{ width: "40%" }}>
                <h4 className="mb-2">
                  User Guides on using IOMETE Platform Console.
                </h4>
                <p className="card-desc mb-4">
                  Learn how to create / manage various resources in IOMETE
                  Platform.
                </p>
                <p className="card-desc mb-0">
                  From basics to advanced security settings.
                </p>
              </div>
              <div className="w-[50%] ">
                <img
                  className="absolute h-[240px]"
                  src="img/hero/lakehouses.svg"
                  alt="Lakahouses"
                />
              </div>
            </div>
          </Card>
        </div>
        <div className="col-span-2">
          <Card>
            <div className="bg-[#F6F8FA] flex justify-center items-center h-[72px] mb-4">
              <DownloadSimple size={32} />
            </div>
            <div>
              <h4 className="mb-2">Loading Data</h4>
              <p className="card-desc mb-0">
                Tutorials on how to query data files from various sources.
              </p>
            </div>
          </Card>
        </div>
        <div className="col-span-4">
          <Card>
            <div className="relative h-48">
              <div className="mb-4">
                <h4 className="mb-2">Integrations and Connections</h4>
                <p className="card-desc">
                  Find step by step tutorials on how to connect various BI
                  Tools, integrate with dbt, Apache Airflow, etc.
                </p>
              </div>
              <div className="absolute w-[110%] left-[-16px]">
                <div className="grid grid-cols-12 gap-4">
                  <div className="bg-[#F6F8FA] col-span-4 flex items-center gap-1 py-3 px-[22px] h-10">
                    <img
                      className="w-4"
                      src="img/hero/connections/power-bi.svg"
                      alt="Power BI"
                    />
                    <span className="text-[14px] whitespace-nowrap">
                      Power BI
                    </span>
                  </div>
                  <div className="bg-[#F6F8FA] col-span-5 flex items-center gap-1 py-3 px-[22px] h-10">
                    <img
                      className="w-4"
                      src="img/hero/connections/tableau.svg"
                      alt="Tableau"
                    />
                    <span className="text-[14px] whitespace-nowrap">
                      Tableau BI
                    </span>
                  </div>
                  <div className="bg-[#F6F8FA] col-span-3 flex items-center gap-1 py-3 px-[22px] h-10">
                    <img
                      className="w-4"
                      src="img/hero/connections/redash-bi.svg"
                      alt="Redash BI"
                    />
                    <span className="text-[14px] whitespace-nowrap">
                      Redash BI
                    </span>
                  </div>

                  <div className="bg-[#F6F8FA] col-span-5 flex items-center gap-1 py-3 px-[22px] h-10">
                    <img
                      className="w-4"
                      src="img/hero/connections/airflow.svg"
                      alt="Airflow"
                    />
                    <span className="text-[14px] whitespace-nowrap">
                      Apache Airflow
                    </span>
                  </div>
                  <div className="bg-[#F6F8FA] col-span-3 flex items-center gap-1 py-3 px-[22px] h-10">
                    <img
                      className="w-4"
                      src="img/hero/connections/dbt.svg"
                      alt="DBT"
                    />
                    <span className="text-[14px] whitespace-nowrap">dbt</span>
                  </div>
                  <div className="bg-[#F6F8FA] col-span-4 flex items-center gap-1 py-3 px-[22px] h-10">
                    <img
                      className="w-4"
                      src="img/hero/connections/prefect.svg"
                      alt="Prefect"
                    />
                    <span className="text-[14px] whitespace-nowrap">
                      Prefect
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
        <div className="col-span-4">
          <Card>
            <div>
              <div>
                <h4 className="mb-2">SQL Quickstart</h4>
                <p className="card-desc">
                  A quickstart guides to using SQL to query and process data in
                  your data lakehouse.
                </p>
              </div>
              <div className="flex justify-center">
                <img
                  className="absolute p-4 bottom-[-16px]"
                  src="img/hero/sql-quickstart.png"
                  alt="Lakahouses"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Resources;
