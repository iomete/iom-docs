import React, { useState } from "react";
import type { Props } from "@theme/BlogListPage";
import Card from "./card";
import styles from "./styles.module.scss";
import Search from "./search";
import Tags from "./tags";
import Header from "./header";
import Empty from "./empty";
import useBaseUrl from "@docusaurus/useBaseUrl";

function Container(props: Props) {
  const baseUrl = useBaseUrl("/");

  const featuredBlog = props.items.find((item) => (item.content.frontMatter as any).featured_blog);
  const posts = [...props.items.filter((item) => !(item.content.frontMatter as any).featured_blog)];

  const [filteredResults, setFilteredResults] = useState<Props["items"]>(posts);

  const onSearchChange = (val: string) => {
    if (val !== "") {
      const filteredData = posts.filter((item) => {
        return [
          item.content.frontMatter.title?.toLowerCase(),
          ...item.content.metadata.tags.map((a) => a.label.toLowerCase()),
          ...item.content.metadata.authors.map((a) => a.name?.toLowerCase()),
          item.content.metadata.formattedDate.toLowerCase(),
        ].some((a) => a?.includes(val.toLowerCase()));
      });
      setFilteredResults(filteredData);
    } else {
      setFilteredResults([...posts]);
    }
  };

  return (
    <div className={styles.Container}>
      <Header baseUrl={baseUrl} />

      {featuredBlog && <Card {...(featuredBlog.content as any)} isFeatured />}

      <section className={styles.TagsSearchSection}>
        <Tags activeTag={props.metadata.permalink} />
        <Search onChange={onSearchChange} />
      </section>

      <div className="row">
        {filteredResults?.length ? (
          filteredResults.map((item, index) => {
            return (
              <div className="col col--4" key={index}>
                <Card {...(item.content as any)} />
              </div>
            );
          })
        ) : (
          <Empty />
        )}
      </div>
    </div>
  );
}

export default Container;
