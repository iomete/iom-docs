import React from "react";

import { DownloadSimple } from "@phosphor-icons/react";
import Card from "./Card";

import "./styles.scss";
import { bottomConnections, topConnections } from "./consts";
import { BASE_PATH } from "../../../consts";

function Resources() {
  return (
    <div className="mt-[52px]">
      <h2 className="mb-6">Getting Started Resources</h2>
      <div className="grid grid-cols-8 gap-4">
        <div className="col-span-8 sm:col-span-6">
          <Card url="/user-guide/virtual-lakehouses">
            <div className="grid h-full grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <h4 className="mb-2">
                  User Guides on using IOMETE Platform Console.
                </h4>
                <p className="mb-4 card-desc">
                  Learn how to create / manage various resources in IOMETE
                  Platform.
                </p>
                <p className="mb-0 card-desc">
                  From basics to advanced security settings.
                </p>
              </div>
              <div className="relative col-span-2 min-h-48 sm:col-span-1">
                <img
                  style={{ height: "calc(100% + 26px)" }}
                  className="object-cover object-left-top absolute bottom-[-26px] right-[-26px] border-solid border border-[#cfd6df] dark:border-[#252526]"
                  src={`${BASE_PATH}/img/hero/lakehouses-console.svg`}
                  alt="Lakahouses"
                />
              </div>
            </div>
          </Card>
        </div>
        <div className="col-span-4 sm:col-span-2">
          <Card url="/aws/read-files-from-aws-s3">
            <div className="bg-[var(--base-100)] dark:bg-[var(--base-900)] flex justify-center items-center h-[72px] mb-4">
              <DownloadSimple size={32} />
            </div>
            <div>
              <h4 className="mb-2">Loading Data</h4>
              <p className="mb-0 card-desc">
                Tutorials on how to query data files from various sources.
              </p>
            </div>
          </Card>
        </div>
        <div className="col-span-4">
          <Card url="/integrations/dbt/getting-started-with-iomete-dbt">
            <div className="h-auto">
              <div className="mb-6">
                <h4 className="mb-2">Integrations and Connections</h4>
                <p className="card-desc">
                  Find step by step tutorials on how to connect various BI
                  Tools, integrate with dbt, Apache Airflow, etc.
                </p>
              </div>

              <div className="flex gap-4 mb-4 flex-nowrap">
                {[...Array(10)]
                  .flatMap(() => topConnections)
                  .map((connection, index) => (
                    <div
                      key={index}
                      className="item bg-[var(--base-100)] dark:bg-[var(--base-900)] rounded-[3px] flex items-center gap-2 py-3 px-6 h-12"
                    >
                      <img
                        className="w-5 h-5"
                        src={connection.imgSrc}
                        alt={connection.name}
                      />
                      <span className="text-[16px] whitespace-nowrap pr-2">
                        {connection.name}
                      </span>
                    </div>
                  ))}
              </div>

              <div className="flex gap-4 flex-nowrap">
                {[...Array(10)]
                  .flatMap(() => bottomConnections)
                  .map((connection, index) => (
                    <div
                      key={index}
                      className="item-reverse bg-[var(--base-100)] dark:bg-[var(--base-900)] rounded-[3px] flex items-center gap-2 py-3 px-6 h-12"
                    >
                      <img
                        className="w-5 h-5"
                        src={connection.imgSrc}
                        alt={connection.name}
                      />
                      <span className="text-[16px] whitespace-nowrap pr-2">
                        {connection.name}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </Card>
        </div>
        <div className="col-span-8 sm:col-span-4">
          <Card url="/user-guide/sql-editor">
            <div>
              <h4 className="mb-2">SQL Quickstart</h4>
              <p className="card-desc">
                A quickstart guides to using SQL to query and process data in
                your data lakehouse.
              </p>
            </div>
            <img
              style={{ height: "calc(80% + 26px)" }}
              className="object-cover object-left-top mb-[-26px]"
              src={`${BASE_PATH}/img/hero/code-sql.svg`}
              alt="SQL Quickstart"
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Resources;
