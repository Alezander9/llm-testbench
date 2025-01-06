import { Id } from "./_generated/dataModel";
import { query, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { TreeItemType } from "../src/components/features/agent-list/types";

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    if (!args.clerkId) {
      return null;
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    return user;
  },
});

export const getOrderedTestQuestions = query({
  args: {
    userId: v.optional(v.id("users")),
    testCaseId: v.optional(v.id("testCases")),
  },
  handler: async (ctx, args) => {
    if (!args.userId || !args.testCaseId) {
      return [];
    }
    // Verify the test case exists and belongs to the user
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
      return null;
    }

    // Fetch questions using the new compound index
    const questions = await ctx.db
      .query("testQuestions")
      .withIndex("by_testCase_order")
      .filter((q) => q.eq(q.field("testCaseId"), args.testCaseId))
      .collect();

    return questions;
  },
});

export const getUserTestCases = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return [];
    }
    return await ctx.db
      .query("testCases")
      .withIndex("by_userId")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
  },
});

export const getUserAgents = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return [];
    }
    return await ctx.db
      .query("agents")
      .withIndex("by_userId")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
  },
});

export const getAgent = query({
  args: { agentId: v.optional(v.id("agents")) },
  handler: async (ctx, args) => {
    if (!args.agentId) {
      return null;
    }
    return await ctx.db.get(args.agentId);
  },
});

export const getTestCase = query({
  args: { testCaseId: v.optional(v.id("testCases")) },
  handler: async (ctx, args) => {
    if (!args.testCaseId) {
      return null;
    }
    return await ctx.db.get(args.testCaseId);
  },
});

export const getTestResponses = query({
  args: {
    userId: v.optional(v.id("users")),
    testCaseId: v.optional(v.id("testCases")),
    agentId: v.optional(v.id("agents")),
    runIndex: v.number(),
  },
  handler: async (ctx, args) => {
    // Type guard to ensure IDs are defined
    if (!args.userId || !args.testCaseId || !args.agentId) {
      return [];
    }

    // At this point, TypeScript knows these IDs are definitely defined
    const responses = await ctx.db
      .query("testResponses")
      .withIndex("by_userId_testCaseId_agentId", (q) =>
        q
          .eq("userId", args.userId as Id<"users">) // Type assertion to help TypeScript
          .eq("testCaseId", args.testCaseId as Id<"testCases">)
          .eq("agentId", args.agentId as Id<"agents">)
      )
      .filter((q) => q.eq(q.field("runIndex"), args.runIndex))
      .collect();

    return responses;
  },
});

export const getTestResponsesByTestCaseId = query({
  args: { testCaseId: v.optional(v.id("testCases")) },
  handler: async (ctx, args) => {
    if (!args.testCaseId) {
      return [];
    }
    return await ctx.db
      .query("testResponses")
      .withIndex("by_testCaseId")
      .filter((q) => q.eq(q.field("testCaseId"), args.testCaseId))
      .collect();
  },
});

export const getTestResponsesByTestQuestionId = query({
  args: { testQuestionId: v.optional(v.id("testQuestions")) },
  handler: async (ctx, args) => {
    if (!args.testQuestionId) {
      return [];
    }
    return await ctx.db
      .query("testResponses")
      .withIndex("by_testQuestionId")
      .filter((q) => q.eq(q.field("testQuestionId"), args.testQuestionId))
      .collect();
  },
});

export const getUserSettings = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return null;
    }

    // Get settings
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId as Id<"users">))
      .first();

    return settings;
  },
});

export const getTestRunCount = query({
  args: {
    userId: v.optional(v.id("users")),
    testCaseId: v.optional(v.id("testCases")),
    agentId: v.optional(v.id("agents")),
  },
  handler: async (ctx, args) => {
    if (!args.userId || !args.testCaseId || !args.agentId) {
      return 0;
    }

    const responses = await ctx.db
      .query("testResponses")
      .withIndex("by_userId_testCaseId_agentId", (q) =>
        q
          .eq("userId", args.userId as Id<"users">)
          .eq("testCaseId", args.testCaseId as Id<"testCases">)
          .eq("agentId", args.agentId as Id<"agents">)
      )
      .collect();

    if (responses.length === 0) {
      return 0;
    }

    const maxRunIndex = Math.max(...responses.map((r) => r.runIndex), -1);

    return maxRunIndex;
  },
});

