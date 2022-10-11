import React from "react";

export const Header = () => {
  return (
    <div className="mb-16">
      <h1 className="text-center text-5xl font-bold md:text-7xl md:font-extrabold">The iomete blog</h1>
      <p className="max-w-2xl mx-auto text-xl">
        Welcome to our blog. Here’s where we share company news, engineering updates and educational content. Please{" "}
        <a href="#blogNewsletter">subscribe to our newsletter</a> and drop us a message at{" "}
        <a href="mailto:hello@iomete.com">hello@iomete.com.</a> We’d love to hear from you!
      </p>
    </div>
  );
};
