import React from "react";
import dateToReadable from "../../../helpers/dateToReadable";

function CardDate({ date }: { date: string }) {
  return (
    <span className="text-sm font-mono text-[var(--base-700)] dark:text-[--base-400]">
      {dateToReadable(date).toUpperCase()}
    </span>
  );
}

export default CardDate;
