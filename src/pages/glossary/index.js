import React, { useState } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Card from "./Card";
import { glossaryData } from "./consts";
import Search from "./Search";

export default function Glossary() {
  const { siteConfig } = useDocusaurusContext();
  const [searchQuery, setSearchQuery] = useState("");

  const searchInputHandle = (val) => {
    console.log("val-->", val);
    setSearchQuery(val);
  };

  // Filter glossaryData based on the searchQuery
  const filteredData = glossaryData.filter((g) => g.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <Layout title={`Hello from ${siteConfig.title}`} description="Description will go into a meta tag in <head />">
      <main>
        <div className="container mt-8">
          <h1>Glossary</h1>
          <Search searchInputHandle={searchInputHandle}/>


          <div className="mt-4">
            {filteredData.length === 0 ? (
                <div className="flex items-center justify-center bg-white p-4 rounded-md shadow-md">
                  <p className="text-lg text-gray-600">No data found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 divide-y-4 divide-teal-400">
                  {filteredData.map((g, index) => (
                      <div key={index}>
                        <Card link={g.link} title={g.title} subtitle={g.subtitle}/>
                      </div>
                  ))}
                </div>
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
}
