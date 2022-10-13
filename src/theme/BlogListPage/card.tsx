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
  const imageUrl = "/docs/" + frontMatter.image;
  console.log(tags, { ...content });
  const autor: Author = content.metadata.authors[0];

  return (
    <>
      <a
        href={content.metadata.permalink}
        className="flex flex-col no-underline max-w-lg overflow-hidde rounded shadow-sm hover:shadow-md outline outline-1 outline-gray-200 dark:outline-gray-700 bg-slate-50 hover:bg-slate-100 dark:bg-gray-800 dark:hover:bg-gray-900"
      >
        <img className="object-cover w-full h-48 lg:h-64" src={imageUrl} alt={frontMatter.title} />
        <div className="p-4 lg:p-6 flex-grow flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-blue-600 uppercase dark:text-blue-400">
              {tags.map((tag) => tag.label).join(", ")}
            </span>
            <div className="block mt-2 text-lg font-semibold text-gray-800 transition-colors duration-300 transform dark:text-white hover:text-gray-600">
              {frontMatter.title}
            </div>
          </div>

          <div className="mt-2 lg:mt-4 flex items-center justify-between">
            <div className="flex items-center">
              <img className="h-10 rounded-full" src={content.assets.authorsImageUrls[0]} alt="Avatar" />
              <div className="pl-3">
                <div className="font-semibold text-gray-700 dark:text-gray-200">{autor.name}</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  {/* {autor.title} */}
                  {content.metadata.formattedDate}
                </div>
              </div>
            </div>
            {/* <span className="text-xs text-gray-600 dark:text-gray-300">{content.metadata.formattedDate}</span> */}
          </div>
        </div>
      </a>
    </>
  );
};
