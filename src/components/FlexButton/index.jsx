import React from "react";
import "./style.scss";

const FlexButton = ({ label, children, primary = false }) => (
  <span className={`iom-btn-flex ${primary && "iom-btn-primary"}`}>
    {!!children && children}
    {!!label && label}
  </span>
);

export default FlexButton;
