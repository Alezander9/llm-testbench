import React from "react";
import SlideTitle from "../components/SlideTitle";

const WhatLLMsAreBadAtSlide: React.FC = () => {
  return (
    <div className="flex flex-col h-full items-center justify-center p-8">
      <SlideTitle>What LLMs Are Bad At</SlideTitle>
      <ul className="list-disc space-y-4 text-xl max-w-prose">
        <li>
          LLMs often struggle with tasks requiring genuine creativity or
          involving concepts rarely seen in their training data (like highly
          niche or novel scientific discovery).
        </li>
        <li>
          They can also find complex reasoning, deep comprehension, and tasks
          requiring real-world grounding or common sense challenging.
        </li>
      </ul>
    </div>
  );
};

export default WhatLLMsAreBadAtSlide;
