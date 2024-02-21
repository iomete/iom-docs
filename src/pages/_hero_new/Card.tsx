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
      <div className="p-4 border-solid border border-[#cfd6df] rounded-[3px] cursor-pointer h-full relative overflow-hidden shadow-sm hover:shadow-md">
        {children}
      </div>
    </Link>
  );
}

export default Card;
