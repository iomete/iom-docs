import Link from "@docusaurus/Link";

import "./style.scss";
import { ArrowRight } from "@phosphor-icons/react";

export default function Card({ seeAllLink, title, description, links, icon }) {
  return (
    <div className="resource-card">
      <div>{icon}</div>
      <div className="card-content">
        <p className="card-title">{title}</p>
        <p className="card-description">{description}</p>
        {/* <ul>
          {links?.map((link) => (
            <li key={link.label}>
              <Link to={link.path}>{link.label} </Link>
            </li>
          ))}
        </ul> */}
        <Link to={seeAllLink} className="card-see-details">
          See all <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
