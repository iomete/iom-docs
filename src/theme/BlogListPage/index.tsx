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
import { MainCard } from "./main-card";

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

  const mainBlog = metadata.page === 1 && [...props.items].find((item) => (item.content.frontMatter as any).featured_blog);
  console.log(mainBlog);
  
  const posts = [...props.items.filter((item) => !(item.content.frontMatter as any).featured_blog)]


  const onChange = (val: string) => {
    setSearchInput(val);
    if (val !== "") {
      const filteredData = posts.filter((item) => {
        return [
          item.content.frontMatter.title.toLowerCase(),
          ...item.content.metadata.tags.map((a) => a.label.toLowerCase()),
          ...item.content.metadata.authors.map((a) => a.name.toLowerCase()),
          item.content.metadata.formattedDate.toLowerCase(),
        ].some((a) => a.includes(val.toLowerCase()));
      });
      setFilteredResults(filteredData);
    } else {
      setFilteredResults([...posts]);
    }
  };

  const List = ({ list }) => {
    return !list.length ? (
      <NoResult />
    ) : (
      <div className="blog-cards">
        {list.map(({ content }) => (
          <Cards key={content.metadata.permalink} content={content as any} tag={tag} />
        ))}
      </div>
    );
  };

  return (
    <Layout title={title} description={blogDescription} wrapperClassName={ThemeClassNames.wrapper.blogPages}>
      <main className="blog-main">
        <Header />

        {/* {mainBlog && (<MainCard content={mainBlog.content} tag={tag}/>)} */}

        <div className="blog-tags-search">
          <Tags activeTag={metadata.permalink} />
          <Search onChange={onChange} />
        </div>

        {searchInput.length > 1 ? <List list={filteredResults} /> : <List list={posts} />}
      </main>
    </Layout>
  );
}
