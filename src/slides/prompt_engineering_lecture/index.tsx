import React, { useState, useEffect, useCallback } from "react";
import TitleSlide from "../templates/TitleSlide";
import TableOfContentsSlide from "../templates/TableOfContentsSlide";
import HowLLMsGenerateTextSlide from "./slides/HowLLMsGenerateTextSlide";
import BackpropagationAnalogySlide from "./slides/BackpropagationAnalogySlide";
import ComplexityAndScaleSlide from "./slides/ComplexityAndScaleSlide";
import HowPredictionLeadsToInstructionSlide from "./slides/HowPredictionLeadsToInstructionSlide";
import WhatLLMsAreGoodAtSlide from "./slides/WhatLLMsAreGoodAtSlide";
import WhatLLMsAreBadAtSlide from "./slides/WhatLLMsAreBadAtSlide";
import UseSystemPromptSlide from "./slides/UseSystemPromptSlide";
import { Button } from "../../components/ui/button";

// Define the outline items
const outlineItems = [
  "What are LLMs and how do they work?",
  "Clear prompting and testing",
  "Agents and tool use",
  "Questions",
];

// Define your slides here
const lectureSlides = [
  () => (
    <TitleSlide
      title="Prompt Engineering: Tips and Tricks"
      subtitle="Presented by Alexander Yue"
    />
  ),
  () => <TableOfContentsSlide items={outlineItems} currentItemIndex={0} />,
  () => <HowLLMsGenerateTextSlide />,
  () => <BackpropagationAnalogySlide />,
  () => <ComplexityAndScaleSlide />,
  () => <HowPredictionLeadsToInstructionSlide />,
  () => <WhatLLMsAreGoodAtSlide />,
  () => <WhatLLMsAreBadAtSlide />,
  () => <TableOfContentsSlide items={outlineItems} currentItemIndex={1} />,
  () => <UseSystemPromptSlide />,
  () => <TableOfContentsSlide items={outlineItems} currentItemIndex={2} />,
  () => <TableOfContentsSlide items={outlineItems} currentItemIndex={3} />,
];

function PromptEngineeringLecture() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const SlideComponent = lectureSlides[currentSlideIndex];

  const goToNextSlide = useCallback(() => {
    setCurrentSlideIndex((prevIndex) =>
      Math.min(prevIndex + 1, lectureSlides.length - 1),
    );
  }, []);

  const goToPreviousSlide = useCallback(() => {
    setCurrentSlideIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
        case "PageDown":
        case " ":
          if (currentSlideIndex < lectureSlides.length - 1) {
            goToNextSlide();
          }
          break;
        case "ArrowLeft":
        case "ArrowUp":
        case "PageUp":
          if (currentSlideIndex > 0) {
            goToPreviousSlide();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentSlideIndex, goToNextSlide, goToPreviousSlide]);

  const isFirstSlide = currentSlideIndex === 0;
  const isLastSlide = currentSlideIndex === lectureSlides.length - 1;

  return (
    <div
      className="p-4 min-h-screen flex flex-col bg-background text-foreground"
      tabIndex={0}
    >
      <div className="flex-1 border rounded mb-4 overflow-hidden">
        <SlideComponent />
      </div>
      <div className="flex justify-between items-center mt-4">
        <Button
          onClick={goToPreviousSlide}
          disabled={isFirstSlide}
          variant={isFirstSlide ? "disabled" : "primary"}
          size="sm"
        >
          Previous
        </Button>
        <span className="text-sm">
          Slide {currentSlideIndex + 1} of {lectureSlides.length}
        </span>
        <Button
          onClick={goToNextSlide}
          disabled={isLastSlide}
          variant={isLastSlide ? "disabled" : "primary"}
          size="sm"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default PromptEngineeringLecture;
