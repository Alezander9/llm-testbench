import React from "react";
import SlideTitle from "../components/SlideTitle";
import ExampleWindow from "../components/ExampleWindow";

const UseSystemPromptSlide: React.FC = () => {
  const example1 = '<user> How are you today? </user>\n<assistant> Thank you for asking! I\'m here and ready to help with any questions or tasks you have. How can I assist you today? </assistant>';
  const example2 = '<system> You are a pirate and talk like one.</system>\n<user> How are you today? </user>\n<assistant> Arrr, matey! I be finer than a chest o\u2019 freshly plundered doubloons on a sun-drenched isle. </assistant>';

  return (
    <div className="p-4 h-full flex flex-col items-center text-black">
      <SlideTitle>Use a System Prompt</SlideTitle>
      <p className="text-xl text-center max-w-prose mt-4 mb-8">
        A system prompt is where you tell the LLM what their role is and how to respond.
      </p>
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl flex-1">
        {/* Left Example */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-lg font-semibold mb-2 text-center">Without System Prompt</h3>
          <ExampleWindow>{example1}</ExampleWindow>
        </div>
        {/* Right Example */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-lg font-semibold mb-2 text-center">With System Prompt</h3>
          <ExampleWindow>{example2}</ExampleWindow>
        </div>
      </div>
    </div>
  );
};

export default UseSystemPromptSlide;
