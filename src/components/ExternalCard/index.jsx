import React from "react";
import "./style.scss";

import { ArrowRight } from "phosphor-react";

const ExternalCard = ({ title, icon, link, children }) => (
  <div className="iom-card">
    <a target="_blank" href={link}>
      <div className="wrapper">
        <div className="icon-wrapper">{icon}</div>
        <div className="content">
          <h3 className="title">{title}</h3>
          <p>{children}</p>
        </div>
        <div className="right">
          <ArrowRight size={24} color="#0070F3" weight="bold" />
        </div>
      </div>
    </a>
  </div>
);

export default ExternalCard;