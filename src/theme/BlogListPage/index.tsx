import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import type { Props } from "@theme/BlogListPage";
import type { Props as TagProps } from "@theme/BlogTagsPostsPage";
import { ThemeClassNames } from "@docusaurus/theme-common";

import { Tags } from "./tags";
import { Header } from "./header";
import { Cards } from "./card";
import { Search } from "./search";
import { NoResult } from "./no-result";

export default function BlogListPage(props: Props | TagProps) {
  const [searchInput, setSearchInput] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);

  const metadata = "listMetadata" in props ? props.listMetadata : props.metadata;

  const {
    siteConfig: { title: siteTitle },
  } = useDocusaurusContext();

  const { blogDescription, blogTitle, permalink } = metadata;

  const title = permalink === "/" ? siteTitle : blogTitle;

  const tag = "tag" in props ? props.tag : null;

  const onChange = (val: string) => {
    setSearchInput(val);
    if (val !== "") {
      const filteredData = props.items.filter((item) => {
        return [
          item.content.frontMatter.title.toLowerCase(),
          ...item.content.metadata.tags.map((a) => a.label.toLowerCase()),
          ...item.content.metadata.authors.map((a) => a.name.toLowerCase()),
          item.content.metadata.formattedDate.toLowerCase(),
        ].some((a) => a.includes(val.toLowerCase()));
      });
      setFilteredResults(filteredData);
    } else {
      setFilteredResults([...props.items]);
    }
  };

  const List = ({ list }) => {
    return !list.length ? (
      <NoResult />
    ) : (
      <div className="mt-12 grid grid-flow-row gap-6 text-neutral-600 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {list.map(({ content }) => (
          <Cards key={content.metadata.permalink} content={content as any} tag={tag} />
        ))}
      </div>
    );
  };

  return (
    <Layout title={title} description={blogDescription} wrapperClassName={ThemeClassNames.wrapper.blogPages}>
      <main className="max-w-7xl mx-auto mt-2 md:mt-20 mb-8 p-6">
        <Header />
        <div className="w-full flex gap-5 gap-x-24 justify-between flex-wrap-reverse">
          <Tags activeTag={metadata.permalink} />
          <Search onChange={onChange} />
        </div>

        {searchInput.length > 1 ? <List list={filteredResults} /> : <List list={props.items} />}
      </main>
    </Layout>
  );
}
