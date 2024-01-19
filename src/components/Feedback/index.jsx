import React, { useState } from "react";
import styles from "./styles.module.scss";
import { ThumbsDown, ThumbsUp } from "@phosphor-icons/react";
import useIsBrowser from "@docusaurus/useIsBrowser";

const Feedback = ({ label }) => {
  const [haveVoted, setHaveVoted] = useState(false);
  const useDom = useIsBrowser();

  if (!useDom) return;

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
      {haveVoted ? (
        <div className={styles.FeedbackCard}>
          <p>Thanks for letting us know!</p>
        </div>
      ) : (
        <>
          <div className={styles.FeedbackCard}>
            <span>Did this page help you?</span>

            <span title="Happy" data-doc-useful="yes" className={styles.Action} onClick={() => giveFeedback("yes")}>
              <span className={styles.Iconx}>
                <ThumbsUp size={18} weight="light" />
                Yes
              </span>
            </span>

            <span title="Disappointed" data-doc-useful="no" className={styles.Action} onClick={() => giveFeedback("no")}>
              <span className={styles.Iconx}>
                <ThumbsDown size={18} weight="light" />
                No
              </span>
            </span>
          </div>
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
