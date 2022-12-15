import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import React, { useState } from 'react';

const Feedback = ({ label }) => {
  if (!ExecutionEnvironment.canUseDOM) {
    return null;
  }

  const [haveVoted, setHaveVoted] = useState(false);
  const giveFeedback = value => {
    if (window.ga) {
      window.ga('send', {
        hitType: 'event',
        eventCategory: 'button',
        eventAction: 'feedback',
        eventLabel: label,
        eventValue: value,
      });
    }
    setHaveVoted(true);
  };

  return (
    <div className='margin-top--lg'>
      <b>Need help?</b>

      <div className='margin-bottom--md margin-top--md'>
        Join our<a className='margin-left--sm margin-right--sm' href="https://github.com/iomete/roadmap/discussions" target="_blank" rel="noreferrer">GitHub discussion board</a>to see how others are using IOMETE.
      </div>

      <b className='margin-right--md'> <small>Was this page useful?</small></b>

      {haveVoted ? (
        <small>Thanks for letting us know!</small>
      ) : (
        <>
          <button data-doc-useful="yes" className="button button--sm button--outline button--success" onClick={() => giveFeedback('yes')}>Yes</button>
          <button data-doc-useful="no" className="button button--sm button--outline button--danger margin-left--sm" onClick={() => giveFeedback('no')}>No</button>
        </>
      )}

    </div>

  );
};

export default Feedback;
