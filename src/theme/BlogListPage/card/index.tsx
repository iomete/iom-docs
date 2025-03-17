import React from "react";
import styles from "./styles.module.scss";
import Link from "@docusaurus/Link";
import clsx from "clsx";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { ContentExtended } from "../Container";
import CardTags from "./CardTags";
import CardDate from "./CardDate";

function Card({ frontMatter, metadata, isFeatured }: ContentExtended) {
  const baseUrl = useBaseUrl("/");
  const imgUrl = baseUrl + frontMatter.coverImage;

  return (
    <Link to={metadata.permalink} className={styles.CardLink}>
      <div className={clsx("blog", isFeatured && styles.FeaturedCard)}>
        <div className="card__image">
          <img src={imgUrl} alt="Cover" className={`${styles.CardImg} `} />
        </div>
        <div className={`card__body p-0 flex flex-col gap-1 min-w-[50%]`}>
          <div className="flex items-center gap-4">
            <CardDate date={metadata.date} />
            <CardTags tags={frontMatter.tags2} />
          </div>

          <h3 className="font-normal text-[1.3125rem] font-archivo text-[--base-700] dark:text-[--base-200]">
            {frontMatter.title}
          </h3>

          {isFeatured && (
            <p className="hidden md:block font-inter mt-8 pt-3 text-[--base-700] dark:text-[--base-400] border-0 border-t border-solid border-t-[var(--border-primary)]">
              {frontMatter.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default Card;
