import React from 'react';
import BlogTagsListPage from '@theme-original/BlogTagsListPage';
import Head from '@docusaurus/Head';

export default function BlogTagsListPageWrapper(props) {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow, noarchive" />
        <meta name="googlebot" content="noindex, nofollow, noarchive" />
      </Head>
      <BlogTagsListPage {...props} />
    </>
  );
}
