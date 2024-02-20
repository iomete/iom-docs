import Layout from "@theme/Layout";

import styles from "./styles.module.scss";

import "./styles.module.scss";
import Header from "./_hero_new/Header";
import Guides from "./_hero_new/Guides";
import BlogPosts from "./_hero_new/BlogPosts";
import Community from "./_hero_new/Community";
import Resources from "./_hero_new/resources";

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

        <Resources />

        <BlogPosts />

        <Community />
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
