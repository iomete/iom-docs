import React, { useEffect, useState } from "react";
import type { Props } from "@theme/BlogListPage";
import type { Content, FrontMatter } from "@theme/BlogPostPage";
import Card from "./card";
import styles from "./styles.module.scss";
import Search from "./search";
import Tags from "./tags";
import Header from "./header";
import Empty from "./empty";
import useBaseUrl from "@docusaurus/useBaseUrl";

export interface ContentExtended extends Content {
  frontMatter: FrontMatter & {
    coverImage?: string;
    tags2?: string[];
    featured_blog?: boolean;
    banner_description?: string;
  };
  isFeatured?: boolean;
  baseUrl: string;
}

interface PropsExtended extends Props {
  items: readonly { readonly content: ContentExtended }[];
}

function Container(props: PropsExtended) {
  const baseUrl = useBaseUrl("/");

  const featuredBlog = props.items.find(
    (item) => (item.content.frontMatter as any).featured_blog
  );
  const posts = [
    ...props.items.filter(
      (item) => !(item.content.frontMatter as any).featured_blog
    ),
  ];

  const [searchState, setSearchState] = useState<{ word: string; tag: string }>(
    { word: "", tag: "" }
  );
  const [filteredResults, setFilteredResults] = useState<Props["items"]>(posts);

  const onSearchChange = (val: string) => {
    setSearchState((old) => ({ ...old, word: val }));
  };

  const onTagChange = (val: string) => {
    setSearchState((old) => ({ ...old, tag: val }));
  };

  useEffect(() => {
    if (searchState.word !== "" || searchState.tag !== "") {
      const lowerWord = searchState.word.toLowerCase();

      const filteredData = posts.filter((item) => {
        const searchMatch = [
          item.content.frontMatter.title?.toLowerCase(),
          item.content.frontMatter.description?.toLowerCase(),
          item.content.frontMatter.banner_description?.toLowerCase(),
          ...item.content.metadata.authors.map((a) => a.name?.toLowerCase()),
        ].some((a) => a?.includes(lowerWord));

        if (lowerWord && searchState.tag) {
          return (
            searchMatch &&
            item.content.frontMatter.tags2?.includes(searchState.tag)
          );
        }

        if (lowerWord) {
          return searchMatch;
        }

        return item.content.frontMatter.tags2?.includes(searchState.tag);
      });

      setFilteredResults(filteredData);
    } else {
      setFilteredResults([...posts]);
    }
  }, [searchState]);

  return (
    <div className={styles.Container}>
      <Header baseUrl={baseUrl} />

      {featuredBlog && <Card {...(featuredBlog.content as any)} isFeatured />}

      <section className={styles.TagsSearchSection}>
        <Tags selected={searchState.tag} onChange={onTagChange} />
        <Search onChange={onSearchChange} />
      </section>

      <div className="row">
        {filteredResults?.length ? (
          filteredResults.map((item, index) => {
            return (
              <div className="col col--4 pb-8" key={index}>
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
