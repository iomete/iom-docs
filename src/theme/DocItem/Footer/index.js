import React from 'react';
import {useDoc} from '@docusaurus/theme-common/internal';
import Feedback from '@site/src/components/Feedback';

export default function DocItemFooter() {
  const {metadata, frontMatter} = useDoc();

  if(frontMatter.hideFeedback) {
    return null;
  }

  return (
    <Feedback label={metadata.unversionedId} />
  );
}
