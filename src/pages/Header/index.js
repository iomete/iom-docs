import Heading from "@theme/Heading";

import Img from "../../components/Img";
import "./header.scss";

export default function Header() {
  return (
    <div className="iom-hero">
      <div className="iom-hero-text">
        <Heading as="h1" className="hero__title">
          IOMETE Documentation
        </Heading>
        <p className="hero__subtitle">Enhance your IOMETE experience with in-depth tutorials and resourceful guides.</p>
      </div>
      <div className="hero-img">
        <Img src="/img/landing/hero.png" borderless />
      </div>
    </div>
  );
}
