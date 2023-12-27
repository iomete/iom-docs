import React from 'react';
import BlogTagsListPage from '@theme-original/BlogTagsListPage';
import Head from '@docusaurus/Head';

export default function BlogTagsListPageWrapper(props) {
  const canonicalUrl = "https://iomete.com/blog";
  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow, noarchive" />
        <meta name="googlebot" content="noindex, nofollow, noarchive" />

        <link rel="canonical" href={canonicalUrl}></link>
        <meta property="og:url" content={canonicalUrl} />
      </Head>
      <BlogTagsListPage {...props} />
    </>
  );
}
