import React, { useState } from "react";
import Head from "@docusaurus/Head";
import { Plus, Minus } from "@phosphor-icons/react";
import "./style.scss";

const QuestionWithSchema = ({ title, children, id }) => {
  const [expanded, setExpanded] = useState(false);

  // Generate schema for individual question
  const questionSchema = {
    "@context": "https://schema.org",
    "@type": "Question",
    "name": title,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": typeof children === 'string' ? children : ''
    }
  };

  return (
    <>
      <Head>
        <script type="application/ld+json">
          {JSON.stringify(questionSchema)}
        </script>
      </Head>
      <article className="question" id={id}>
        <header onClick={() => setExpanded(!expanded)}>
          <h3 className="title">{title}</h3>
          <span className="icon">
            {expanded ? (
              <Minus size={24} color="#0070F3" weight="regular" />
            ) : (
              <Plus size={24} color="#0070F3" weight="regular" />
            )}
          </span>
        </header>
        <div className="content" style={expanded ? { marginTop: "40px" } : { height: "0px" }}>
          {children}
        </div>
      </article>
    </>
  );
};

export default QuestionWithSchema;