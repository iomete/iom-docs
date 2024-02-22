import React from "react";
import { communities } from "./consts";
import Card from "./Card";

function Community() {
  return (
    <div style={{ marginTop: 52 }} className="mt-[52px]">
      <h2 className="mb-6">Community</h2>

      <div className="grid grid-cols-4 gap-6">
        {communities.map((community, index) => (
          <div className="col-span-2 sm:col-span-1" key={index}>
            <Card url={community.url}>
              <div className="mb-4">{community.icon}</div>

              <h4 className="mb-2 text-base">{community.title}</h4>

              <p className="card-desc mb-0">{community.desc}</p>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Community;
