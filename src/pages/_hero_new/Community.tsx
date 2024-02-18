import React from "react";
import Heading from "@theme/Heading";
import { communities } from "./consts";

function Community() {
  return (
    <div style={{ marginTop: 32 }}>
      <Heading as="h2">Community</Heading>

      <div className="row">
        {communities.map((blog, index) => (
          <div className="col col--3" key={index}>
            <div
              className="card"
              style={{
                padding: 16,
                borderRadius: 4,
                marginBottom: 12,
                border: "1px solid var(--ifm-color-emphasis-200)",
              }}
            >
              <div style={{ marginBottom: 18 }}>{blog.icon}</div>

              <h3>{blog.title}</h3>

              <p style={{ margin: 0 }}>{blog.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Community;
