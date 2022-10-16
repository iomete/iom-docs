import React from "react";

import type { FrontMatter } from "@theme/BlogPostPage";
import type { Content } from "@theme/BlogPostPage";
import type { Tag, TagModule } from "@docusaurus/utils";
import type { Author } from "@docusaurus/plugin-content-blog";

type Props = {
  content: Omit<Content, "children">;
  tag?: TagModule;
};

export const Cards = ({ tag, content }: Props) => {
  const tags: Tag[] = !!tag ? [tag] : content.metadata.tags ?? [];
  const frontMatter: FrontMatter = content.frontMatter;

  // Todo remove '/docs' after blog migration
  const imageUrl = frontMatter.image;
  // console.log(tags, { ...content });
  const autor: Author = content.metadata.authors[0];

  return (
    <>
      <a href={content.metadata.permalink} className="blog-card">
        <img className="blog-card-image" src={imageUrl} alt={frontMatter.title} />
        <div className="blog-card-footer">
          <span className="blog-card-tags">{tags.map((tag) => tag.label).join(", ")}</span>
          <h2 className="blog-card-title">{frontMatter.title}</h2>
          <p className="blog-card-description">{frontMatter.description}</p>
          <div className="blog-card-author">
            <img className="blog-card-avatar" src={content.assets.authorsImageUrls[0]} alt="Avatar" />
            <div className="blog-card-author-name">{autor.name} <span className="blog-card-post-date">&nbsp;·&nbsp; {content.metadata.formattedDate}</span></div>
          </div>
        </div>
      </a>
    </>
  );
};
