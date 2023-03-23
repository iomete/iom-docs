import React from "react";
import { Link } from "react-router-dom";
import "./style.scss";

// import { ArrowRight } from "@phosphor-icons/react";

const Card = ({ title, icon, link, children }) => (
  <div className="iom-card">
    <Link to={link}>
      <div className="wrapper">
        <div className="icon-wrapper">{icon}</div>
        <div className="content">
          <h3 className="title">{title}</h3>
          <p>{children}</p>
        </div>
        {/* <div className="right">
          <ArrowRight size={24} color="#0070F3" weight="regular" />
        </div> */}
      </div>
    </Link>
  </div>
);

export default Card;
