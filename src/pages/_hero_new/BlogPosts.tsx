import React from "react";
import { latestBlogs } from "./consts";
import Link from "@docusaurus/Link";

function BlogPosts() {
  return (
    <div className="mt-[52px]">
      <h2 className="mb-6">Latest Blog Posts</h2>

      <div className="grid grid-cols-3 gap-6">
        {latestBlogs.map((blog, index) => (
          <Link className="col-span-2 sm:col-span-1" key={index} to={blog.url}>
            <div className="bg-black p-4 rounded-[3px] cursor-pointer hover:shadow-xl">
              <div style={{ marginBottom: 32 }}>{blog.icon}</div>

              <h3 className="text-white mb-2.5 text-[20px] leading-6">
                {blog.title}
              </h3>

              <p className="text-[#858C9D] text-xs leading-4 mb-0">
                {blog.date} · {blog.duration}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default BlogPosts;
