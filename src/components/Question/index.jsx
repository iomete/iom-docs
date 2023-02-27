import React, { useState } from "react";
import { Plus, Minus } from "phosphor-react";
import "./style.scss";

const Question = ({ title, children }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="question">
      <header>
        <h3 onClick={() => setExpanded(!expanded)} className="question-title">
          {title}
        </h3>
        <button className="btn" onClick={() => setExpanded(!expanded)}>
          {expanded ? <Minus size={32} weight="bold" /> : <Plus size={32} weight="bold" />}
        </button>
      </header>
      {expanded && <p>{children}</p>}
    </article>
  );
};

export default Question;
