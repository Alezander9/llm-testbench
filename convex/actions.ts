import { v } from "convex/values";
import { action, ActionCtx, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { LLMFactory } from "../src/components/features/llm/factory";
// import { FileProcessingService } from "../src/components/features/llm/services/fileProcessing";
import {
  // FileProcessingError,
  LLMProvider,
  LLMResponse,
  // StreamingLLMResponse,
  ModelConfigWithKeyInfo,
} from "../src/components/features/llm/types";
import { Id } from "./_generated/dataModel";
import { calculateCost } from "../src/components/features/llm/available-models";

// Define the shape of our arguments as plain objects
type CompletionArgs = {
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  modelName: string;
  userId: Id<"users">;
  useDefault: boolean;
  maxTokens?: number;
  temperature?: number;
};

// type FileProcessingArgs = {
//   fileData: string;
//   fileName: string;
//   fileType: string;
//   extractionPrompt: string;
//   modelConfig: {
//     provider: LLMProvider;
//     modelId: string;
//     temperature?: number;
//     maxTokens?: number;
//   };
// };

// Initialize LLM providers
LLMFactory.initialize({
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
  },
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY!,
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY!,
  },
});

async function setupModelConfig(
  ctx: ActionCtx,
  userId: Id<"users"> | undefined,
  modelName: string,
  useDefault: boolean = false,
  maxTokens: number = 1000,
  temperature: number = 1.0
): Promise<ModelConfigWithKeyInfo> {
  // Determine provider from model name
  let provider: LLMProvider = "openai";
  if (modelName.includes("deepseek")) {
    provider = "deepseek";
  } else if (modelName.includes("claude")) {
    provider = "anthropic";
  }

  // Default configs
  const defaultConfigs = {
    openai: {
      apiKey: process.env.OPENAI_API_KEY!,
    },
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY!,
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY!,
    },
  };

  // Initialize with default config
  LLMFactory.initialize(defaultConfigs);

  let isUsingCredits = true;

  // If user provided and not requesting default
  if (userId && !useDefault) {
    try {
      // Try to get user's API key
      const apiKey = await ctx.runQuery(internal.queries.getApiKey, {
        userId,
        provider,
      });

      if (apiKey?.isValid) {
        // Decrypt the key
        const decryptedKey = await ctx.runAction(
          internal.actions.getDecryptedApiKey,
          {
            userId,
            provider,
          }
        );

        // Update provider with user's key
        LLMFactory.updateProviderConfig(provider, {
          ...defaultConfigs[provider],
          apiKey: decryptedKey,
        });

        // User is using their own key, so they are not using credits
        isUsingCredits = false;
      }
    } catch (error) {
      console.warn(`Failed to get user API key for ${provider}, using default`);
    }
  }

  return {
    provider,
    modelId: modelName,
    maxTokens: maxTokens,
    temperature: temperature,
    isUsingCredits: isUsingCredits,
  };
}

// Validate API key with provider
export const validateApiKey = internalAction({
  args: {
    provider: v.union(
      v.literal("openai"),
      v.literal("anthropic"),
      v.literal("deepseek")
    ),
    apiKey: v.string(),
  },
  handler: async (_ctx, args) => {
    try {
      let isValid = false;
      switch (args.provider) {
        case "openai":
          const openaiResponse = await fetch(
            "https://api.openai.com/v1/models",
            {
              headers: {
                Authorization: `Bearer ${args.apiKey}`,
              },
            }
          );
          isValid = openaiResponse.status === 200;
          break;

        case "anthropic":
          const anthropicResponse = await fetch(
            "https://api.anthropic.com/v1/messages",
            {
              method: "POST",
              headers: {
                "x-api-key": args.apiKey,
                "anthropic-version": "2023-06-01",
              },
              body: JSON.stringify({
                model: "claude-3-opus-20240229",
                max_tokens: 1,
                messages: [{ role: "user", content: "test" }],
              }),
            }
          );
          isValid = anthropicResponse.status === 200;
          break;

        case "deepseek":
          const deepseekResponse = await fetch(
            "https://api.deepseek.com/v1/models",
            {
              headers: {
                Authorization: `Bearer ${args.apiKey}`,
              },
            }
          );
          isValid = deepseekResponse.status === 200;
          break;
      }

      return isValid;
    } catch (error) {
      console.error(`Error validating ${args.provider} API key:`, error);
      return false;
    }
  },
});

