import React from 'react';
import SlideTitle from '../components/SlideTitle';
import TextPrediction from '../components/TextPrediction'; // Assuming this path is correct

const title = "Use Structured Output for Agents";
const mainText = "A great way to get clear data from an LLM output is to turn on structured output mode, which forces each token generated to follow JSON format.";

const promptText = "<user> Please write a cake recipe but in json format </user> <assistant>";

const predictions = [
  { word: "Sure", probability: 5 },
  { word: "Okay", probability: 5 },
  { word: "First", probability: 5 },
  { word: "{", probability: 85 } // Highest probability to highlight it
];

const StructuredOutputAgentSlide: React.FC = () => {
  return (
    <div className="p-4 h-full flex flex-col items-center text-black">
      <SlideTitle>{title}</SlideTitle>
      <p className="text-xl text-center max-w-4xl mt-4 mb-8">
        {mainText}
      </p>
      <div className="w-full max-w-4xl flex-1 flex flex-col items-center">
        <TextPrediction promptText={promptText} predictions={predictions} />
      </div>
    </div>
  );
};

export default StructuredOutputAgentSlide; 