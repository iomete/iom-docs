import React from 'react';
import OriginalDocItemLayout from '@theme-original/DocItem/Layout';
import Head from '@docusaurus/Head';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function DocItemLayoutWrapper(props) {
  const { siteConfig } = useDocusaurusContext();
  const { metadata, frontMatter } = useDoc();
  const { title, description, editUrl, lastUpdatedAt, formattedLastUpdatedAt } = metadata;
  const { author, last_update } = frontMatter;

  // Generate Article/TechArticle schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": title,
    "description": description,
    "author": {
      "@type": "Person",
      "name": author || last_update?.author || "IOMETE Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "IOMETE",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteConfig.url}/img/iomete-logo-dark-bg.png`
      }
    },
    "dateModified": lastUpdatedAt ? new Date(lastUpdatedAt * 1000).toISOString() : new Date().toISOString(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${siteConfig.url}${metadata.permalink}`
    }
  };

  // Generate BreadcrumbList schema
  const breadcrumbItems = metadata.breadcrumbs || [];
  const breadcrumbSchema = breadcrumbItems.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": item.href ? `${siteConfig.url}${item.href}` : undefined
    }))
  } : null;

  return (
    <>
      <Head>
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
        {breadcrumbSchema && (
          <script type="application/ld+json">
            {JSON.stringify(breadcrumbSchema)}
          </script>
        )}
      </Head>
      <OriginalDocItemLayout {...props} />
    </>
  );
}