import clsx from "clsx";
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
} from "@docusaurus/theme-common";
import BlogLayout from "@theme/BlogLayout";
import Container from "./Container";
import Head from "@docusaurus/Head";

import "./styles.scss";

function BlogListPageMetadata({ metadata }) {
  const canonicalUrl = "https://iomete.com/blog";

  return (
    <>
      <Head>
        <link rel="canonical" href={canonicalUrl}></link>
        <meta property="og:url" content={canonicalUrl} />
        {!metadata && (
          <>
            <meta name="robots" content="noindex, nofollow, noarchive" />
            <meta name="googlebot" content="noindex, nofollow, noarchive" />
          </>
        )}
      </Head>

      {metadata && (
        <PageMetadata
          title={metadata.blogTitle}
          description={metadata.blogDescription}
        >
          {/* TODO put image to PageMetadata */}
          <meta property="og:image" content={"IOMETE-og-blog.png"} />
          <meta name="twitter:image" content={"IOMETE-og-docs.png"} />
        </PageMetadata>
      )}
    </>
  );
}
export default function BlogListPage(props) {
  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogListPage,
        "iom-blog-list"
      )}
    >
      <BlogListPageMetadata metadata={props.metadata} />

      <BlogLayout>
        <Container {...props} metadata={props.listMetadata || props.metadata} />
      </BlogLayout>
    </HtmlClassNameProvider>
  );
}
