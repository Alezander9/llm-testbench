import React from 'react';

interface BulletedListSlideProps {
  title?: string;
  items: string[];
}

const BulletedListSlide: React.FC<BulletedListSlideProps> = ({ title, items }) => {
  return (
    <div className="h-full flex flex-col p-8">
      {title && <h2 className="text-3xl font-bold mb-6 text-center">{title}</h2>}
      <ul className="list-disc list-inside space-y-2 text-lg flex-grow">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default BulletedListSlide; 