import Layout from "@theme/Layout";

import Heading from "@theme/Heading";
import Img from "@site/src/components/Img";
import Features from "./_hero_/Features";

import "./landing.scss";

export default function Home() {
  return (
    <Layout
      title="Documentation"
      description="Explore the limitless possibilities of IOMETE with our comprehensive tutorials and resourceful guides. Elevate your IOMETE experience through in-depth insights, step-by-step tutorials, and a curated collection of valuable resources.
    "
    >
      <div className="container margin-top--lg padding-top--lg">
        <div className="hero-bg"></div>

        <div className="iom-hero">
          <div className="iom-hero-text">
            <Heading as="h1" className="hero__title">
              IOMETE Documentation
            </Heading>
            <p className="hero__subtitle">Enhance your IOMETE experience with in-depth tutorials and resourceful guides.</p>
          </div>
          <div className="hero-img">
            <Img src="/img/landing/hero.png" borderless alt="IOMETE HERO" />
          </div>
        </div>

        <Features />
      </div>
    </Layout>
  );
}
