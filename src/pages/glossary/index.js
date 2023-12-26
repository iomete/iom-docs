import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";

export default function Glossary() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={`Hello from ${siteConfig.title}`} description="Description will go into a meta tag in <head />">
      <main>
        <div className="container">
          <h1>Glossary</h1>

          <ul>
            <li>
              <Link to={"glossary/acid-transactions"}>What is an ACID transaction?</Link>
            </li>
            <li>
              <Link to={"glossary/adagrad"}>AdaGrad</Link>
            </li>
          </ul>
        </div>
      </main>
    </Layout>
  );
}
