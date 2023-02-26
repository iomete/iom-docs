import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import React from 'react';
import styles from "./card.scss";

const Card = ({title, children}) => {
  if (!ExecutionEnvironment.canUseDOM) {
    return null;
  }

  return (
    <div className='margin-top--lg'>
      
    </div>

  );
};

export default Card;
