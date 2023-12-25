import React from 'react';
import Footer from '@theme-original/DocItem/Footer';
import { useDoc } from '@docusaurus/theme-common/internal';
import Feedback from '@site/src/components/Feedback';

export default function FooterWrapper(props) {
  const { metadata, frontMatter } = useDoc();

  return (
    <>
      <Footer {...props} />
      {!frontMatter.hideFeedback && <Feedback label={metadata.unversionedId} />}
    </>
  );
}