export const generateRandomEncryptionKey = action({
  args: {},
  handler: async (_ctx) => {
    const key = crypto.getRandomValues(new Uint8Array(32));
    const base64Key = btoa(String.fromCharCode(...key));
    console.log("Generated Master Key:", base64Key);
    return base64Key;
  },
});

// Add or update API key
export const upsertApiKey = action({
  args: {
    userId: v.id("users"),
    provider: v.union(
      v.literal("openai"),
      v.literal("anthropic"),
      v.literal("deepseek")
    ),
    apiKey: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // First validate the API key
      const isValid = await ctx.runAction(internal.actions.validateApiKey, {
        provider: args.provider,
        apiKey: args.apiKey,
      });

      if (!isValid) {
        throw new Error("Invalid API key");
      }

      // Encrypt the API key
      const encryptedKey = await ctx.runAction(
        internal.nodeActions.encryptApiKey,
        {
          apiKey: args.apiKey,
        }
      );

      // Check if key already exists
      const existingKey = await ctx.runQuery(internal.queries.getApiKey, {
        userId: args.userId,
        provider: args.provider,
      });

      const timestamp = Date.now();

      if (existingKey) {
        // Update existing key
        await ctx.runMutation(internal.mutations.updateApiKey, {
          userId: args.userId,
          provider: args.provider,
          encryptedKey,
          isValid: true,
          lastValidated: timestamp,
          updatedAt: timestamp,
        });
      } else {
        // Create new key
        await ctx.runMutation(internal.mutations.createApiKey, {
          userId: args.userId,
          provider: args.provider,
          encryptedKey,
          isValid: true,
          lastValidated: timestamp,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      }

      // Log the action
      await ctx.runMutation(internal.mutations.logApiKeyAction, {
        userId: args.userId,
        provider: args.provider,
        action: existingKey ? "update" : "create",
        timestamp,
        success: true,
      });

      return true;
    } catch (error) {
      // Log the failed action
      await ctx.runMutation(internal.mutations.logApiKeyAction, {
        userId: args.userId,
        provider: args.provider,
        action: "create",
        timestamp: Date.now(),
        success: false,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });

      throw error;
    }
  },
});

// Delete API key
export const deleteApiKey = action({
  args: {
    userId: v.id("users"),
    provider: v.union(
      v.literal("openai"),
      v.literal("anthropic"),
      v.literal("deepseek")
    ),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();

    try {
      await ctx.runMutation(internal.mutations.deleteApiKey, {
        userId: args.userId,
        provider: args.provider,
      });

      await ctx.runMutation(internal.mutations.logApiKeyAction, {
        userId: args.userId,
        provider: args.provider,
        action: "delete",
        timestamp,
        success: true,
      });

      return true;
    } catch (error) {
      await ctx.runMutation(internal.mutations.logApiKeyAction, {
        userId: args.userId,
        provider: args.provider,
        action: "delete",
        timestamp,
        success: false,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });

      throw error;
    }
  },
});

// Get decrypted API key for use
export const getDecryptedApiKey = internalAction({
  args: {
    userId: v.id("users"),
    provider: v.union(
      v.literal("openai"),
      v.literal("anthropic"),
      v.literal("deepseek")
    ),
  },
  handler: async (ctx, args): Promise<string> => {
    // Get encrypted key
    const apiKey = await ctx.runQuery(internal.queries.getApiKey, {
      userId: args.userId,
      provider: args.provider,
    });

    if (!apiKey || !apiKey.isValid) {
      throw new Error(`No valid API key found for ${args.provider}`);
    }

    // Decrypt and return
    const decryptedKey = await ctx.runAction(
      internal.nodeActions.decryptApiKey,
      {
        encryptedKey: apiKey.encryptedKey,
      }
    );
    return decryptedKey;
  },
});

// Get last 4 digits of API key (safe to expose to client)
export const getApiKeyLastDigits = action({
  args: {
    userId: v.id("users"),
    provider: v.union(
      v.literal("openai"),
      v.literal("anthropic"),
      v.literal("deepseek")
    ),
  },
  handler: async (ctx, args): Promise<string | null> => {
    // Get encrypted key
    const apiKey = await ctx.runQuery(internal.queries.getApiKey, {
      userId: args.userId,
      provider: args.provider,
    });

    if (!apiKey || !apiKey.isValid) {
      return null;
    }

    // Decrypt the key
    const decryptedKey = await ctx.runAction(
      internal.nodeActions.decryptApiKey,
      {
        encryptedKey: apiKey.encryptedKey,
      }
    );

    // Return only the last 4 characters
    return decryptedKey.slice(-4);
  },
});

// Chat Completion Actions
export const internalGenerateCompletion = internalAction({
  args: {
    messages: v.array(
      v.object({
        role: v.union(
          v.literal("system"),
          v.literal("user"),
          v.literal("assistant")
        ),
        content: v.string(),
      })
    ),
    modelName: v.string(),
    userId: v.id("users"),
    useDefault: v.boolean(),
    maxTokens: v.optional(v.number()),
    temperature: v.optional(v.number()),
  },
  handler: async (ctx, args: CompletionArgs) => {
    try {
      // Setup model config
      const modelConfigWithKeyInfo = await setupModelConfig(
        ctx,
        args.userId,
        args.modelName,
        args.useDefault,
        args.maxTokens,
        args.temperature
      );

      // If using credits, check if user has enough credits
      if (modelConfigWithKeyInfo.isUsingCredits) {
        const userCredit = await ctx.runQuery(
          internal.queries.getUserCreditInternal,
          {
            userId: args.userId,
          }
        );
        if (userCredit === null || userCredit.remainingCredit <= 0) {
          throw new Error("Insufficient credits");
        }
      }

      // Generate completion
      const response = await LLMFactory.generateCompletion(
        args.messages,
        modelConfigWithKeyInfo
      );

      // If using credits, submit a transaction to update user credit
      if (modelConfigWithKeyInfo.isUsingCredits) {
        if (!response.usage?.inputTokens || !response.usage?.outputTokens) {
          // Log the error for monitoring
          console.error(`Missing usage data for ${args.modelName} completion`);
          await ctx.runMutation(internal.mutations.createErrorLog, {
            errorMessage: `Missing usage data for ${args.modelName} completion`,
            timestamp: Date.now(),
            userId: args.userId,
          });
          throw new Error("Unable to track token usage. Please try again.");
        }
        console.log(
          `calculating cost with:  model: ${args.modelName} input tokens: ${response.usage.inputTokens} output tokens: ${response.usage.outputTokens}`
        );
        const cost = calculateCost(args.modelName, {
          promptTokens: response.usage.inputTokens,
          completionTokens: response.usage.outputTokens,
        });
        console.log(`cost: ${cost}`);
        if (cost === null) {
          throw new Error("Unable to calculate cost for this model.");
        }

        await ctx.runMutation(internal.mutations.createCreditTransaction, {
          userId: args.userId,
          modelName: modelConfigWithKeyInfo.modelId,
          tokensUsed: response.usage.totalTokens,
          cost,
          timestamp: Date.now(),
        });
      }

      return response;
    } catch (error) {
      console.error("Error generating completion:", error);
      throw error;
    }
  },
});

export const generateCompletion = action({
  args: {
    messages: v.array(
      v.object({
        role: v.union(
          v.literal("system"),
          v.literal("user"),
          v.literal("assistant")
        ),
        content: v.string(),
      })
    ),
    modelName: v.string(),
    userId: v.id("users"),
    useDefault: v.boolean(),
    maxTokens: v.optional(v.number()),
    temperature: v.optional(v.number()),
  },
  handler: async (ctx, args: CompletionArgs): Promise<LLMResponse> => {
    return await ctx.runAction(
      internal.actions.internalGenerateCompletion,
      args
    );
  },
});

// File Processing Actions
// TODO: update file processing to handle new model config helper function which supports AI Key switching
// export const internalProcessFile = internalAction({
//   args: {
//     fileData: v.string(),
//     fileName: v.string(),
//     fileType: v.string(),
//     extractionPrompt: v.string(),
//     modelConfig: v.object({
//       provider: v.string(),
//       modelId: v.string(),
//       temperature: v.optional(v.number()),
//       maxTokens: v.optional(v.number()),
//     }),
//   },
//   handler: async (ctx, args: FileProcessingArgs) => {
//     const binaryData = Uint8Array.from(atob(args.fileData), (c) =>
//       c.charCodeAt(0)
//     );

//     const fileProcessor = new FileProcessingService(
//       args.modelConfig.provider as LLMProvider,
//       {
//         maxFileSizeBytes: 10 * 1024 * 1024,
//         validFileTypes: ["application/pdf", "text/plain", "application/msword"],
//         vectorStoreExpiryDays: 1,
//       }
//     );

//     try {
//       const { fileId, vectorStoreId } = await fileProcessor.processFile({
//         data: binaryData,
//         name: args.fileName,
//         type: args.fileType,
//       });

//       const provider = LLMFactory.getProvider(
//         args.modelConfig.provider as LLMProvider
//       );

//       const response = await provider.generateCompletion(
//         [
//           { role: "system", content: args.extractionPrompt },
//           {
//             role: "user",
//             content: `Process the content from vector store ${vectorStoreId}`,
//           },
//         ],
//         {
//           ...args.modelConfig,
//           provider: args.modelConfig.provider as LLMProvider,
//         } as ModelConfig
//       );

//       await fileProcessor.cleanup(fileId, vectorStoreId);

//       return response;
//     } catch (error) {
//       console.error("Error processing file:", error);
//       if (error instanceof FileProcessingError) {
//         throw error;
//       }
//       throw new FileProcessingError(
//         `Failed to process file: ${error instanceof Error ? error.message : String(error)}`,
//         "PROCESSING_FAILED"
//       );
//     }
//   },
// });

// export const processFile = action({
//   args: {
//     fileData: v.string(),
//     fileName: v.string(),
//     fileType: v.string(),
//     extractionPrompt: v.string(),
//     modelConfig: v.object({
//       provider: v.string(),
//       modelId: v.string(),
//       temperature: v.optional(v.number()),
//       maxTokens: v.optional(v.number()),
//     }),
//   },
//   handler: async (ctx, args: FileProcessingArgs): Promise<LLMResponse> => {
//     const sizeInBytes =
//       (args.fileData.length * 3) / 4 -
//       (args.fileData.match(/=+$/)?.[0]?.length || 0);

//     if (sizeInBytes > 10 * 1024 * 1024) {
//       throw new FileProcessingError(
//         "File too large (max 10MB)",
//         "FILE_TOO_LARGE"
//       );
//     }

//     const validFileTypes = [
//       "application/pdf",
//       "text/plain",
//       "application/msword",
//     ];
//     if (!validFileTypes.includes(args.fileType)) {
//       throw new FileProcessingError(
//         "Unsupported file type",
//         "INVALID_FILE_TYPE"
//       );
//     }

//     try {
//       return await ctx.runAction(internal.actions.internalProcessFile, args);
//     } catch (error) {
//       if (error instanceof FileProcessingError) {
//         throw error;
//       }
//       throw new FileProcessingError(
//         `Failed to process file: ${error instanceof Error ? error.message : String(error)}`,
//         "PROCESSING_FAILED"
//       );
//     }
//   },
// });

// Streaming Chat Completion Actions
// export const internalGenerateStreamingCompletion = internalAction({
//   args: {
//     messages: v.array(
//       v.object({
//         role: v.union(
//           v.literal("system"),
//           v.literal("user"),
//           v.literal("assistant")
//         ),
//         content: v.string(),
//       })
//     ),
//     modelName: v.string(),
//     userId: v.id("users"),
//     useDefault: v.boolean(),
//     maxTokens: v.optional(v.number()),
//     temperature: v.optional(v.number()),
//   },
//   handler: async (ctx, args: CompletionArgs): Promise<StreamingLLMResponse> => {
//     try {
//       const modelConfig = await setupModelConfig(
//         ctx,
//         args.userId,
//         args.modelName,
//         args.useDefault,
//         args.maxTokens,
//         args.temperature
//       );

//       const stream = await LLMFactory.generateStream(
//         args.messages,
//         modelConfig
//       );
//       return stream;
//     } catch (error) {
//       console.error("Error generating streaming completion:", error);
//       throw error;
//     }
//   },
// });

// export const generateStreamingCompletion = action({
//   args: {
//     messages: v.array(
//       v.object({
//         role: v.union(
//           v.literal("system"),
//           v.literal("user"),
//           v.literal("assistant")
//         ),
//         content: v.string(),
//       })
//     ),
//     modelName: v.string(),
//     userId: v.id("users"),
//     useDefault: v.boolean(),
//     maxTokens: v.optional(v.number()),
//     temperature: v.optional(v.number()),
//   },
//   handler: async (ctx, args: CompletionArgs): Promise<StreamingLLMResponse> => {
//     return await ctx.runAction(
//       internal.actions.internalGenerateStreamingCompletion,
//       args
//     );
//   },
// });

export const internalGenerateSingleResponse = internalAction({
  args: {
    userId: v.id("users"),
    testCaseId: v.id("testCases"),
    agentId: v.id("agents"),
    testQuestionId: v.id("testQuestions"),
    runIndex: v.number(),
    questionContent: v.string(),
    agentPrompt: v.string(),
    agentModel: v.string(),
  },
  handler: async (ctx, args): Promise<LLMResponse> => {
    const messages: {
      role: "system" | "user" | "assistant";
      content: string;
    }[] = [
      {
        role: "system",
        content: args.agentPrompt,
      },
      {
        role: "user",
        content: args.questionContent,
      },
    ];

    try {
      const completion = await ctx.runAction(
        internal.actions.internalGenerateCompletion,
        {
          messages,
          modelName: args.agentModel,
          userId: args.userId,
          useDefault: false,
          maxTokens: 1000,
          temperature: 1.0,
        }
      );

      // Store the response
      await ctx.runMutation(internal.mutations.createTestResponse, {
        userId: args.userId,
        testCaseId: args.testCaseId,
        agentId: args.agentId,
        testQuestionId: args.testQuestionId,
        response: completion.content,
        runIndex: args.runIndex,
      });

      return completion;
    } catch (error) {
      console.error("Error generating response:", error);
      throw error;
    }
  },
});

// Create a public wrapper
export const generateSingleResponse = action({
  args: {
    userId: v.id("users"),
    testCaseId: v.id("testCases"),
    agentId: v.id("agents"),
    testQuestionId: v.id("testQuestions"),
    runIndex: v.number(),
    questionContent: v.string(),
    agentPrompt: v.string(),
    agentModel: v.string(),
  },
  handler: async (ctx, args): Promise<LLMResponse> => {
    return await ctx.runAction(
      internal.actions.internalGenerateSingleResponse,
      args
    );
  },
});

export const generatePreviewResponse = action({
  args: {
    userId: v.id("users"),
    questionContent: v.string(),
    agentPrompt: v.string(),
    agentModel: v.string(),
    chatHistory: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
  },
  handler: async (ctx, args): Promise<LLMResponse> => {
    const messages: {
      role: "system" | "user" | "assistant";
      content: string;
    }[] = [
      {
        role: "system",
        content: args.agentPrompt,
      },
      // Include all previous chat history
      ...args.chatHistory,
      // Add the new question
      {
        role: "user",
        content: args.questionContent,
      },
    ];

    try {
      const completion = await ctx.runAction(
        internal.actions.internalGenerateCompletion,
        {
          messages,
          modelName: args.agentModel,
          userId: args.userId,
          useDefault: false, // This means we will use the user API key if it exists
          maxTokens: 1000,
          temperature: 1.0,
        }
      );

      return completion;
    } catch (error) {
      console.error("Error generating preview response:", error);
      throw error;
    }
  },
});

// Main action that orchestrates everything
export const updateTestCase = action({
  args: {
    testCaseId: v.id("testCases"),
    name: v.string(),
    description: v.optional(v.string()),
    questions: v.array(
      v.object({
        id: v.optional(v.id("testQuestions")),
        content: v.string(),
        orderIndex: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Get test case and verify it exists
    const testCase = await ctx.runQuery(internal.queries.internalGetTestCase, {
      testCaseId: args.testCaseId,
    });
    if (!testCase) {
      throw new Error("Test case not found");
    }

    // Update basic test case info
    await ctx.runMutation(internal.mutations.internalUpdateTestCaseInfo, {
      testCaseId: args.testCaseId,
      name: args.name,
      description: args.description,
    });

    // Get existing questions
    const existingQuestions = await ctx.runQuery(
      internal.queries.internalGetTestQuestions,
      { testCaseId: args.testCaseId }
    );

    // Create sets for comparison
    const existingIds = new Set(existingQuestions.map((q) => q._id));
    const newIds = new Set(
      args.questions
        .map((q) => q.id)
        .filter((id): id is Id<"testQuestions"> => id !== undefined)
    );

    // Determine questions to add and remove
    const questionsToAdd = args.questions.filter((q) => !q.id);
    const questionIdsToRemove = [...existingIds].filter(
      (id) => !newIds.has(id)
    );

    // Get all test responses
    const testResponses = await ctx.runQuery(
      internal.queries.internalGetTestResponses,
      { testCaseId: args.testCaseId }
    );

    // Create set of unique agent/run pairs
    const agentRunPairs = new Set(
      testResponses.map((r) => `${r.agentId}-${r.runIndex}`)
    );

    // Handle new questions
    for (const question of questionsToAdd) {
      // Create the question
      const newQuestionId = await ctx.runMutation(
        internal.mutations.internalCreateTestQuestion,
        {
          testCaseId: args.testCaseId,
          content: question.content,
          orderIndex: question.orderIndex,
          userId: testCase.userId,
        }
      );

      // Generate responses for each agent/run pair
      for (const pair of agentRunPairs) {
        const [agentId, runIndex] = pair.split("-");

        // Get agent details
        const agent = await ctx.runQuery(internal.queries.internalGetAgent, {
          agentId: agentId as Id<"agents">,
        });
        if (!agent) continue;

        // Generate response
        await ctx.runAction(internal.actions.internalGenerateSingleResponse, {
          userId: testCase.userId,
          testCaseId: args.testCaseId,
          agentId: agentId as Id<"agents">,
          testQuestionId: newQuestionId,
          runIndex: parseInt(runIndex),
          questionContent: question.content,
          agentPrompt: agent.prompt,
          agentModel: agent.model,
        });
      }
    }

    // Handle questions to remove
    for (const questionId of questionIdsToRemove) {
      // Delete associated responses
      const responsesToDelete = testResponses.filter(
        (r) => r.testQuestionId === questionId
      );

      for (const response of responsesToDelete) {
        await ctx.runMutation(internal.mutations.internalDeleteTestResponse, {
          responseId: response._id,
        });
      }

      // Delete the question
      await ctx.runMutation(internal.mutations.internalDeleteTestQuestion, {
        questionId,
      });
    }

    // Update existing questions
    const questionsToUpdate = args.questions.filter((q) => q.id);
    for (const question of questionsToUpdate) {
      if (question.id) {
        await ctx.runMutation(internal.mutations.internalUpdateTestQuestion, {
          questionId: question.id,
          content: question.content,
          orderIndex: question.orderIndex,
        });
      }
    }
  },
});
