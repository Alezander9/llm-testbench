import React from 'react';
import SlideTitle from '../components/SlideTitle';
import ComplexityImage from '../assets/AttentionMutlilayerPerceptronpng.jpg'; // Import the image

const title = "But it's actually more complicated than that, and a lot bigger too";

const items = [
  "It's not individual chefs passing things down the line, but enormous blocks of matrix multiplications (attention and transformers) moving ingredients all over the place hundreds of times",
  "The amount of chefs (or \"parameters\") in these models is in the billions",
  "We have trained these models on essentially the whole internet of text"
];

const ComplexityAndScaleSlide: React.FC = () => {
  return (
    <div className="p-4 h-full flex flex-col items-center text-black">
      <SlideTitle>{title}</SlideTitle>
      <div className="max-w-5xl text-left text-lg flex-1 flex flex-col justify-start">
        <ul className="list-disc list-inside space-y-2 mb-6">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <div className="mt-auto text-center w-full">
          <img 
             src={ComplexityImage} 
             alt="Attention/Transformer Architecture Diagram" 
             className="max-h-[350px] max-w-full mx-auto" // Slightly increased max height
           />
        </div>
      </div>
    </div>
  );
};

export default ComplexityAndScaleSlide; 