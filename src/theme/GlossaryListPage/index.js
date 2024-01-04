import clsx from "clsx";
import { PageMetadata, HtmlClassNameProvider, ThemeClassNames } from "@docusaurus/theme-common";
import BlogLayout from "@theme/BlogLayout";
import Container from "./Container";

import "./styles.scss";

export default function GlossaryListPage(props) {
  return (
    <HtmlClassNameProvider className={clsx(ThemeClassNames.wrapper.blogPages, ThemeClassNames.page.blogListPage, 'iom-glossary-list')}>
      <PageMetadata title='IOMETE glossary' description='Unlock the world of IOMETE with our comprehensive glossary. Your essential guide to the language of data and analytics.' />
      <BlogLayout>
        <Container {...props} />
      </BlogLayout>
    </HtmlClassNameProvider>
  );
}
