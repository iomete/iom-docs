import React from "react";

import styles from "./styles.module.scss";

const YoutubeCard = ({ link, title }) => {
  return (
    <div className={styles.VideoWrap}>
      <div className={styles.VideoContainer}>
        <iframe
          width="560"
          height="315"
          src={link}
          title={title}
          frameborder="0"
          allow="accelerometer; autoplay; fullscreen; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
      </div>
    </div>
  );
};

export default YoutubeCard;
