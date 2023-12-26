import React from 'react';
import DocTagDocListPage from '@theme-original/DocTagDocListPage';

export default function DocTagDocListPageWrapper(props) {
  return (
    <>
      {/* Just prevent indexing */}
      <head>
        <meta name="robots" content="noindex, nofollow, noarchive" />
        <meta name="googlebot" content="noindex, nofollow, noarchive" />
      </head>
      {/* Just prevent indexing */}
      <DocTagDocListPage {...props} />
    </>
  );
}
