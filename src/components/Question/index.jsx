import React, { useState } from "react";
import { Plus, Minus } from "phosphor-react";
import "./style.scss";

const Question = ({ title, children }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="question">
      <header onClick={() => setExpanded(!expanded)}>
        <h3 className="title">{title}</h3>
        <span className="icon">
          {expanded ? (
            <Minus size={24} color="#0070F3" weight="bold" />
          ) : (
            <Plus size={24} color="#0070F3" weight="bold" />
          )}
        </span>
      </header>
      <div className="content" style={expanded ? { marginTop: "40px" } : { height: "0px" }}>
        <p>{children}</p>
      </div>
    </article>
  );
};

export default Question;
