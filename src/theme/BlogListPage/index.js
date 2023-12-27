import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
} from '@docusaurus/theme-common';
import BlogLayout from '@theme/BlogLayout';
import Container from './Container';
import Head from "@docusaurus/Head";

import './styles.scss';

function BlogListPageMetadata({ metadata }) {
  const {
    siteConfig: { title: siteTitle },
  } = useDocusaurusContext();

  const { blogDescription, blogTitle, permalink } = metadata;

  const isBlogOnlyMode = permalink === '/';
  const title = isBlogOnlyMode ? siteTitle : blogTitle;
  return (
    <>
      <PageMetadata title={title} description={blogDescription} />
    </>
  );
}
export default function BlogListPage(props) {
  console.log(useDocusaurusContext());
  // console.log('props', props);
  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogListPage,
        'iom-blog-list'
      )}>
      {props.metadata && <BlogListPageMetadata metadata={props.metadata} />}

      {!props.metadata && <Head>
        <meta name="robots" content="noindex, nofollow, noarchive" />
        <meta name="googlebot" content="noindex, nofollow, noarchive" />
      </Head>}
      <BlogLayout >
        <Container {...props} metadata={props.listMetadata || props.metadata} />
      </BlogLayout>
    </HtmlClassNameProvider>
  );
}
