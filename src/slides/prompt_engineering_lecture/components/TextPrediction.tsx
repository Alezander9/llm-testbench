import React from "react";

interface Prediction {
  word: string;
  probability: number;
}

interface TextPredictionProps {
  promptText: string;
  predictions: Prediction[];
}

const TextPrediction: React.FC<TextPredictionProps> = ({
  promptText,
  predictions,
}) => {
  // Find the prediction with the highest probability to bold it
  const highestProbability = Math.max(...predictions.map((p) => p.probability));

  return (
    <div className="flex flex-col items-center space-y-4 my-6 p-4 border rounded bg-secondary/20">
      {/* Top Row: Prompt Text */}
      <div className="text-center">
        <span className="font-mono text-2xl bg-muted p-2 rounded">
          {promptText} ____
        </span>
      </div>

      {/* Bottom Row: Predictions */}
      <div className="flex justify-center items-center space-x-4 flex-wrap">
        {predictions.map((prediction) => (
          <div
            key={prediction.word}
            className={`text-center p-2 border rounded ${prediction.probability === highestProbability ? "border-primary" : ""}`}
          >
            <span
              className={`block text-lg ${prediction.probability === highestProbability ? "font-bold" : ""}`}
            >
              "{prediction.word}"
            </span>
            <span className="block text-sm text-muted-foreground">
              ({prediction.probability}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TextPrediction;
