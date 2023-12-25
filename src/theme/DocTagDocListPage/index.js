import React from 'react';
import DocTagDocListPage from '@theme-original/DocTagDocListPage';
import Head from '@docusaurus/Head';

export default function DocTagDocListPageWrapper(props) {
  return (
    <>
      {/* Just prevent indexing */}
      <Head>
        <meta name="robots" content="noindex, nofollow, noarchive" />
        <meta name="googlebot" content="noindex, nofollow, noarchive" />
      </Head>
      {/* Just prevent indexing */}
      <DocTagDocListPage {...props} />
    </>
  );
}
