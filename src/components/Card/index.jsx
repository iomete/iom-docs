import React from "react";
import { Link } from "react-router-dom";
import "./style.scss";

const Card = ({ title, icon, link, children }) => (
  <Link to={link} className="card-component">
    <div className="card-content">
      {icon} <h3 className="card-title">{title}</h3>
      <p>{children}</p>
    </div>
  </Link>
);

export default Card;
