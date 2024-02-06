import Heading from "@theme/Heading";
import React from "react";

import styles from "./styles.module.scss";

function Header() {
  return (
    <div>
      <Heading as="h1" className="hero__title">
        IOMETE Documentation
      </Heading>
      <p className="hero__subtitle">
        Enhance your IOMETE experience with in-depth tutorials and resourceful
        guides.
      </p>
    </div>
  );
}

export default Header;
