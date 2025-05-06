import React from 'react';

interface TitleSlideProps {
  title: string;
  subtitle?: string;
}

const TitleSlide: React.FC<TitleSlideProps> = ({ title, subtitle }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 pt-40">
      <h1 className="text-5xl font-bold mb-4">{title}</h1>
      {subtitle && <p className="text-2xl text-gray-600">{subtitle}</p>}
    </div>
  );
};

export default TitleSlide; 