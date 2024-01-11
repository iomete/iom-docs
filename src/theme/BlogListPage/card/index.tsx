import React from "react";
import type { Content } from "@theme/BlogPostPage";

import styles from "./styles.module.scss";
import Link from "@docusaurus/Link";
import clsx from "clsx";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { ContentExtended } from "../Container";

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

  const imgUrl =
    baseUrl + (frontMatter.coverImage?.startsWith("/") ? frontMatter.coverImage.slice(1) : frontMatter.coverImage);

  return (
    <Link to={metadata.permalink} className={styles.CardLink}>
      <div className={clsx("card", isFeatured && styles.FeaturedCard)}>
        <div className="card__image">
          <img src={imgUrl} alt="Cover" className={styles.CardImg} />
        </div>
        <div className="card__body">
          <div className={styles.CardTags}>
            {!isFeatured && frontMatter.tags2?.map((t) => <small key={t}>{t}</small>)}
          </div>

          <h3 className={styles.CardTitle}>{frontMatter.title}</h3>
          <small className={styles.CardDesc}>{frontMatter.banner_description || frontMatter.description}</small>
          <Avatar authors={metadata.authors || []} date={metadata.formattedDate} />
        </div>
      </div>
    </Link>
  );
}

export default Card;
