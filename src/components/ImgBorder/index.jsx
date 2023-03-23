import React from "react";
import "./style.scss";

export default function ImgBorder({ src, alt = "", padding = 0 }) {
  return (
    <div className="img-border-container">
      <img src={require("@site/static" + src).default} alt={alt ? alt : caption} />
    </div>
  );
}
