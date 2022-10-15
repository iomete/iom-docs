import React from "react";

export const Header = () => {
  return (
    <div className="blog-header">
      <h1>The iomete blog</h1>
      <p>
        Welcome to our blog. Here’s where we share company news, engineering updates and educational content. Please{" "}
        <a href="#blogNewsletter">subscribe to our newsletter</a> and drop us a message at{" "}
        <a href="mailto:hello@iomete.com">hello@iomete.com.</a> We’d love to hear from you!
      </p>
    </div>
  );
};
