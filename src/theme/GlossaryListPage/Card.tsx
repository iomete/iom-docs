import React from "react";
import type { Content, FrontMatter } from "@theme/BlogPostPage";

import styles from "./styles.module.scss";
import Link from "@docusaurus/Link";

interface ContentExtended extends Content {
  frontMatter: FrontMatter & { coverImage?: string; tags?: string[]; featured_blog?: string };
}

function Card({ frontMatter, metadata }: ContentExtended) {
  // console.log("Card", frontMatter, assets, metadata);

  return (
    <Link to={metadata.permalink} className={styles.CardLink} style={{ textDecoration: "none" }}>
      <div className={`${styles.Card} item shadow--lw`}>
        <div className="card__body">
          <h3 className={styles.CardTitle}>{frontMatter.title}</h3>
          <small className={styles.CardDesc}>{frontMatter.description}</small>
        </div>
      </div>
    </Link>
  );
}

export default Card;
