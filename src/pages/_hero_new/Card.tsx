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
      <div className="p-4 border-solid border border-[#cfd6df] dark:border-[#252526] dark:bg-[#19191b] dark:hover:bg-[#171719] dark:hover:border-[#252526] rounded-[3px] cursor-pointer h-full relative overflow-hidden shadow-iom hover:border-[#c2cad4] hover:shadow-iom-hover dark:shadow-none dark:hover:shadow-none">
        {children}
      </div>
    </Link>
  );
}

export default Card;
