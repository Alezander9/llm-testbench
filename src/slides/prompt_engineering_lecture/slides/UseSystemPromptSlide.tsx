import React from "react";
import SlideTitle from "../components/SlideTitle";

const UseSystemPromptSlide: React.FC = () => {
  return (
    <div className="flex flex-col h-full items-center justify-center p-8">
      <SlideTitle>Use a System Prompt</SlideTitle>
      <p className="text-xl text-center max-w-prose mt-4">
        A system prompt is where you tell the LLM what their role is and how to
        respond.
      </p>
    </div>
  );
};

export default UseSystemPromptSlide;
