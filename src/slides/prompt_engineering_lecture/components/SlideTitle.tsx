import React from 'react';

interface SlideTitleProps {
  children: React.ReactNode;
}

const SlideTitle: React.FC<SlideTitleProps> = ({ children }) => {
  return (
    <h2 className="w-full text-center text-3xl font-bold py-3 mb-4 bg-primary text-primary-foreground">
      {children}
    </h2>
  );
};

export default SlideTitle; 