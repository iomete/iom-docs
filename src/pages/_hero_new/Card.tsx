import Link from "@docusaurus/Link";
import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
  url?: string;
  isExternal?: string;
}

function Card({ children, url }: Props) {
  return (
    <Link to={url}>
      <div className="p-4 border-solid border border-[#cfd6df] dark:border-[--ifm-color-emphasis-200] rounded-[3px] cursor-pointer h-full relative overflow-hidden shadow-iom hover:shadow-md dark:hover:shadow-iom-dark">
        {children}
      </div>
    </Link>
  );
}

export default Card;
