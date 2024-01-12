import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";

import { BookOpenText, ChatCenteredText, Notebook, Wrench } from "@phosphor-icons/react";
import Header from "./Header";
import Features from "./Features";

import "./landing.scss";

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description="Description will go into a meta tag in <head />">
      <div className="container margin-top--lg padding-top--lg">
        <div className="hero-bg"></div>
        <Header />

        <Features />

        {/* <article className="margin-top--lg">
          <GridBox>
            {cards.map((card) => (
              <Card key={card.to} title={card.title} link={card.to} icon={card.icon}>
                {card.description}
              </Card>
            ))}
          </GridBox>
        </article> */}
      </div>
    </Layout>
  );
}
