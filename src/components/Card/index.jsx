import React from "react";
import Link from "@docusaurus/Link";
import "./style.scss";
import useBaseUrl from "@docusaurus/useBaseUrl";

const Card = ({ title, icon, link, children }) => {

  //if link is external, use link as is else use baseUrl + link
  const url = link.startsWith("http") ? link : useBaseUrl("/") + link;
  return (
    <div className="iom-card">
      <Link to={url}>
        <div className="wrapper">
          {icon && <div className="icon-wrapper">{icon}</div>}
          <div className="content">
            <h3 className="title">{title}</h3>
            {children}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Card;
