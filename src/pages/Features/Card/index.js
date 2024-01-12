import React from "react";
import "./style.scss";
import useBaseUrl from "@docusaurus/useBaseUrl";

const Card = ({ label, title, link, description }) => {
  const baseUrl = useBaseUrl("/");
  return (
    <div className="feature-card">
      <a href={baseUrl + link} className="card-wrapper">
        <div className="card-content">
          <p className="card-label">{label}</p>
          <p className="card-title">{title}</p>
          <p className="card-description">{description}</p>
        </div>
      </a>
    </div>
  );
};

export default Card;
