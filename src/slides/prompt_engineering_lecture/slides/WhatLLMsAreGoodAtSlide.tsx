import React from "react";
import SlideTitle from "../components/SlideTitle";

const WhatLLMsAreGoodAtSlide: React.FC = () => {
  return (
    <div className="flex flex-col h-full items-center justify-center p-8">
      <SlideTitle>What LLMs Are Good At</SlideTitle>
      <ul className="list-disc space-y-4 text-xl max-w-prose">
        <li>
          Because LLMs are trained on vast amounts of text data (like much of
          the internet), they excel at reproducing patterns and information they
          have seen before. This covers a surprisingly large range of tasks.
        </li>
        <li>
          They can easily generate common code snippets (like reversing a linked
          list or setting up a basic server), write essays on familiar topics
          (like global health), or summarize text.
        </li>
        <li>
          They are also adept at combining existing concepts and styles, such as
          writing an essay in a specific historical dialect or translating code
          between programming languages.
        </li>
      </ul>
    </div>
  );
};

export default WhatLLMsAreGoodAtSlide;
