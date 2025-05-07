import React from 'react';
import SlideTitle from '../components/SlideTitle';

const title = "More Resources on Agents";

const links = [
  { href: "https://www.anthropic.com/engineering/building-effective-agents", text: "Anthropic: Building Effective Agents" },
  { href: "https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview", text: "Anthropic Docs: Tool Use Overview" }
];

const AgentResourcesSlide: React.FC = () => {
  return (
    <div className="p-4 h-full flex flex-col items-center text-black">
      <SlideTitle>{title}</SlideTitle>
      <div className="max-w-4xl text-left text-lg flex-1 flex flex-col justify-center">
        <ul className="list-disc list-inside space-y-3">
          {links.map((link, index) => (
            <li key={index}>
              <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                {link.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AgentResourcesSlide; 