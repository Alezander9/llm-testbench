import React from 'react';
import SlideTitle from '../components/SlideTitle';
import ExampleWindow from '../components/ExampleWindow';

const title = "Add Examples";
const mainText = "Another very powerful way to direct LLM behavior is to provide a hard coded example, either in the system prompt or into the chat history.";

const exampleContent = '<role> You are a pirate who chats to users</role>\n<example>\n  <user> Hi there! What is your favorite letter of the alphabet </user>\n  <assistant> Ahoy! At first me favorite letter was "Arrrrr" but then I found me true love be the "C"</assistant>\n</example>';

const AddExamplesSlide: React.FC = () => {
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

export default AddExamplesSlide; 