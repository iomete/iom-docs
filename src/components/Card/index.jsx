import React from "react";
import { ArrowSquareOut } from "@phosphor-icons/react";
import Link from "@docusaurus/Link";
import styles from "./styles.module.scss";
import useBaseUrl from "@docusaurus/useBaseUrl";

const Card = ({ title, icon, link, children }) => {
  //if link is external, use link as is else use baseUrl + link
  const isExternal = link.startsWith("http");

  const url = isExternal ? link : useBaseUrl("/") + link;
  return (
    <div className={styles.Card}>
      <Link to={url} target={isExternal ? "_blank" : "_self"}>
        <div className={styles.Wrapper}>
          {icon && <div className={styles.Icon}>{icon}</div>}
          <div className={styles.Content}>
            <h3>{title}</h3>
            {children}
          </div>
          {isExternal && (
            <div className={styles.IconRight}>
              <ArrowSquareOut size={24} weight="regular" />
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default Card;
