import React from "react";

import type { FrontMatter } from "@theme/BlogPostPage";
import type { Content } from "@theme/BlogPostPage";
import type { Tag, TagModule } from "@docusaurus/utils";
import type { Author } from "@docusaurus/plugin-content-blog";

type Props = {
  content: Omit<Content, "children">;
  tag?: TagModule;
};

export const MainCard = ({ tag, content }: Props) => {

  const tags: Tag[] = !!tag ? [tag] : content.metadata.tags ?? [];
  const frontMatter: FrontMatter = content.frontMatter;
  
  // Todo remove '/docs' after blog migration
  const imageUrl = "/docs/" + frontMatter?.image;
  const autor: Author = content.metadata.authors[0];
  
  return (
    <>
      <a href={content.metadata.permalink} className="blog-main-card">
        <div className="blog-card-img">
          <img src={imageUrl} alt={frontMatter.title} />
        </div>
        <div className="blog-card-footer">
          <div>
            <span>{tags.map((tag) => tag.label).join(", ")}</span>
            <h2>{frontMatter.title}</h2>
            {(frontMatter as any).featured_content && (<p>{(frontMatter as any).featured_content}</p>)}
            {/* <p>
            In this post we share our Hate List: four observations around the customer and value proposition of "The Data Cloud" (the establishment) and how we've used these observations to engineer our own value and customer proposition.
            </p> */}
          </div>

          <div>
            <div>
              <img src={content.assets.authorsImageUrls[0]} alt="Avatar" />
              <div>
                <div>{autor.name}</div>
                <div>
                  {content.metadata.formattedDate}
                </div>
              </div>
            </div>
          </div>
        </div>
      </a>
    </>
  );
};
