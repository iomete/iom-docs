import React from "react";
import BlogPostItem from "@theme-original/BlogPostItem";
import Head from "@docusaurus/Head";
import { useBlogPost } from "@docusaurus/theme-common/internal";

import useBaseUrl from "@docusaurus/useBaseUrl";

export default function BlogPostItemWrapper(props) {
  const baseUrl = useBaseUrl("/");
  const { metadata } = useBlogPost();

  //TODO
  metadata.authors = metadata.authors?.map((a) => {
    a.imageURL = baseUrl + a?.imageURL;
    return a;
  });

  return (
    <>
      <Head>
        <meta property="og:image" content={baseUrl + "/img/iomete-blog-og.png"} />
        <meta name="twitter:image" content={baseUrl + "/img/iomete-blog-og.png"} />
      </Head>

      <BlogPostItem {...props} />
    </>
  );
}
