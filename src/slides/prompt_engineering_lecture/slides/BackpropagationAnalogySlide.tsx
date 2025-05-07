import React from 'react';
import SlideTitle from '../components/SlideTitle';
import OvercookedImage from '../assets/overcooked.jpg';

const title = "How does backpropagation work?";

const items = [
  "Imagine you are the head chef at a restaurant. You have a team of sous-chefs helping you and those sous-chefs have sous-chefs and so on",
  "Lets say an order comes up for a bowl of ramen, but as your sous-chefs give you noodles that are too short and broth that is too salty",
  "You are going to go to each of those sous-chefs and tell them what you wanted. They will remember your feedback, but they will also go to their sous-chefs and complain too\n",
  "And so over time the huge system of chefs will get better and better at cooking, even if each chef knows nothing about cooking to begin, and each chef only does one tiny operation"
];

const BackpropagationAnalogySlide: React.FC = () => {
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
             src={OvercookedImage} 
             alt="Overcooked chefs analogy" 
             className="max-h-[300px] max-w-full mx-auto"
           />
        </div>
      </div>
    </div>
  );
};

export default BackpropagationAnalogySlide; 