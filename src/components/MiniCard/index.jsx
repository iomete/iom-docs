import React from "react";
import { Link } from "react-router-dom";
import "./style.scss";

const MiniCard = ({ link, linkName, children }) => (
  <div className="iom-mini-card">
    <h3 className="title">{children}</h3>
    <Link to={link}>{linkName}</Link>
  </div>
);

export default MiniCard;
