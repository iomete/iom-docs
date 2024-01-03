import React from "react";
import type { Content, FrontMatter } from "@theme/BlogPostPage";

import styles from "./styles.module.scss";
import Link from "@docusaurus/Link";
import clsx from "clsx";
import useBaseUrl from "@docusaurus/useBaseUrl";

interface ContentExtended extends Content {
  frontMatter: FrontMatter & {
    coverImage?: string;
    tags?: string[];
    featured_blog?: boolean;
    banner_description?: string;
  };
  isFeatured?: boolean;
  baseUrl: string;
}

interface IAvatarProps {
  date: string;
  authors: Content["metadata"]["authors"];
}
function Avatar({ authors: [author], date }: IAvatarProps) {
  return (
    <div className="avatar">
      <img className="avatar__photo" src={author.imageURL} />
      <div className="avatar__intro">
        <span>{author.name}</span>
        <small>{date}</small>
      </div>
    </div>
  );
}

function Card({ frontMatter, metadata, isFeatured }: ContentExtended) {
  const baseUrl = useBaseUrl("/");

  // console.log("Card", frontMatter, assets, metadata);
  const imgUrl =
    baseUrl + frontMatter.coverImage?.startsWith("/") ? frontMatter.coverImage : `/${frontMatter.coverImage}`;

  return (
    <Link to={metadata.permalink} className={styles.CardLink}>
      <div className={clsx("card", isFeatured && styles.FeaturedCard)}>
        <div className="card__image">
          <img src={imgUrl} alt="Cover" className={styles.CardImg} />
        </div>
        <div className="card__body">
          {!isFeatured && <small className={styles.CardTags}>{frontMatter.tags?.[0]}</small>}
          <h3 className={styles.CardTitle}>{frontMatter.title}</h3>
          <small className={styles.CardDesc}>{frontMatter.banner_description || frontMatter.description}</small>
          <Avatar authors={metadata.authors || []} date={metadata.formattedDate} />
        </div>
      </div>
    </Link>
  );
}

export default Card;
