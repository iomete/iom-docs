import React from "react";
import { latestBlogs } from "./consts";
import Link from "@docusaurus/Link";

function BlogPosts() {
  return (
    <div className="mt-[52px]">
      <h2 className="mb-6">Latest Blog Posts</h2>

      <div className="flex gap-4 overflow-x-auto pb-3">
        {latestBlogs.map((blog, index) => (
          <Link key={index} to={blog.url} className="min-w-60">
            <div className="bg-[var(--base-800)] p-4 rounded-[3px] cursor-pointer h-[100%]">
              <div style={{ marginBottom: 32 }}>{blog.icon}</div>

              <h3 className="text-[var(--base-100)] mb-2.5 text-[20px] leading-6">
                {blog.title}
              </h3>

              <p className="text-[var(--base-300)] text-xs leading-4 mb-0">
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
