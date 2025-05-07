import React from "react";
import SlideTitle from "../components/SlideTitle";
import TextPrediction from "../components/TextPrediction";

const HowPredictionLeadsToInstructionSlide: React.FC = () => {
  const factPredictions = [
    { word: "Sacramento", probability: 75 },
    { word: "Los Angeles", probability: 15 },
    { word: "San Francisco", probability: 8 },
    { word: "San Diego", probability: 2 },
  ];

  const chatPredictions = [
    { word: "Sure,", probability: 45 },
    { word: "def", probability: 30 },
    { word: "Okay", probability: 15 },
    { word: "import", probability: 10 },
  ];

  // Need to handle newline for the prompt text
  const chatPrompt = `<user> Can you write me a function in python to unpack a root file? \n<assistant>`;

  return (
    <div className="flex flex-col h-full items-center p-8 overflow-y-auto">
      <SlideTitle>
        How do we go from text prediction to instruction-following?
      </SlideTitle>
      <p className="text-xl text-center mb-6 max-w-prose">
        You may be wondering how simple text prediction is actually useful. If
        we structure the input text so that predicting the next word effectively
        answers a question or completes an instruction, we can elicit helpful
        responses:
      </p>
      <TextPrediction
        promptText="The capitol of California is:"
        predictions={factPredictions}
      />

      {/* Added Explanation Text */}
      <p className="text-xl text-center my-6 max-w-prose">
        Chat assistants like Claude or GPT are trained on many example
        conversations. They format your actual input like this, turning
        conversation into a text prediction task:
      </p>

      {/* Added Second TextPrediction Example */}
      <TextPrediction
        // Use a pre-wrap style or similar if newline doesn't render correctly
        promptText={chatPrompt.replace(/\n/g, "\n")} // Replace literal \n with actual newline
        predictions={chatPredictions}
      />
    </div>
  );
};

export default HowPredictionLeadsToInstructionSlide;
