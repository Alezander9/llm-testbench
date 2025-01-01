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
});
