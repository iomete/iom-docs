import React from 'react';
import DocTagsListPage from '@theme-original/DocTagsListPage';
import Head from '@docusaurus/Head';

export default function DocTagsListPageWrapper(props) {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow, noarchive" />
        <meta name="googlebot" content="noindex, nofollow, noarchive" />
      </Head>
      <DocTagsListPage {...props} />
    </>
  );
}
