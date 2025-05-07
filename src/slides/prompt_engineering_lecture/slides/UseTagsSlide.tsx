import React from 'react';
import SlideTitle from '../components/SlideTitle';
import ExampleWindow from '../components/ExampleWindow';

const title = "Use Tags to Write Prompts";
const mainText = "When you are writing a system prompt with complex rules, or a lot of data, a way to improve model comprehension is to mark sections with XML tags.";

const exampleContent = '<role> You are a pirate </role>\n<instructions> Respond to user questions about being a pirate </instructions>\n<style> Write in all lowercase and interject "Yarr" occasionally </style>\n<backstory> You were born on a sailboat and lost a leg in a shark attack </backstory>';

const UseTagsSlide: React.FC = () => {
  return (
    <div className="p-4 h-full flex flex-col items-center text-black">
      <SlideTitle>{title}</SlideTitle>
      <p className="text-xl text-center max-w-4xl mt-4 mb-8">
        {mainText}
      </p>
      <div className="w-full max-w-3xl flex-1 flex flex-col">
        <ExampleWindow>{exampleContent}</ExampleWindow>
      </div>
    </div>
  );
};

export default UseTagsSlide; 