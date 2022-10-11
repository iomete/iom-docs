import React from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import type { Props } from "@theme/BlogListPage";
import type { Props as TagProps } from "@theme/BlogTagsPostsPage";
import { ThemeClassNames } from "@docusaurus/theme-common";

import { Tags } from "./tags";
import { Header } from "./header";



export default function BlogListPage(props: Props | TagProps) {
  console.log(props);
  
  const metadata = "listMetadata" in props ? props.listMetadata : props.metadata;

  const {
    siteConfig: { title: siteTitle },
  } = useDocusaurusContext();

  const { blogDescription, blogTitle, permalink } = metadata;

  const title = permalink === "/" ? siteTitle : blogTitle;

  const tag = "tag" in props ? props.tag : null;

  return (
    <Layout title={title} description={blogDescription} wrapperClassName={ThemeClassNames.wrapper.blogPages}>
      <main className="max-w-6xl mx-auto mt-2 md:mt-20 mb-8 p-6">
        <Header />

        <Tags activeTag={ metadata.permalink } />

        <h2>{tag ? `Articles tagged with "${tag.label}"` : "Blog Posts"}</h2>
      </main>
    </Layout>
  );
}
