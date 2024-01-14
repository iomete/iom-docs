import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";

import { BookOpenText, ChatCenteredText, Notebook, Wrench } from "@phosphor-icons/react";
import Header from "./Header";
import Features from "./Features";

import "./landing.scss";

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title="Documentation"
      description="Explore the limitless possibilities of IOMETE with our comprehensive tutorials and resourceful guides. Elevate your IOMETE experience through in-depth insights, step-by-step tutorials, and a curated collection of valuable resources.
    "
    >
      <div className="container margin-top--lg padding-top--lg">
        <div className="hero-bg"></div>
        <Header />
        <Features />
      </div>
    </Layout>
  );
}
