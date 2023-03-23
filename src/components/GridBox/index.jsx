import React from "react";
import "./style.scss";

const GridBox = ({ children }) => <div className="grid-box">{children}</div>;

export default GridBox;

/*
EXAMPLE OF USAGE:

import Card from "@site/src/components/Card";
import GridBox from "@site/src/components/GridBox";
import { File } from "@phosphor-icons/react";

<GridBox>
<Card title="Using AWS Profiles" icon={<File />} link="#">
  IOMETE can be configured to fit your organization's needs in the most efficient way. The Guides section contains instructions to help you through
  the process.
</Card>

<Card title="Using AWS Profiles" icon={<File />} link="#">
  IOMETE can be configured to fit your organization's needs in the most efficient way.
</Card>

<Card title="Using AWS Profiles" icon={<File />} link="#">
  IOMETE can be configured to fit your organization's needs in the most efficient way. The Guides section contains instructions to help you through
  the process.
</Card>

<Card title="Using AWS Profiles" icon={<File />} link="#">
  IOMETE can be configured to fit your organization's needs in the most efficient way.
</Card>

<Card title="Using AWS Profiles" icon={<File />} link="#">
  IOMETE can be configured to fit your organization's needs in the most efficient way. The Guides section contains instructions to help you through
  the process.
</Card>
</GridBox>
*/
