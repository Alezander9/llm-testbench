import React from 'react';
import SlideTitle from '../components/SlideTitle';

const title = "What is an agent";
const items = [
  "Agents are systems that use the outputs of an LLM to control something more than just text output",
  "For instance if we tell an LLM to read various cake recipes and say either \"This is vegan\" or \"This is not vegan\", we could use it to make a vegan recipe collection."
];

const WhatIsAnAgentSlide: React.FC = () => {
  return (
    <div className="p-4 h-full flex flex-col items-center text-black">
      <SlideTitle>{title}</SlideTitle>
      <div className="max-w-4xl text-left text-lg flex-1 flex flex-col justify-center">
        <ul className="list-disc list-inside space-y-3">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WhatIsAnAgentSlide; 