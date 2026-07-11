import React from "react";
import { ArrowSquareOut } from "@phosphor-icons/react";
import Link from "@docusaurus/Link";
import styles from "./styles.module.scss";
import useBaseUrl from "@docusaurus/useBaseUrl";

const Card = ({ title, icon, link, children, className, style }) => {
  //if link is external, use link as is else use baseUrl + link
  const isExternal = link.startsWith("http");

  const url = isExternal ? link : useBaseUrl("/") + link;
  return (
    <div className={[styles.Card, className].filter(Boolean).join(" ")} style={style}>
      <Link to={url} target={isExternal ? "_blank" : "_self"}>
        <div className={styles.Wrapper}>
          <div className={styles.Content}>
            {icon && <div className={styles.Icon}>{icon}</div>}
            <p className={styles.title}>{title}</p>
            {children}
          </div>
          {isExternal && (
            <div className={styles.IconRight}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 6.65032C9 6.65032 15.9383 6.10759 16.9154 7.08463C17.8924 8.06167 17.3496 15 17.3496 15M16.5 7.5L6.5 17.5"></path>
              </svg>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default Card;
