import React from 'react';
import SlideTitle from '../components/SlideTitle';
import ExampleWindow from '../components/ExampleWindow';

const title = "Allow space for reasoning before complex tasks";
const mainText = "A helpful trick on complex tasks like coding is to ask the LLM to write out reasoning or a plan before completing a complex request. This is essentially what \"reasoning\" models like Deepseek-R1 are doing behind the scenes";

const example1 = '<user> Please write code to unpack a root file </user>';
const example2 = '<user> Please write code to unpack a root file, but first write out a plan for how you will accomplish this task </user>';

const ReasoningSpaceSlide: React.FC = () => {
  return (
    <div className="p-4 h-full flex flex-col items-center text-black">
      <SlideTitle>{title}</SlideTitle>
      <p className="text-xl text-center max-w-4xl mt-4 mb-8">
        {mainText}
      </p>
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl flex-1">
        {/* Left Example */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-lg font-semibold mb-2 text-center">Without Requesting a Plan</h3>
          <ExampleWindow>{example1}</ExampleWindow>
        </div>
        {/* Right Example */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-lg font-semibold mb-2 text-center">Requesting a Plan First</h3>
          <ExampleWindow>{example2}</ExampleWindow>
        </div>
      </div>
    </div>
  );
};

export default ReasoningSpaceSlide; 