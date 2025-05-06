import React from 'react';

interface ImageSlideProps {
  title?: string;
  imageUrl: string;
  caption?: string;
}

const ImageSlide: React.FC<ImageSlideProps> = ({ title, imageUrl, caption }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      {title && <h2 className="text-3xl font-bold mb-4">{title}</h2>}
      <img src={imageUrl} alt={caption || title || 'Slide image'} className="max-w-full max-h-[70vh] object-contain my-4" />
      {caption && <p className="text-lg text-gray-600 mt-2">{caption}</p>}
    </div>
  );
};

export default ImageSlide; 