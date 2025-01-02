import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { LLMFactory } from "../src/components/features/llm/factory";
import { FileProcessingService } from "../src/components/features/llm/services/fileProcessing";
import {
  Message,
  ModelConfig,
  FileProcessingError,
  LLMProvider,
  LLMResponse,
  StreamingLLMResponse,
} from "../src/components/features/llm/types";
import { Id } from "./_generated/dataModel";

// Define the shape of our arguments as plain objects
type CompletionArgs = {
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  modelConfig: {
    provider: LLMProvider;
    modelId: string;
    temperature?: number;
    maxTokens?: number;
  };
};

type FileProcessingArgs = {
  fileData: string;
  fileName: string;
  fileType: string;
  extractionPrompt: string;
  modelConfig: {
    provider: LLMProvider;
    modelId: string;
    temperature?: number;
    maxTokens?: number;
  };
};

// Initialize LLM providers
LLMFactory.initialize({
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
    organizationId: process.env.OPENAI_ORG_ID,
  },
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY!,
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY!,
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
    modelConfig: v.object({
      provider: v.string(),
      modelId: v.string(),
      temperature: v.optional(v.number()),
      maxTokens: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args: CompletionArgs) => {
    try {
      const response = await LLMFactory.generateCompletion(
        args.messages,
        args.modelConfig
      );
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
    modelConfig: v.object({
      provider: v.string(),
      modelId: v.string(),
      temperature: v.optional(v.number()),
      maxTokens: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args: CompletionArgs): Promise<LLMResponse> => {
    return await ctx.runAction(
      internal.actions.internalGenerateCompletion,
      args
    );
  },
});

// File Processing Actions
export const internalProcessFile = internalAction({
  args: {
    fileData: v.string(),
    fileName: v.string(),
    fileType: v.string(),
    extractionPrompt: v.string(),
    modelConfig: v.object({
      provider: v.string(),
      modelId: v.string(),
      temperature: v.optional(v.number()),
      maxTokens: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args: FileProcessingArgs) => {
    const binaryData = Uint8Array.from(atob(args.fileData), (c) =>
      c.charCodeAt(0)
    );

    const fileProcessor = new FileProcessingService(
      args.modelConfig.provider as LLMProvider,
      {
        maxFileSizeBytes: 10 * 1024 * 1024,
        validFileTypes: ["application/pdf", "text/plain", "application/msword"],
        vectorStoreExpiryDays: 1,
      }
    );

    try {
      const { fileId, vectorStoreId } = await fileProcessor.processFile({
        data: binaryData,
        name: args.fileName,
        type: args.fileType,
      });

      const provider = LLMFactory.getProvider(
        args.modelConfig.provider as LLMProvider
      );

      const response = await provider.generateCompletion(
        [
          { role: "system", content: args.extractionPrompt },
          {
            role: "user",
            content: `Process the content from vector store ${vectorStoreId}`,
          },
        ],
        {
          ...args.modelConfig,
          provider: args.modelConfig.provider as LLMProvider,
        } as ModelConfig
      );

      await fileProcessor.cleanup(fileId, vectorStoreId);

      return response;
    } catch (error) {
      console.error("Error processing file:", error);
      if (error instanceof FileProcessingError) {
        throw error;
      }
      throw new FileProcessingError(
        `Failed to process file: ${error instanceof Error ? error.message : String(error)}`,
        "PROCESSING_FAILED"
      );
    }
  },
});

export const processFile = action({
  args: {
    fileData: v.string(),
    fileName: v.string(),
    fileType: v.string(),
    extractionPrompt: v.string(),
    modelConfig: v.object({
      provider: v.string(),
      modelId: v.string(),
      temperature: v.optional(v.number()),
      maxTokens: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args: FileProcessingArgs): Promise<LLMResponse> => {
    const sizeInBytes =
      (args.fileData.length * 3) / 4 -
      (args.fileData.match(/=+$/)?.[0]?.length || 0);

    if (sizeInBytes > 10 * 1024 * 1024) {
      throw new FileProcessingError(
        "File too large (max 10MB)",
        "FILE_TOO_LARGE"
      );
    }

    const validFileTypes = [
      "application/pdf",
      "text/plain",
      "application/msword",
    ];
    if (!validFileTypes.includes(args.fileType)) {
      throw new FileProcessingError(
        "Unsupported file type",
        "INVALID_FILE_TYPE"
      );
    }

    try {
      return await ctx.runAction(internal.actions.internalProcessFile, args);
    } catch (error) {
      if (error instanceof FileProcessingError) {
        throw error;
      }
      throw new FileProcessingError(
        `Failed to process file: ${error instanceof Error ? error.message : String(error)}`,
        "PROCESSING_FAILED"
      );
    }
  },
});

// Streaming Chat Completion Actions
export const internalGenerateStreamingCompletion = internalAction({
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
    modelConfig: v.object({
      provider: v.string(),
      modelId: v.string(),
      temperature: v.optional(v.number()),
      maxTokens: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args: CompletionArgs): Promise<StreamingLLMResponse> => {
    try {
      const stream = await LLMFactory.generateStream(
        args.messages,
        args.modelConfig
      );
      return stream;
    } catch (error) {
      console.error("Error generating streaming completion:", error);
      throw error;
    }
  },
});

export const generateStreamingCompletion = action({
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
    modelConfig: v.object({
      provider: v.string(),
      modelId: v.string(),
      temperature: v.optional(v.number()),
      maxTokens: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args: CompletionArgs): Promise<StreamingLLMResponse> => {
    return await ctx.runAction(
      internal.actions.internalGenerateStreamingCompletion,
      args
    );
  },
});

// Make the original action internal
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

    let provider: LLMProvider = "openai";
    if (args.agentModel.includes("deepseek")) {
      provider = "deepseek";
    } else if (args.agentModel.includes("claude")) {
      provider = "anthropic";
    }
    const modelConfig: ModelConfig = {
      provider: provider,
      modelId: args.agentModel,
      maxTokens: 1000,
    };

    try {
      const completion = await ctx.runAction(
        internal.actions.internalGenerateCompletion,
        {
          messages,
          modelConfig,
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

    let provider: LLMProvider = "openai";
    if (args.agentModel.includes("deepseek")) {
      provider = "deepseek";
    } else if (args.agentModel.includes("claude")) {
      provider = "anthropic";
    }
    const modelConfig: ModelConfig = {
      provider: provider,
      modelId: args.agentModel,
      maxTokens: 1000,
    };

    try {
      const completion = await ctx.runAction(
        internal.actions.internalGenerateCompletion,
        {
          messages,
          modelConfig,
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
