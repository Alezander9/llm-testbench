import React from 'react';

const ExampleWindow: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <pre className="bg-gray-100 p-4 rounded-md shadow-sm text-sm overflow-x-auto whitespace-pre-wrap break-words h-full">
      {children}
    </pre>
  );
};

export default ExampleWindow; 