import { internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import {
  UserSetting,
  userSettingDefaults,
  UserSettingKey,
} from "../src/components/features/settings/types";

export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    isOnboardingCompleted: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
    if (existingUser) {
      return existingUser._id;
    }

    // Get only the first part of the firstName (before any spaces)
    const firstNameOnly = args.firstName.split(" ")[0];

    // Create new user if they don't exist
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      firstName: firstNameOnly, // Use the trimmed firstName
      lastName: args.lastName,
      isOnboardingCompleted: args.isOnboardingCompleted,
    });

    // create user settings
    await ctx.db.insert("userSettings", {
      userId: userId,
      gridColumns: 3,
      fontSize: "small",
      chatWindowHeight: 400,
    });

    // create user state
    await ctx.db.insert("userStates", {
      userId: userId,
      lastAccessedAt: new Date().toISOString(),
      recentAgentIds: [],
      recentTestCaseIds: [],
    });

    // initialize user agent folder with archive folder
    await ctx.db.insert("agentFolders", {
      userId: userId,
      name: "Archive",
      parentFolderId: undefined,
    });

    return userId;
  },
});

// Internal mutation to create a single test question
export const createTestQuestion = internalMutation({
  args: {
    userId: v.id("users"),
    testCaseId: v.id("testCases"),
    testContent: v.string(),
    orderIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const questionId = await ctx.db.insert("testQuestions", {
      userId: args.userId,
      testCaseId: args.testCaseId,
      testContent: args.testContent,
      orderIndex: args.orderIndex,
    });
    return questionId;
  },
});

// Main mutation to create a test case and its questions
export const createTestCaseWithQuestions = mutation({
  args: {
    userId: v.id("users"),
    testCaseName: v.string(),
    testCaseDescription: v.optional(v.string()),
    questions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Create the test case first
    const testCaseId = await ctx.db.insert("testCases", {
      userId: args.userId,
      name: args.testCaseName,
      description: args.testCaseDescription,
    });

    // Create each test question using the internal mutation
    const questionPromises = args.questions.map((question, index) =>
      ctx.db.insert("testQuestions", {
        userId: args.userId,
        testCaseId: testCaseId,
        testContent: question,
        orderIndex: index,
      })
    );

    // Wait for all questions to be created
    const questionIds = await Promise.all(questionPromises);

    return {
      testCaseId,
      questionIds,
    };
  },
});

export const createAgent = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    model: v.string(),
    prompt: v.string(),
    score: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Create the agent
    const agentId = await ctx.db.insert("agents", {
      userId: args.userId,
      name: args.name,
      model: args.model,
      prompt: args.prompt,
      score: args.score,
    });

    return agentId;
  },
});

export const createTestResponse = internalMutation({
  args: {
    userId: v.id("users"),
    testCaseId: v.id("testCases"),
    agentId: v.id("agents"),
    testQuestionId: v.id("testQuestions"),
    response: v.string(),
    runIndex: v.number(),
  },
  handler: async (ctx, args) => {
    // Verify the test case and question belong to user
    const testCase = await ctx.db
      .query("testCases")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("_id"), args.testCaseId)
        )
      )
      .first();

    if (!testCase) {
      throw new Error("Test case not found or unauthorized");
    }

    // Create the response
    const responseId = await ctx.db.insert("testResponses", {
      userId: args.userId,
      testCaseId: args.testCaseId,
      agentId: args.agentId,
      testQuestionId: args.testQuestionId,
      response: args.response,
      runIndex: args.runIndex,
    });

    return responseId;
  },
});

export const updateUserSetting = mutation({
  // Use generic type to ensure type safety while remaining flexible
  args: {
    userId: v.id("users"),
    settingKey: v.string(),
    settingValue: v.any(),
  },
  handler: async (ctx, args) => {
    // Get user ID from users table
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // Find existing settings
    const existingSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    // Validate the setting key and value at runtime
    validateSetting(args.settingKey, args.settingValue);

    if (existingSettings) {
      // Update existing settings
      await ctx.db.patch(existingSettings._id, {
        [args.settingKey]: args.settingValue,
      });
    } else {
      // Create new settings document
      await ctx.db.insert("userSettings", {
        userId: args.userId,
        [args.settingKey]: args.settingValue,
      });
    }
  },
});

