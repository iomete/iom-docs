import React from "react";
import styles from "./styles.module.scss";
import Link from "@docusaurus/Link";
import clsx from "clsx";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { ContentExtended } from "../Container";

function Card({ frontMatter, metadata, isFeatured }: ContentExtended) {
  const baseUrl = useBaseUrl("/");
  const imgUrl = baseUrl + (frontMatter.coverImage?.startsWith("/") ? frontMatter.coverImage.slice(1) : frontMatter.coverImage);

  return (
    <Link to={metadata.permalink} className={styles.CardLink}>
      <div className={clsx(`card ${styles.Card}`, isFeatured && styles.FeaturedCard)}>
        <div className="card__image">
          <img src={imgUrl} alt="Cover" className={styles.CardImg} />
        </div>
        <div className={`card__body ${styles.CardBody}`}>
          <div className={styles.CardTags}>{!isFeatured && frontMatter.tags2?.map((t) => <small key={t}>{t}</small>)}</div>
          <h3 className={styles.CardTitle}>{frontMatter.title}</h3>
          <small className={styles.CardDesc}>{frontMatter.banner_description || frontMatter.description}</small>
          <p className={styles.CardDate}>
            {metadata.formattedDate}{" "}
            {isFeatured && (
              <>
                <span>•</span> <span className={styles.CardFeaturedText}>Featured post</span>
              </>
            )}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default Card;
