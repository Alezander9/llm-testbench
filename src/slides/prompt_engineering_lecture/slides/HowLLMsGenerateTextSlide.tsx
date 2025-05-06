import React from 'react';
import SlideTitle from '../components/SlideTitle';
import DnnDiagram from '../assets/DnnDiagram';

const HowLLMsGenerateTextSlide: React.FC = () => {
  return (
    <div className="p-4 h-full flex flex-col items-center text-black">
      <SlideTitle>How do LLMs generate text?</SlideTitle>
      <div className="max-w-4xl text-left text-xl flex-1 flex flex-col justify-center items-center">
        <p className="mb-4 self-start">
          LLMs are machine learning models trained to predict the next word (or "token") in a sequence.
        </p>
        <p className="mb-8 self-start">
          They start off not knowing anything, then learn patterns from backpropagation.
        </p>
        <div className="mt-auto mb-4">
          <DnnDiagram />
        </div>
      </div>
    </div>
  );
};

export default HowLLMsGenerateTextSlide; 