// Runtime validation function
function validateSetting(
  key: string,
  value: any
): asserts value is UserSetting[UserSettingKey] {
  // First check if the key exists in UserSetting
  if (!(key in userSettingDefaults)) {
    throw new Error(`Unknown setting key: ${key}`);
  }

  // Check if the value type matches the type of the default value
  if (typeof value !== typeof userSettingDefaults[key as UserSettingKey]) {
    throw new Error(`Invalid type for setting ${key}`);
  }
}

export const updateAgentScore = mutation({
  args: {
    agentId: v.id("agents"),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    // Verify the agent exists
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    // Update the agent's score
    await ctx.db.patch(args.agentId, {
      score: args.score,
    });

    return args.agentId;
  },
});

export const moveAgent = mutation({
  args: {
    agentId: v.id("agents"),
    targetFolderId: v.optional(v.id("agentFolders")),
  },
  async handler(ctx, args) {
    await ctx.db.patch(args.agentId, {
      folderId: args.targetFolderId,
    });
  },
});

export const createFolder = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    parentFolderId: v.optional(v.id("agentFolders")),
  },
  async handler(ctx, args) {
    await ctx.db.insert("agentFolders", {
      userId: args.userId,
      name: args.name,
      parentFolderId: args.parentFolderId,
    });
  },
});

export const moveFolder = mutation({
  args: {
    folderId: v.id("agentFolders"),
    targetFolderId: v.optional(v.id("agentFolders")),
  },
  async handler(ctx, args) {
    // Verify the folder exists
    const folder = await ctx.db.get(args.folderId);
    if (!folder) {
      throw new Error("Folder not found");
    }

    // Prevent moving a folder into itself or its descendants
    if (args.targetFolderId) {
      let currentFolder = await ctx.db.get(args.targetFolderId);
      while (currentFolder?.parentFolderId) {
        if (currentFolder.parentFolderId === args.folderId) {
          throw new Error("Cannot move a folder into its own descendant");
        }
        currentFolder = await ctx.db.get(currentFolder.parentFolderId);
      }
    }

    // Update the folder's parent
    await ctx.db.patch(args.folderId, {
      parentFolderId: args.targetFolderId,
    });
  },
});

export const renameFolder = mutation({
  args: {
    folderId: v.id("agentFolders"),
    newName: v.string(),
  },
  async handler(ctx, args) {
    const folder = await ctx.db.get(args.folderId);
    if (!folder) {
      throw new Error("Folder not found");
    }

    await ctx.db.patch(args.folderId, {
      name: args.newName,
    });
  },
});

export const deleteFolder = mutation({
  args: {
    folderId: v.id("agentFolders"),
  },
  async handler(ctx, args) {
    // Get the folder we're deleting to know its parent
    const folderToDelete = await ctx.db.get(args.folderId);
    if (!folderToDelete) {
      throw new Error("Folder not found");
    }

    // Get all child folders (recursive)
    const getAllChildFolders = async (parentId: Id<"agentFolders">) => {
      const childFolders = await ctx.db
        .query("agentFolders")
        .withIndex("by_userId")
        .filter((q) => q.eq(q.field("parentFolderId"), parentId))
        .collect();

      let allFolders = [...childFolders];
      for (const folder of childFolders) {
        const descendants = await getAllChildFolders(folder._id);
        allFolders = [...allFolders, ...descendants];
      }
      return allFolders;
    };

    // Get all child folders
    const childFolders = await getAllChildFolders(args.folderId);

    // Update all child folders to point to the original folder's parent
    for (const folder of childFolders) {
      await ctx.db.patch(folder._id, {
        parentFolderId: folderToDelete.parentFolderId,
      });
    }

    // Update all agents in the folder and its children
    const agents = await ctx.db
      .query("agents")
      .withIndex("by_folderId")
      .filter((q) => q.eq(q.field("folderId"), args.folderId))
      .collect();

    for (const agent of agents) {
      await ctx.db.patch(agent._id, {
        folderId: folderToDelete.parentFolderId,
      });
    }

    // Finally, delete the folder
    await ctx.db.delete(args.folderId);
  },
});

