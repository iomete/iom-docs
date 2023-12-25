import React from "react";
import "./style.scss";

import { ArrowSquareOut } from "@phosphor-icons/react";

const ExternalCard = ({ title, icon, link, children }) => (
  <div className="iom-external-card">
    <a target="_blank" href={link}>
      <div className="wrapper">
        {icon && <div className="icon-wrapper">{icon}</div>}
        <div className="content">
          <h3 className="title">{title}</h3>
          {children}
        </div>
        <div className="right">
          <ArrowSquareOut size={24} color="#0070F3" weight="regular" />
        </div>
      </div>
    </a>
  </div>
);

export default ExternalCard;
