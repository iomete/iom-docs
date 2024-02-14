import Layout from "@theme/Layout";

import Heading from "@theme/Heading";
import Img from "@site/src/components/Img";
import Features from "./_hero_/Features";
import styles from "./styles.module.scss";

import "./styles.module.scss";
import Header from "./_hero_new/Header";
import Guides from "./_hero_new/Guides";
import GettingStarted from "./_hero_new/GettingStarted";
import BlogPosts from "./_hero_new/BlogPosts";

export default function Home() {
  return (
    <Layout
      title="Documentation"
      description="Explore the limitless possibilities of IOMETE with our comprehensive tutorials and resourceful guides. Elevate your IOMETE experience through in-depth insights, step-by-step tutorials, and a curated collection of valuable resources.
    "
    >
      <div
        className={`container margin-top--lg padding-top--lg ${styles.HeroContainer}`}
      >
        <Header />

        <Guides />

        <GettingStarted />

        <BlogPosts />
      </div>
    </Layout>
    // <Layout
    //   title="Documentation"
    //   description="Explore the limitless possibilities of IOMETE with our comprehensive tutorials and resourceful guides. Elevate your IOMETE experience through in-depth insights, step-by-step tutorials, and a curated collection of valuable resources.
    // "
    // >
    //   <div
    //     className={`container margin-top--lg padding-top--lg ${styles.HeroContainer}`}
    //   >
    //     <div className={styles.HeroBg}></div>

    //     <div className={styles.IomHero}>
    //       <div className={styles.IomHeroText}>
    //         <Heading as="h1" className="hero__title">
    //           IOMETE Documentation
    //         </Heading>
    //         <p className="hero__subtitle">
    //           Enhance your IOMETE experience with in-depth tutorials and
    //           resourceful guides.
    //         </p>
    //       </div>
    //       <div className={styles.HeroImg}>
    //         <Img src="/img/landing/hero.png" borderless alt="IOMETE HERO" />
    //       </div>
    //     </div>

    //     <Features />
    //   </div>
    // </Layout>
  );
}
