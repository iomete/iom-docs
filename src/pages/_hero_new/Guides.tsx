import React from "react";

import "./styles.scss";

import Card from "./Card";
import { guides } from "./consts";

function Guides() {
  return (
    <div className="mt-[52px]">
      <h2 className="mb-6">Installation Guides</h2>
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-4">
          <Card url="https://www.youtube.com/@iomete">
            <div className="flex justify-between h-auto sm:h-[126px] flex-col sm:flex-row gap-6">
              <div className="w-[100%] sm:w-[50%] ">
                <h4 className="mb-2">
                  Watch: How to run IOMETE Community Edition on AWS
                </h4>
                <p className="card-desc mb-0">
                  Watch 20 minute Youtube video on how to run Community Edition
                  on AWS.
                </p>
              </div>
              <div>
                <div className="mb-[-26px]">
                  <iframe
                    src="https://www.youtube-nocookie.com/embed/gNtZrnKNg4Y?si=T3yaa88CRgwlNLrC"
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    className="h-[153px] sm:h-[153px] w-full sm:w-[309px] max-h-[142px]"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {guides.map((guide, index) => (
          <div className="col-span-2 sm:col-span-1 " key={index}>
            <Card url={guide.url}>
              <div className="h-18 bg-[#F6F8FA] dark:bg-[#1e1e1f] rounded-[3px] flex justify-center items-center mb-4 p-[18px]">
                {guide.icon}
              </div>

              <h4 className="mb-4">{guide.title}</h4>

              <p className="card-desc mb-0">{guide.description}</p>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Guides;
