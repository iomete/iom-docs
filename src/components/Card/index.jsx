import React from "react";
import Link from "@docusaurus/Link";
import "./style.scss";
import useBaseUrl from "@docusaurus/useBaseUrl";

const Card = ({ title, icon, link, children }) => {
  const baseUrl = useBaseUrl("/");
  return (
    <div className="iom-card">
      <Link to={baseUrl + link}>
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
