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

const ReleaseSection = ({ title, children }) => {
  return (
    <>
      <p style={{ marginBottom: "2px", fontWeight: "bold" }}>{title}</p>
      <div>{children}</div>
    </>
  );
};

const ReleaseDescription = ({ children }) => {
  return <div className="release-description">{children}</div>;
};

const Release = ({ version, date, title, children }) => {
  return (
    <article>
      <ReleaseTitle version={version} date={date} title={title} />
      {children}
    </article>
  );
};

export { Release, ReleaseTitle, ReleaseSection, ReleaseDescription };
