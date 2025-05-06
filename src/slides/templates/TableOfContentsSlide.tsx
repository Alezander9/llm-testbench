import React from 'react';
import { cn } from '../../lib/utils'; // Assuming you have a cn utility

interface TableOfContentsSlideProps {
  items: string[];
  currentItemIndex: number;
}

const TableOfContentsSlide: React.FC<TableOfContentsSlideProps> = ({ items, currentItemIndex }) => {
  return (
    <div className="h-full flex bg-background text-foreground"> {/* Ensure background and text colors are set */} 
      {/* Left Color Bar */}
      <div className="w-20 md:w-24 bg-primary flex-shrink-0"></div> {/* Slightly wider bar */}

      {/* Content Area */}
      <div className="flex-grow p-8 md:p-12 lg:p-16 pt-16 md:pt-20 lg:pt-24 overflow-y-auto">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 md:mb-10 lg:mb-12 border-b pb-3 md:pb-4">Outline</h2>
        <ol className="list-decimal list-inside space-y-4 md:space-y-5 lg:space-y-6">
          {items.map((item, index) => (
            <li
              key={index}
              className={cn(
                "text-2xl md:text-3xl lg:text-4xl text-foreground transition-all duration-200 ease-in-out",
                index === currentItemIndex
                  ? "font-semibold"
                  : "font-normal"
              )}
            >
              {item}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default TableOfContentsSlide; 