export const renameAgent = mutation({
  args: {
    agentId: v.id("agents"),
    newName: v.string(),
  },
  async handler(ctx, args) {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    await ctx.db.patch(args.agentId, {
      name: args.newName,
    });
  },
});

export const deleteAgent = mutation({
  args: {
    agentId: v.id("agents"),
  },
  async handler(ctx, args) {
    // First delete all associated test responses
    const testResponses = await ctx.db
      .query("testResponses")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .collect();

    for (const response of testResponses) {
      await ctx.db.delete(response._id);
    }

    // Then delete the agent itself
    await ctx.db.delete(args.agentId);
  },
});

// Add agent to recents
export const addRecentAgent = mutation({
  args: {
    userId: v.id("users"),
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const existingUserState = await ctx.db
      .query("userStates")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existingUserState) {
      // Remove the agentId if it already exists in the array
      const filteredRecents = existingUserState.recentAgentIds.filter(
        (id) => id !== args.agentId
      );

      // Add the new agentId to the start and limit to 5 items
      const newRecents = [args.agentId, ...filteredRecents].slice(0, 5);

      await ctx.db.patch(existingUserState._id, {
        recentAgentIds: newRecents,
        lastAccessedAt: new Date().toISOString(),
      });
    }
  },
});

// Add test case to recents
export const addRecentTestCase = mutation({
  args: {
    userId: v.id("users"),
    testCaseId: v.id("testCases"),
  },
  handler: async (ctx, args) => {
    const existingUserState = await ctx.db
      .query("userStates")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existingUserState) {
      // Remove the testCaseId if it already exists in the array
      const filteredRecents = existingUserState.recentTestCaseIds.filter(
        (id) => id !== args.testCaseId
      );

      // Add the new testCaseId to the start and limit to 5 items
      const newRecents = [args.testCaseId, ...filteredRecents].slice(0, 5);

      await ctx.db.patch(existingUserState._id, {
        recentTestCaseIds: newRecents,
        lastAccessedAt: new Date().toISOString(),
      });
    }
  },
});

