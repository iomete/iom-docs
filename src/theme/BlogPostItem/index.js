import React from 'react';
import BlogPostItem from '@theme-original/BlogPostItem';
import Head from "@docusaurus/Head";

export default function BlogPostItemWrapper(props) {
  // const { frontMatter } = useBlogPost();
  return (
    <>
      <Head>
        <meta property="og:image" content={'/img/iomete-blog-og.png'} />
        <meta name="twitter:image" content={'/img/iomete-blog-og.png'} />
      </Head>
      <BlogPostItem {...props} />
    </>
  );
}
