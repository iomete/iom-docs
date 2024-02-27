import Layout from "@theme/Layout";

import styles from "./styles.module.scss";

import "./styles.module.scss";
import Header from "./_hero_new/Header";
import Guides from "./_hero_new/Guides";

import BlogPosts from "./_hero_new/BlogPosts";
import Community from "./_hero_new/Community";
import Resources from "./_hero_new/Resources";

export default function Home() {
  return (
    <Layout
      title="Documentation"
      description="Explore the limitless possibilities of IOMETE with our comprehensive tutorials and resourceful guides. Elevate your IOMETE experience through in-depth insights, step-by-step tutorials, and a curated collection of valuable resources.
    "
    >
      <div className={`container mt-[52px] ${styles.HeroContainer}`}>
        <Header />

        <Guides />

        <Resources />

        <BlogPosts />

        <Community />
      </div>
    </Layout>
  );
}
