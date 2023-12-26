import React from 'react';
import DocTagDocListPage from '@theme-original/DocTagDocListPage';
import Head from '@docusaurus/Head';

export default function DocTagDocListPageWrapper(props) {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow, noarchive" />
        <meta name="googlebot" content="noindex, nofollow, noarchive" />
      </Head>
      <DocTagDocListPage {...props} />
    </>
  );
}
