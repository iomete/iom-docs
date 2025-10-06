import { latestBlogs } from "./consts";
import Link from "@docusaurus/Link";
import { BASE_PATH } from "../../../consts";

function BlogPosts() {
  return (
    <div className="mt-[52px]">
      <h2 className="mb-6">Latest Blog Posts</h2>

      <div className="flex gap-4 overflow-x-auto pb-3">
        {latestBlogs.map((blog, index) => (
          <Link key={index} to={blog.url} className="min-w-60">
            <div className="bg-[var(--racing-800)] p-4 rounded-[3px] cursor-pointer h-full flex flex-col justify-between">
              {/* Logo wrapper */}
              <div className="flex items-center justify-between mb-8 h-5">
                <img
                  src={`${BASE_PATH}/logo-white.svg`}
                  alt="Logo"
                  className="h-3 object-contain"
                />
              </div>

              {/* Content */}
              <div>
                <p className="text-[var(--base-300)] text-xs leading-4 mb-2">
                  {blog.date}
                </p>
                <h3 className="text-[var(--base-100)] text-[16px] leading-snug mb-0">
                  {blog.title}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default BlogPosts;
