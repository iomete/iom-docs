import React from "react";

const ReleaseTitle = ({ version, date, title }) => {
  return (
    <div style={{ marginTop: 48 }}>
      <span style={{ color: "var(--ifm-color-gray-700)" }}>{date}</span>
      <h2 style={{ marginTop: 0, fontWeight: "bold" }}>
        {version}: {title}
      </h2>
    </div>
  );
};

export default ReleaseTitle;
