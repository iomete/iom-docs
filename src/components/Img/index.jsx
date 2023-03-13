import React from "react";
import "./style.scss";

export default function Img({ src, alt = "", caption = "", padding = 16, maxWidth = "unset", centered = false, imgClass = "" }) {
  const paddingBottom = padding - 8;
  const margin = centered ? "auto" : "inherit";

  return (
    <div className="imgContainer" style={{ maxWidth, marginLeft: margin, marginRight: margin }}>
      <div className="imgContent" style={{ padding: padding, paddingBottom: paddingBottom }}>
        <img className={imgClass} src={require("@site/static" + src).default} alt={alt ? alt : caption} />
      </div>
      {caption && <div className="imgCaption">{caption}</div>}
    </div>
  );
}
