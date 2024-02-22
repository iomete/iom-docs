import React from "react";

import { DownloadSimple } from "@phosphor-icons/react";
import Card from "./Card";

import "./styles.scss";
import { bottomConnections, topConnections } from "./consts";

function Resources() {
  return (
    <div className="mt-[52px]">
      <h2 className="mb-6">Getting Started Resources</h2>
      <div className="grid grid-cols-8 gap-4">
        <div className="col-span-8 sm:col-span-6">
          <Card>
            <div className="flex justify-between relative flex-col sm:flex-row gap-6">
              <div className="w-full sm:w-[45%]">
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
              <div className="w-full sm:w-1/2 mb-[-28px] flex justify-center">
                <img
                  className="relative sm:absolute h-[240px]"
                  src="img/hero/lakehouses.svg"
                  alt="Lakahouses"
                />
              </div>
            </div>
          </Card>
        </div>
        <div className="col-span-4 sm:col-span-2">
          <Card>
            <div className="bg-[#F6F8FA] dark:bg-[var(--ifm-color-emphasis-200)] flex justify-center items-center h-[72px] mb-4">
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
            <div className="h-auto sm:h-48">
              <div className="mb-4">
                <h4 className="mb-2">Integrations and Connections</h4>
                <p className="card-desc">
                  Find step by step tutorials on how to connect various BI
                  Tools, integrate with dbt, Apache Airflow, etc.
                </p>
              </div>

              <div className="flex gap-3 flex-nowrap mb-3">
                {[...Array(10)]
                  .flatMap(() => topConnections)
                  .map((connection, index) => (
                    <div
                      key={index}
                      className="item bg-[#F6F8FA] dark:bg-[var(--ifm-color-emphasis-200)] rounded-[3px] flex items-center gap-2 py-3 px-6 h-10"
                    >
                      <img
                        className="w-4"
                        src={connection.imgSrc}
                        alt={connection.name}
                      />
                      <span className="text-[14px] whitespace-nowrap pr-2">
                        {connection.name}
                      </span>
                    </div>
                  ))}
              </div>

              <div className="flex gap-3 flex-nowrap">
                {[...Array(10)]
                  .flatMap(() => bottomConnections)
                  .map((connection, index) => (
                    <div
                      key={index}
                      className="item-reverse bg-[#F6F8FA] dark:bg-[var(--ifm-color-emphasis-200)] rounded-[3px]  flex items-center gap-2 py-3 px-6 h-10"
                    >
                      <img
                        className="w-4"
                        src={connection.imgSrc}
                        alt={connection.name}
                      />
                      <span className="text-[14px] whitespace-nowrap pr-2">
                        {connection.name}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </Card>
        </div>
        <div className="col-span-8 sm:col-span-4">
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
                  className="relative sm:absolute sm:p-4 bottom-[-16px]"
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
