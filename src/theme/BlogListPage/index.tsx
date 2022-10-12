import React from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import type { Props } from "@theme/BlogListPage";
import type { Props as TagProps } from "@theme/BlogTagsPostsPage";
import { ThemeClassNames } from "@docusaurus/theme-common";

import { Tags } from "./tags";
import { Header } from "./header";
import { Cards } from "./card";

export default function BlogListPage(props: Props | TagProps) {
  const metadata = "listMetadata" in props ? props.listMetadata : props.metadata;

  const {
    siteConfig: { title: siteTitle },
  } = useDocusaurusContext();

  const { blogDescription, blogTitle, permalink } = metadata;

  const title = permalink === "/" ? siteTitle : blogTitle;

  const tag = "tag" in props ? props.tag : null;

  return (
    <Layout title={title} description={blogDescription} wrapperClassName={ThemeClassNames.wrapper.blogPages}>
      <main className="max-w-7xl mx-auto mt-2 md:mt-20 mb-8 p-6">
        <Header />

        <Tags activeTag={metadata.permalink} />

        {/* <div className="mt-12">
          <h2>{tag ? `Articles tagged with "${tag.label}"` : "Blog Posts"}</h2>
        </div> */}

        <div className="mt-12 grid grid-flow-row gap-6 text-neutral-600 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {props.items.map(({ content }) => (
            <Cards key={content.metadata.permalink} content={content as any} tag={tag} />
          ))}
        </div>
      </main>
    </Layout>
  );
}
