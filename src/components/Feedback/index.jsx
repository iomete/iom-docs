import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import React, { useState } from "react";
import styles from "./styles.module.scss";
import { Smiley, SmileyMeh } from "@phosphor-icons/react";
import useIsBrowser from "@docusaurus/useIsBrowser";

const Feedback = ({ label }) => {
  if (!useIsBrowser()) return null;

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
    <div className={styles.Feedback}>
      <h5 className={styles.Title}>Was this page useful?</h5>

      {haveVoted ? (
        <p>Thanks for letting us know!</p>
      ) : (
        <>
          <span title="Happy" data-doc-useful="yes" className={styles.Action} onClick={() => giveFeedback("yes")}>
            <span className={styles.Iconx}>
              <Smiley size={20} weight="regular" />
            </span>
            Yes
          </span>
          <span title="Disappointed" data-doc-useful="no" className={styles.Action} onClick={() => giveFeedback("no")}>
            <span className={styles.Iconx}>
              <SmileyMeh size={20} weight="regular" />
            </span>
            No
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
