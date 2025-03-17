import React from "react";
import BlogPostItem from "@theme-original/BlogPostItem";
import Head from "@docusaurus/Head";

import useBaseUrl from "@docusaurus/useBaseUrl";

export default function BlogPostItemWrapper(props) {
  const baseUrl = useBaseUrl("/");

  return (
    <>
      {!props.children.type.frontMatter.image && (
        <Head>
          <meta property="og:image" content={baseUrl + "IOMETE-og-blog.png"} />
          <meta name="twitter:image" content={baseUrl + "IOMETE-og-docs.png"} />
        </Head>
      )}

      <BlogPostItem {...props} />
    </>
  );
}
