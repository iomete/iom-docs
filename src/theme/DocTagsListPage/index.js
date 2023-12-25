import React from 'react';
import DocTagsListPage from '@theme-original/DocTagsListPage';
import Head from '@docusaurus/Head';

export default function DocTagsListPageWrapper(props) {
  return (
    <>
      {/* Just prevent indexing */}
      <Head>
        <meta name="robots" content="noindex, nofollow, noarchive" />
        <meta name="googlebot" content="noindex, nofollow, noarchive" />
      </Head>
      {/* Just prevent indexing */}
      <DocTagsListPage {...props} />
    </>
  );
}
