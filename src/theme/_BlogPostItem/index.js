import React from "react";
import BlogPostItem from "@theme-original/BlogPostItem";
import Head from "@docusaurus/Head";

import useBaseUrl from "@docusaurus/useBaseUrl";

export default function BlogPostItemWrapper(props) {
  const baseUrl = useBaseUrl("/");

  return (
    <>
      <Head>
        <meta property="og:image" content={baseUrl + "img/iomete-blog-og.png"} />
        <meta name="twitter:image" content={baseUrl + "img/iomete-blog-og.png"} />
      </Head>

      <BlogPostItem {...props} />
    </>
  );
}
