import React from "react";

import { GithubLogo, YoutubeLogo } from "@phosphor-icons/react";
import { BASE_PATH } from "../../../consts";

export const latestBlogs = [
  {
    title: "Data as a Product for large enterprises",
    date: "Feb 9, 2025",
    url: "/blog/2025/02/09/data-mesh-data-product",
  },
  {
    title: "Copy-on-Write Tables in Apache Iceberg",
    date: "May 22, 2025",
    url: "/blog/iceberg-copy-on-write-deep-dive",
  },
  {
    title: "Apache Arrow explained",
    date: "Mar 24, 2025",
    url: "/blog/apache-arrow-format",
  },
];

export const communities = [
  {
    title: "Public Roadmap",
    desc: "Check the future and ask a feature",
    icon: (
      <svg
        width="38"
        height="38"
        viewBox="0 0 38 38"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M32.0625 7.125H5.9375C5.62256 7.125 5.32051 7.25011 5.09781 7.47281C4.87511 7.69551 4.75 7.99756 4.75 8.3125V30.875C4.75 31.5049 5.00022 32.109 5.44562 32.5544C5.89102 32.9998 6.49511 33.25 7.125 33.25H13.0625C13.6924 33.25 14.2965 32.9998 14.7419 32.5544C15.1873 32.109 15.4375 31.5049 15.4375 30.875V23.75H22.5625V26.125C22.5625 26.7549 22.8127 27.359 23.2581 27.8044C23.7035 28.2498 24.3076 28.5 24.9375 28.5H30.875C31.5049 28.5 32.109 28.2498 32.5544 27.8044C32.9998 27.359 33.25 26.7549 33.25 26.125V8.3125C33.25 7.99756 33.1249 7.69551 32.9022 7.47281C32.6795 7.25011 32.3774 7.125 32.0625 7.125ZM13.0625 30.875H7.125V19H13.0625V30.875ZM13.0625 16.625H7.125V9.5H13.0625V16.625ZM22.5625 21.375H15.4375V9.5H22.5625V21.375ZM30.875 26.125H24.9375V19H30.875V26.125ZM30.875 16.625H24.9375V9.5H30.875V16.625Z"
          fill="currentColor"
        />
      </svg>
    ),
    url: "https://iomete.com/roadmap",
  },
  // {
  //   title: "Join our Community",
  //   desc: "Ask community version questions here",
  //   icon: <HandHeart size={32} />,
  //   url: "https://community.iomete.com",
  // },
  {
    title: "Youtube Channel",
    desc: "We have some tutorials for you here",
    icon: <YoutubeLogo size={32} />,
    url: "https://www.youtube.com/@iomete",
  },
  {
    title: "Github Repo",
    desc: "Useful examples, connectors & more",
    icon: <GithubLogo size={32} />,
    url: "https://github.com/iomete",
  },
];

export const topConnections = [
  {
    name: "Power BI",
    imgSrc: `${BASE_PATH}/img/hero/connections/power-bi.svg`,
  },
  {
    name: "Tableau BI",
    imgSrc: `${BASE_PATH}/img/hero/connections/tableau.svg`,
  },
  {
    name: "Redash BI",
    imgSrc: `${BASE_PATH}/img/hero/connections/redash-bi.svg`,
  },
];

export const bottomConnections = [
  {
    name: "Apache Airflow",
    imgSrc: `${BASE_PATH}/img/hero/connections/airflow.svg`,
  },
  {
    name: "dbt",
    imgSrc: `${BASE_PATH}/img/hero/connections/dbt.svg`,
  },
  {
    name: "Prefect",
    imgSrc: `${BASE_PATH}/img/hero/connections/prefect.svg`,
  },
];
