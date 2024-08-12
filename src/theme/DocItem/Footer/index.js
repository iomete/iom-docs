import React from 'react';
import Footer from '@theme-original/DocItem/Footer';
// import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
// import { useDoc } from '@docusaurus/theme-common/internal';
// import Feedback from '@site/src/components/Feedback';
// TODO useDoc not defined
export default function FooterWrapper(props) {
  // const { metadata, frontMatter } = useDoc();
  // console.log(metadata, frontMatter);

  return (
    <>
      <Footer {...props} />
      {/* {!frontMatter.hideFeedback && <Feedback label={metadata.unversionedId} />} */}
    </>
  );
}
