import React, { useEffect, useState } from "react";
import type { Props } from "@theme/BlogListPage";
import Card from "./Card";
import Tags from "./tags";
import styles from "./styles.module.scss";
import Search from "./search";
import Empty from "../BlogListPage/empty";

function Container(props: Props) {
  const [searchState, setSearchState] = useState<{ word: string; alphabet: string }>({ word: "", alphabet: "" });

  // const all = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  const alphabets = [...new Set(props.items.map((item) => (item.content.frontMatter as any).alphabet) || [])].sort();

  const posts = [...props.items].sort((a, b) =>
    (a.content.frontMatter as any).title.toUpperCase() > (b.content.frontMatter as any).title.toUpperCase()
      ? 1
      : (b.content.frontMatter as any).title.toUpperCase() > (a.content.frontMatter as any).title.toUpperCase()
      ? -1
      : 0
  );

  const [filteredResults, setFilteredResults] = useState<Props["items"]>(posts);

  useEffect(() => {
    console.log(searchState);

    if (searchState.word !== "" || searchState.alphabet !== "") {
      const lowerWord = searchState.word.toLowerCase();

      const filteredData = posts.filter((item) => {
        const lowerTitle = item.content.frontMatter.title?.toLowerCase();

        if (lowerWord && searchState.alphabet) {
          return lowerTitle?.includes(lowerWord) && (item.content.frontMatter as any).alphabet === searchState.alphabet;
        }

        if (lowerWord) {
          return lowerTitle?.includes(lowerWord);
        }

        return (item.content.frontMatter as any).alphabet === searchState.alphabet;
      });

      setFilteredResults(filteredData);
    } else {
      setFilteredResults([...posts]);
    }
  }, [searchState]);

  const onSearchChange = (val: string) => {
    setSearchState((old) => ({ ...old, word: val }));
  };

  const onAlphabetChange = (val: string) => {
    setSearchState((old) => ({ ...old, alphabet: val }));
  };

  return (
    <div className={styles.Container}>
      <h1>Glossary</h1>

      <section className={styles.TagsSearchSection}>
        <Search onChange={onSearchChange} />
        <Tags list={alphabets} selected={searchState.alphabet} onChange={onAlphabetChange} />
      </section>

      <div className={`${styles.CardRow} row`}>
        {filteredResults?.length ? (
          filteredResults.map((item, index) => {
            return (
              <div className="col col--12 margin-vert--sm" key={index}>
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
