// export const AVAILABLE_MODELS = {
//   "gpt-4o": "GPT-4o",
//   "gpt-4o-mini": "GPT-4o Mini",
//   "deepseek-chat": "DeepSeek",
//   "claude-3-5-sonnet-latest": "Claude 3.5 Sonnet",
//   "claude-3-5-haiku-latest": "Claude 3.5 Haiku",
// } as const;

export const AVAILABLE_MODELS = {
  "gpt-4o": {
    displayName: "GPT-4o",
    // Assume cahce miss
    inputCost: convertToCreditsPerToken(2.5), // $2.50 per 1M input tokens
    outputCost: convertToCreditsPerToken(10.0), // $10.00 per 1M output tokens
  },
  "gpt-4o-mini": {
    displayName: "GPT-4o Mini",
    inputCost: convertToCreditsPerToken(0.15), // $0.150 per 1M input tokens
    outputCost: convertToCreditsPerToken(0.6), // $0.600 per 1M output tokens
  },
  // o1 model does not allow access at my usage tier yet
  // "o1": {
  //   displayName: "GPT o1",
  //   inputCost: convertToCreditsPerToken(15), // $15.00 per 1M input tokens
  //   outputCost: convertToCreditsPerToken(60), // $60.00 per 1M output tokens
  // },
  // o1-mini model does not allow system prompts so will break
  // "o1-mini": {
  //   displayName: "GPT o1 Mini",
  //   inputCost: convertToCreditsPerToken(3), // $0.075 per 1M input tokens
  //   outputCost: convertToCreditsPerToken(12), // $0.300 per 1M output tokens
  // },
  "deepseek-chat": {
    displayName: "DeepSeek Chat V3",
    // non-discounted prices:
    // inputCost: convertToCreditsPerToken(0.27),  // $0.27 per 1M input tokens (cache miss)
    // outputCost: convertToCreditsPerToken(1.10), // $1.10 per 1M output tokens
    // discounted prices (effective until 2025-02-08):
    inputCost: convertToCreditsPerToken(0.27), // $0.27 per 1M input tokens (cache miss)
    outputCost: convertToCreditsPerToken(1.1), // $1.10 per 1M output tokens
  },
  "deepseek-reason": {
    displayName: "DeepSeek R1",
    inputCost: convertToCreditsPerToken(0.55), // $0.55 per 1M input tokens (cache miss)
    outputCost: convertToCreditsPerToken(2.19), // $2.19 per 1M output tokens
  },
  "claude-3-5-sonnet-latest": {
    displayName: "Claude 3.5 Sonnet",
    // Not including batch API discount
    inputCost: convertToCreditsPerToken(3.0), // $3.00 per 1M input tokens
    outputCost: convertToCreditsPerToken(15.0), // $15.00 per 1M output tokens
  },
  "claude-3-5-haiku-latest": {
    displayName: "Claude 3.5 Haiku",
    // Not including batch API discount
    inputCost: convertToCreditsPerToken(0.8), // $0.80 per 1M input tokens
    outputCost: convertToCreditsPerToken(4.0), // $4.00 per 1M output tokens
  },
} as const;

// Converts dollars per 1M tokens to credits per token
// Example: $10 per 1M tokens
// -> 10,000 credits per 1M tokens (since $10 = 10000 credits)
// -> 0.01 credits per token
function convertToCreditsPerToken(dollarsPer1M: number): number {
  return (dollarsPer1M * 1000) / 1000000; // Convert to credits per token
}

// Helper function for cost calculation
export function calculateCost(
  modelName: string,
  usage?: { promptTokens: number; completionTokens: number },
) {
  if (!usage) return null;
  const modelConfig =
    AVAILABLE_MODELS[modelName as keyof typeof AVAILABLE_MODELS];
  if (!modelConfig) return null;

  // Costs are in credits per token, result will be in credits
  const promptCost = usage.promptTokens * modelConfig.inputCost;
  console.log(
    `promptCost: ${promptCost} at ${modelConfig.inputCost} credits per token`,
  );
  const completionCost = usage.completionTokens * modelConfig.outputCost;
  console.log(
    `completionCost: ${completionCost} at ${modelConfig.outputCost} credits per token`,
  );

  return promptCost + completionCost;
}
