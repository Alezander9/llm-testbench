import React from 'react';
import SlideTitle from '../components/SlideTitle';

const title = "Test. A lot.";

const TestALotSlide: React.FC = () => {
  return (
    <div className="p-4 h-full flex flex-col items-center justify-center text-black">
      <SlideTitle>{title}</SlideTitle>
    </div>
  );
};

export default TestALotSlide; 