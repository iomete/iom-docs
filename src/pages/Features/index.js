import { BookOpenText, ChatCenteredText, Notebook, Wrench } from "@phosphor-icons/react";

import Card from "./Card";

const cards = [
  {
    to: "docs",
    title: "Comprehensive Documentation",
    description: "Explore our extensive docs to find in-depth explanations, tutorials, and guides on various topics.",
    label: "User Guide",
  },
  {
    to: "docs/guides",
    title: "Actionable Guides",
    description: "Discover step-by-step guides and practical solutions to help you navigate our platform and achieve your goals.",
    label: "User Guide",
  },
  {
    to: "blog",
    title: "Insightful Articles",
    description: "Delve into our blog to stay updated on industry trends, discover insightful articles, and engage with our experts.",
    label: "User Guide",
  },
  {
    to: "glossary",
    title: "Terminology Dictionary",
    description: "Navigate our glossary to find definitions and explanations of key terms related to our platform and services.",
    label: "User Guide",
  },
];
export default function Features() {
  return (
    <>
      <h3>Featured Resources</h3>
      <p>Dive into our top picks</p>

      <div className="row">
        {cards.map((card) => (
          <div className="col col--3" key={card.to}>
            <Card label={card.label} title={card.title} link={card.to} description={card.description}></Card>
          </div>
        ))}
      </div>
    </>
  );
}