export const getUserAgentTree = query({
  args: { userId: v.optional(v.id("users")) },
  async handler(ctx, args) {
    if (!args.userId) {
      return [];
    }

    // Get all folders for this user
    const folders = await ctx.db
      .query("agentFolders")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId as Id<"users">))
      .collect();

    // Get all agents for this user
    const agents = await ctx.db
      .query("agents")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId as Id<"users">))
      .collect();

    function buildTree(
      parentId: Id<"agentFolders"> | undefined = undefined,
      depth: number = 0
    ): TreeItemType[] {
      // Get immediate child folders and agents
      const childFolders = folders.filter((f) => {
        if (parentId === undefined) {
          return !f.parentFolderId;
        }
        return f.parentFolderId === parentId;
      });

      const childAgents = agents.filter((a) => {
        if (parentId === undefined) {
          return !a.folderId;
        }
        return a.folderId === parentId;
      });

      // Create tree items and sort them
      const items: TreeItemType[] = [
        ...childFolders.map((folder) => ({
          id: folder._id,
          name: folder.name,
          type: "folder" as const,
          children: buildTree(folder._id, depth + 1),
          parentFolderId: folder.parentFolderId,
          depth: depth,
          expanded: folder.expanded ?? false,
        })),
        ...childAgents.map((agent) => ({
          id: agent._id,
          name: agent.name,
          type: "agent" as const,
          score: agent.score,
          parentFolderId: agent.folderId,
          depth: depth,
        })),
      ].sort((a, b) => {
        // Special case: "Archive" folder always goes last
        if (a.type === "folder" && a.name === "Archive") return 1;
        if (b.type === "folder" && b.name === "Archive") return -1;

        // Normal alphabetical sorting
        return a.name.localeCompare(b.name);
      });

      return items;
    }

    const result = buildTree();
    return result;
  },
});

// Get user state query
export const getUserState = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return null;
    }
    return await ctx.db
      .query("userStates")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId as Id<"users">))
      .first();
  },
});

// Internal queries for database access
export const internalGetTestCase = internalQuery({
  args: { testCaseId: v.id("testCases") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.testCaseId);
  },
});

export const internalGetTestQuestions = internalQuery({
  args: { testCaseId: v.id("testCases") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("testQuestions")
      .withIndex("by_testCase_order")
      .filter((q) => q.eq(q.field("testCaseId"), args.testCaseId))
      .collect();
  },
});

export const internalGetTestResponses = internalQuery({
  args: { testCaseId: v.id("testCases") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("testResponses")
      .withIndex("by_testCaseId")
      .filter((q) => q.eq(q.field("testCaseId"), args.testCaseId))
      .collect();
  },
});

export const internalGetAgent = internalQuery({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.agentId);
  },
});

export const getApiKey = internalQuery({
  args: {
    userId: v.id("users"),
    provider: v.union(
      v.literal("openai"),
      v.literal("anthropic"),
      v.literal("deepseek")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("apiKeys")
      .withIndex("by_userId_provider", (q) =>
        q.eq("userId", args.userId).eq("provider", args.provider)
      )
      .first();
  },
});

export const getUserApiKeys = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const keys = await ctx.db
      .query("apiKeys")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Return keys without exposing encrypted key data
    return keys.map(({ encryptedKey, ...keyInfo }) => ({
      ...keyInfo,
      hasKey: true,
    }));
  },
});

export const getUserCreditInternal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userCredit")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const getUserCredit = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return null;
    }
    return await ctx.db
      .query("userCredit")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId as Id<"users">))
      .first();
  },
});

export const getUnprocessedTransactions = internalQuery({
  handler: async (ctx) => {
    return await ctx.db
      .query("creditTransactions")
      .withIndex("by_processed", (q) => q.eq("processed", false))
      .collect();
  },
});
