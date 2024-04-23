import React from "react";
import styles from "./styles.module.scss";

const LoomCard = ({ link, title }) => {
    return (
        <div className={styles.VideoWrap}>
            <div className={styles.VideoContainer}>
                <div className={styles.VideoIframeContainer}>
                    <iframe
                        src={link}
                        title={title}
                        frameBorder="0" webkitallowfullscreen mozallowfullscreen allowFullScreen
                        className={styles.VideoIframe}>
                    </iframe>
                </div>
            </div>
        </div>
    );
};

export default LoomCard;