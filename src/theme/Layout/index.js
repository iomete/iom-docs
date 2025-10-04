import React from 'react';
import OriginalLayout from '@theme-original/Layout';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function Layout(props) {
  const { siteConfig } = useDocusaurusContext();
  const { title, url } = siteConfig;

  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "IOMETE",
    "url": url,
    "logo": `${url}/img/iomete-logo-dark-bg.png`,
    "description": "IOMETE is a modern data lakehouse platform that provides managed Apache Spark and Iceberg for efficient data management.",
    "sameAs": [
      "https://github.com/iomete",
      "https://www.linkedin.com/company/iomete",
      "https://twitter.com/iomete"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Technical Support",
      "url": "https://community.iomete.com"
    }
  };

  // WebSite Schema with SearchAction
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": title,
    "url": url,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${url}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <Head>
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(websiteSchema)}
        </script>
      </Head>
      <OriginalLayout {...props} />
    </>
  );
}