export const updateTestQuestions = mutation({
  args: {
    testCaseId: v.id("testCases"),
    questions: v.array(
      v.object({
        id: v.optional(v.id("testQuestions")),
        content: v.string(),
        orderIndex: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Get existing questions
    const existingQuestions = await ctx.db
      .query("testQuestions")
      .withIndex("by_testCase_order")
      .filter((q) => q.eq(q.field("testCaseId"), args.testCaseId))
      .collect();

    // Delete questions that are no longer present
    const newQuestionIds = args.questions
      .map((q) => q.id)
      .filter((id): id is Id<"testQuestions"> => id !== undefined);

    for (const question of existingQuestions) {
      if (!newQuestionIds.includes(question._id)) {
        await ctx.db.delete(question._id);
      }
    }

    // Update or create questions
    for (const question of args.questions) {
      if (question.id) {
        // Update existing question
        await ctx.db.patch(question.id, {
          testContent: question.content,
          orderIndex: question.orderIndex,
        });
      } else {
        // Create new question
        await ctx.db.insert("testQuestions", {
          testCaseId: args.testCaseId,
          testContent: question.content,
          orderIndex: question.orderIndex,
          userId: (await ctx.db.get(args.testCaseId))!.userId,
        });
      }
    }
  },
});

// Internal mutations for database modifications
export const internalUpdateTestCaseInfo = internalMutation({
  args: {
    testCaseId: v.id("testCases"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.testCaseId, {
      name: args.name,
      description: args.description,
    });
  },
});

export const internalCreateTestQuestion = internalMutation({
  args: {
    testCaseId: v.id("testCases"),
    content: v.string(),
    orderIndex: v.number(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("testQuestions", {
      testCaseId: args.testCaseId,
      testContent: args.content,
      orderIndex: args.orderIndex,
      userId: args.userId,
    });
  },
});

export const internalDeleteTestQuestion = internalMutation({
  args: { questionId: v.id("testQuestions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.questionId);
  },
});

export const internalUpdateTestQuestion = internalMutation({
  args: {
    questionId: v.id("testQuestions"),
    content: v.string(),
    orderIndex: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.questionId, {
      testContent: args.content,
      orderIndex: args.orderIndex,
    });
  },
});

export const internalDeleteTestResponse = internalMutation({
  args: { responseId: v.id("testResponses") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.responseId);
  },
});

export const updateFolderExpandedState = mutation({
  args: {
    folderId: v.id("agentFolders"),
    expanded: v.boolean(),
  },
  async handler(ctx, args) {
    await ctx.db.patch(args.folderId, {
      expanded: args.expanded,
    });
  },
});

export const createApiKey = internalMutation({
  args: {
    userId: v.id("users"),
    provider: v.union(
      v.literal("openai"),
      v.literal("anthropic"),
      v.literal("deepseek")
    ),
    encryptedKey: v.string(),
    isValid: v.boolean(),
    lastValidated: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Delete any existing key for this provider first
    const existing = await ctx.db
      .query("apiKeys")
      .withIndex("by_userId_provider", (q) =>
        q.eq("userId", args.userId).eq("provider", args.provider)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    // Create new key
    return await ctx.db.insert("apiKeys", {
      userId: args.userId,
      provider: args.provider,
      encryptedKey: args.encryptedKey,
      isValid: args.isValid,
      lastValidated: args.lastValidated,
      createdAt: args.createdAt,
      updatedAt: args.updatedAt,
    });
  },
});

export const updateApiKey = internalMutation({
  args: {
    userId: v.id("users"),
    provider: v.union(
      v.literal("openai"),
      v.literal("anthropic"),
      v.literal("deepseek")
    ),
    encryptedKey: v.string(),
    isValid: v.boolean(),
    lastValidated: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("apiKeys")
      .withIndex("by_userId_provider", (q) =>
        q.eq("userId", args.userId).eq("provider", args.provider)
      )
      .first();

    if (!existing) {
      throw new Error("API key not found");
    }

    return await ctx.db.patch(existing._id, {
      encryptedKey: args.encryptedKey,
      isValid: args.isValid,
      lastValidated: args.lastValidated,
      updatedAt: args.updatedAt,
    });
  },
});

export const deleteApiKey = internalMutation({
  args: {
    userId: v.id("users"),
    provider: v.union(
      v.literal("openai"),
      v.literal("anthropic"),
      v.literal("deepseek")
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("apiKeys")
      .withIndex("by_userId_provider", (q) =>
        q.eq("userId", args.userId).eq("provider", args.provider)
      )
      .first();

    if (!existing) {
      throw new Error("API key not found");
    }

    await ctx.db.delete(existing._id);
  },
});

export const logApiKeyAction = internalMutation({
  args: {
    userId: v.id("users"),
    provider: v.union(
      v.literal("openai"),
      v.literal("anthropic"),
      v.literal("deepseek")
    ),
    action: v.union(
      v.literal("create"),
      v.literal("update"),
      v.literal("delete"),
      v.literal("validate"),
      v.literal("use")
    ),
    timestamp: v.number(),
    success: v.boolean(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("apiKeyLogs", {
      userId: args.userId,
      provider: args.provider,
      action: args.action,
      timestamp: args.timestamp,
      success: args.success,
      errorMessage: args.errorMessage,
    });
  },
});
