import React from 'react';
import BlogTagsListPage from '@theme-original/BlogTagsListPage';

export default function BlogTagsListPageWrapper(props) {
  return (
    <>
      <head>
        <meta name="robots" content="noindex, nofollow, noarchive" />
        <meta name="googlebot" content="noindex, nofollow, noarchive" />
      </head>
      <BlogTagsListPage {...props} />
    </>
  );
}
