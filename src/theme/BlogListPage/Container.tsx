import React, { useState } from "react";
import clsx from "clsx";
import type { Props } from "@theme/BlogListPage";
import type { Props as TagProps } from "@theme/BlogTagsPostsPage";
import Card from "./Card";
import styles from "./styles.module.scss";
import Search from "./search";
import Tags from "./tags";

function Container(props: Props) {
  // console.log("props", props);
  const featuredBlog = props.items.find((item) => (item.content.frontMatter as any).featured_blog);
  const posts = [...props.items.filter((item) => !(item.content.frontMatter as any).featured_blog)];

  const selectedTag = "tag" in props ? props.tag : null;
  console.log("selectedTag", selectedTag);

  console.log("items", props, featuredBlog);

  const [filteredResults, setFilteredResults] = useState([]);

  const onSearchChange = (val: string) => {
    console.log("Search", val);
  };

  // className={clsx("container", styles.Container)}
  return (
    <div className={styles.Container}>
      <Tags activeTag={props.metadata.permalink} />
      <Search onChange={onSearchChange} />

      <div className="row">
        {posts.map((item, index) => {
          return (
            <div className="col col--4" key={index}>
              <Card {...(item.content as any)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Container;
