import React from 'react';
import Footer from '@theme-original/DocItem/Footer';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import Feedback from '@site/src/components/Feedback';
export default function FooterWrapper(props) {
  const { metadata, frontMatter } = useDoc();

  return (
    <>
      <Footer {...props} />
      {!frontMatter.hideFeedback && <Feedback label={metadata.id} />}
    </>
  );
}
