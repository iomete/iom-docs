import React from "react";
import clsx from "clsx";
import type { Props } from "@theme/BlogListPage";
import type { Props as TagProps } from "@theme/BlogTagsPostsPage";
import Card from "./Card";
import styles from "./styles.module.scss";

function Container(props: Props) {
  console.log("items", props);

  // className={clsx("container", styles.Container)}
  return (
    <>
      <div className="row">
        {[...props.items].map((item, index) => {
          return (
            <div className="col col--4" key={index}>
              <Card {...(item.content as any)} />
            </div>
          );
        })}
      </div>
    </>
  );
}

export default Container;
