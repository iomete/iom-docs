
import React from 'react';
import Layout from '@theme/Layout';
import { CustomCard, CustomCardList } from '@site/src/components/BlogListCustom';


export default function Hello() {
  return (
    <Layout title="Hello" description="Hello React Page">
      {/* <CustomCard /> */}
      <CustomCardList/>
    </Layout>
  );
}