import React from "react";
import type { Content, FrontMatter } from "@theme/BlogPostPage";

import styles from "./styles.module.scss";
import Link from "@docusaurus/Link";
import Heading from "@theme/Heading";

interface ContentExtended extends Content {
  frontMatter: FrontMatter & { coverImage?: string; tags?: string[]; featured_blog?: string };
}

function Card({ frontMatter, metadata }: ContentExtended) {
  return (
    <Link to={metadata.permalink} className={styles.CardLink} style={{ textDecoration: "none" }}>
      <div className={`${styles.Card}`}>
        <div className={`${styles.CardBody} card__body`}>
          <Heading as="h3" className={styles.CardTitle}>
            {frontMatter.title}
          </Heading>
          <small className={styles.CardDesc}>{frontMatter.description}</small>
          <div className={styles.CardReadMore}>Read more</div>
        </div>
      </div>
    </Link>
  );
}

export default Card;
