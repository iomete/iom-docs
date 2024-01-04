import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import Card from "@site/src/components/Card";
import GridBox from "@site/src/components/GridBox";

const cards = [
  {
    to: 'docs', title: 'Docs', description: 'Documentations'
  },
  {
    to: 'docs/guides', title: 'Guides', description: 'Guides'
  },
  {
    to: 'blog', title: 'Blog', description: 'Blog'
  },
  {
    to: 'glossary', title: 'Glossary', description: 'Glossary'
  }
]

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Description will go into a meta tag in <head />">

      <div className="container margin-top--lg padding-top--lg">
        <Heading as="h3" className="hero__title">
          IOMETE Resources
        </Heading>
        <p className="hero__subtitle">IOMETE Resources</p>

        <article className="margin-top--lg">
          <GridBox>
            {cards.map(card => <Card key={card.to} title={card.title} link={card.to}>
              {card.description}
            </Card>)}
          </GridBox>
        </article>
      </div>
    </Layout>
  );
}
