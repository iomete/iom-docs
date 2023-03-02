import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import React, { useState } from "react";
import "./style.scss";

const Feedback = ({ label }) => {
  if (!ExecutionEnvironment.canUseDOM) {
    return null;
  }

  const [haveVoted, setHaveVoted] = useState(false);
  const giveFeedback = (value) => {
    if (window.gtag) {
      window.gtag("event", "Doc Feedback", {
        event_label: label,
        event_value: value,
      });
    }
    setHaveVoted(true);
  };

  return (
    <div className="feedback">
      <h5 className="title">Was this page useful?</h5>

      {haveVoted ? (
        <p>Thanks for letting us know!</p>
      ) : (
        <>
          <span title="Happy" data-doc-useful="yes" className="action" onClick={() => giveFeedback("yes")}>
            😄
          </span>
          <span title="Meh." data-doc-useful="no" className="action" onClick={() => giveFeedback("meh")}>
            😐
          </span>
          <span title="Disappointed" data-doc-useful="no" className="action" onClick={() => giveFeedback("no")}>
            😞
          </span>
        </>
      )}
    </div>
  );
};

export default Feedback;

/*
      <b>Need help?</b>

      <div className="margin-bottom--md margin-top--md">
        Join our
        <a className="margin-left--sm margin-right--sm" href="https://github.com/iomete/roadmap/discussions" target="_blank" rel="noreferrer">
          GitHub discussion board
        </a>
        to see how others are using IOMETE.
      </div>
*/
