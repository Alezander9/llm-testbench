import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    isOnboardingCompleted: v.boolean(),
  }).index("by_clerkId", ["clerkId"]),

  userStates: defineTable({
    userId: v.id("users"),
    recentAgentIds: v.array(v.id("agents")),
    recentTestCaseIds: v.array(v.id("testCases")),
    lastAccessedAt: v.string(),
  }).index("by_userId", ["userId"]),

  userSettings: defineTable({
    userId: v.id("users"),
    gridColumns: v.optional(
      v.union(
        v.literal(1),
        v.literal(2),
        v.literal(3),
        v.literal(4),
        v.literal(5)
      )
    ),
    fontSize: v.optional(
      v.union(v.literal("small"), v.literal("medium"), v.literal("large"))
    ),
    chatWindowHeight: v.optional(v.number()),
  }).index("by_userId", ["userId"]),

  userFeedback: defineTable({
    userId: v.id("users"),
    feedback: v.string(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  userCredit: defineTable({
    userId: v.id("users"),
    remainingCredit: v.number(),
    totalCreditsReceived: v.number(),
    totalCreditsPurchased: v.number(),
    totalCreditsUsed: v.number(),
    lastUsageTimestamp: v.number(),
    lastRefreshTimestamp: v.number(),
    demoCreditsUsed: v.boolean(),
    samplePackageUsed: v.boolean(),
  }).index("by_userId", ["userId"]),

  creditTransactions: defineTable({
    userId: v.id("users"),
    modelName: v.string(),
    tokensUsed: v.number(),
    cost: v.number(),
    processed: v.boolean(),
    timestamp: v.number(),
    error: v.optional(v.string()),
  })
    .index("by_processed", ["processed"])
    .index("by_userId_timestamp", ["userId", "timestamp"]),

  apiKeys: defineTable({
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
  })
    .index("by_userId", ["userId"])
    .index("by_userId_provider", ["userId", "provider"]),

  apiKeyLogs: defineTable({
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
  }).index("by_userId", ["userId"]),

  agentFolders: defineTable({
    userId: v.id("users"),
    name: v.string(),
    parentFolderId: v.optional(v.id("agentFolders")),
    expanded: v.optional(v.boolean()),
  }).index("by_userId", ["userId"]),

  agents: defineTable({
    userId: v.id("users"),
    model: v.string(),
    prompt: v.string(),
    name: v.string(),
    score: v.optional(v.number()),
    folderId: v.optional(v.id("agentFolders")),
  })
    .index("by_userId", ["userId"])
    .index("by_folderId", ["folderId"]),

  testCases: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  testQuestions: defineTable({
    userId: v.id("users"),
    testCaseId: v.id("testCases"),
    testContent: v.string(),
    orderIndex: v.number(),
  }).index("by_testCase_order", ["testCaseId", "orderIndex"]),

  testResponses: defineTable({
    userId: v.id("users"),
    testCaseId: v.id("testCases"),
    agentId: v.id("agents"),
    testQuestionId: v.id("testQuestions"),
    response: v.string(),
    runIndex: v.number(),
    // optional flags user can add
    success: v.optional(v.boolean()),
    likes: v.optional(v.number()),
  })
    .index("by_userId_testCaseId_agentId", ["userId", "testCaseId", "agentId"])
    .index("by_agentId", ["agentId"])
    .index("by_testCaseId", ["testCaseId"])
    .index("by_testQuestionId", ["testQuestionId"]),

  errorLogs: defineTable({
    errorMessage: v.string(),
    timestamp: v.number(),
    userId: v.optional(v.id("users")),
  }).index("by_timestamp", ["timestamp"]),
});
