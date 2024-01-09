import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";

import Card from "@site/src/components/Card";
import GridBox from "@site/src/components/GridBox";
import { BookOpenText, ChatCenteredText, Notebook, Wrench } from "@phosphor-icons/react";

const cards = [
  {
    to: "docs",
    title: "Comprehensive Documentation",
    description: "Explore our extensive docs to find in-depth explanations, tutorials, and guides on various topics.",
    icon: <Notebook size={38} weight="light" />,
  },
  {
    to: "docs/guides",
    title: "Actionable Guides",
    description: "Discover step-by-step guides and practical solutions to help you navigate our platform and achieve your goals.",
    icon: <Wrench size={38} weight="light" color="currentColor" />,
  },
  {
    to: "blog",
    title: "Insightful Articles",
    description: "Delve into our blog to stay updated on industry trends, discover insightful articles, and engage with our experts.",
    icon: <ChatCenteredText size={38} weight="light" />,
  },
  {
    to: "glossary",
    title: "Terminology Dictionary",
    description: "Navigate our glossary to find definitions and explanations of key terms related to our platform and services.",
    icon: <BookOpenText size={38} weight="light" />,
  },
];

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description="Description will go into a meta tag in <head />">
      <div className="container margin-top--lg padding-top--lg">
        <Heading as="h3" className="hero__title">
          IOMETE Resources
        </Heading>
        <p className="hero__subtitle">Unlock the Power of Data Integration and Analytics with IOMETE's Modern Lakehouse Platform</p>

        <article className="margin-top--lg">
          <GridBox>
            {cards.map((card) => (
              <Card key={card.to} title={card.title} link={card.to} icon={card.icon}>
                {card.description}
              </Card>
            ))}
          </GridBox>
        </article>
      </div>
    </Layout>
  );
}
