import React from "react";
import clsx from "clsx";
import type { Content, FrontMatter } from "@theme/BlogPostPage";
import type { Props as TagProps } from "@theme/BlogTagsPostsPage";

import styles from "./styles.module.scss";
import Link from "@docusaurus/Link";

interface ContentExtended extends Content {
  frontMatter: FrontMatter & { coverImage?: string; tags?: string[] };
}

interface IAvatarProps {
  date: string;
  authors: Content["metadata"]["authors"];
}
function Avatar({ authors: [author], date }: IAvatarProps) {
  return (
    <div className="avatar">
      <img className="avatar__photo avatar__photo--sm" src={author.imageURL} />
      <div className="avatar__intro">
        {/* <div className="avatar__name"></div> */}
        {author.name}
        <small>{date}</small>
      </div>
    </div>
  );
}

function Card({ frontMatter, assets, metadata }: ContentExtended) {
  // console.log("Card", frontMatter, assets, metadata);

  return (
    <Link to={metadata.permalink} className={styles.CardLink}>
      <div className="card">
        <div className="card__image">
          <img src={frontMatter.coverImage} alt="Author" />
        </div>
        <div className="card__body">
          <small className={styles.CardTags}>{frontMatter.tags?.[0]}</small>
          <h3 className={styles.CardTitle}>{frontMatter.title}</h3>
          <small className={styles.CardDesc}>{frontMatter.description}</small>

          <Avatar authors={metadata.authors || []} date={metadata.formattedDate} />
          {/* <img src={content.assets.authorsImageUrls[0]} alt="Avatar" width={22} height={22} /> */}
        </div>
        <div className="card__footer">
          {/* <button className="button button--primary button--block">Visit</button> */}
        </div>
      </div>
    </Link>
  );
}

export default Card;
