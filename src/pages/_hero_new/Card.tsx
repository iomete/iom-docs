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
      <div className="p-4 dark:bg-[var(--base-950--80)] border-solid border border-[var(--border-primary)] hover:border-[var(--border-secondary)]  rounded-[3px] cursor-pointer h-full relative overflow-hidden">
        {children}
      </div>
    </Link>
  );
}

export default Card;
