import React from "react";
import Heading from "@theme/Heading";
import { latestBlogs } from "./consts";

function BlogPosts() {
  return (
    <div style={{ marginTop: 52 }}>
      <Heading as="h2">Latest Blog Posts</Heading>

      <div className="row">
        {latestBlogs.map((blog, index) => (
          <div className="col col--4" key={index}>
            <div
              className="col-demo"
              style={{
                backgroundColor: "black",
                padding: 16,
                borderRadius: 4,
                marginBottom: 12,
              }}
            >
              <div style={{ marginBottom: 32 }}>{blog.icon}</div>

              <h3 style={{ color: "white" }}>{blog.title}</h3>

              <p style={{ margin: 0 }}>
                {blog.date} · {blog.duration}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BlogPosts;
