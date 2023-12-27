import React, { useState } from "react";
import type { Props } from "@theme/BlogListPage";
import Card from "./Card";
import styles from "./styles.module.scss";
import Search from "./search";

function Container(props: Props) {
  const posts = [...props.items.filter((item) => !(item.content.frontMatter as any).featured_blog)].sort((a, b) =>
    (a.content.frontMatter as any).title.toUpperCase() > (b.content.frontMatter as any).title.toUpperCase()
      ? 1
      : (b.content.frontMatter as any).title.toUpperCase() > (a.content.frontMatter as any).title.toUpperCase()
      ? -1
      : 0
  );

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

  // className={clsx("container", styles.Container)}
  return (
    <div className={styles.Container}>
      <section className={styles.TagsSearchSection}>
        <Search onChange={onSearchChange} />
        {/* <Tags activeTag={props.metadata.permalink} /> */}
      </section>

      <div className="row">
        {filteredResults.map((item, index) => {
          return (
            <div className="col col--12 margin-vert--sm" key={index}>
              <Card {...(item.content as any)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Container;
