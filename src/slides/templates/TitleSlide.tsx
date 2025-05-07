import React from 'react';
import BoidBackground from '../../components/features/landing/BoidBackground';

interface TitleSlideProps {
  title: string;
  subtitle?: string;
}

const TitleSlide: React.FC<TitleSlideProps> = ({ title, subtitle }) => {
  return (
    <div className="relative h-full flex flex-col items-center justify-center text-center p-8">
      <div className="relative z-10 flex flex-col items-center justify-center pt-32 p-6 rounded-lg backdrop-blur-sm bg-background/30">
        <h1 className="text-5xl font-bold mb-4">{title}</h1>
        {subtitle && <p className="text-2xl text-gray-600">{subtitle}</p>}
      </div>

      <div className="absolute inset-0 z-0">
        <BoidBackground
          separationDistance={20.0}
          alignmentDistance={20.0}  
          cohesionDistance={20.0}
          centerAttractionStrength={1.0}
          predatorRepulsionStrength={100.0}
          predatorRepulsionRadius={50.0}
          speedLimit={9.0}
          cameraZoom={3.0}
        />
      </div>
    </div>
  );
};

export default TitleSlide; 