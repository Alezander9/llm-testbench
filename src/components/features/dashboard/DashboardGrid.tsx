import { useQuery } from "convex/react";
import { useDashboardStore } from "../../../stores/dashboard";
import { ChatWindow } from "../chat-window/ChatWindow";
import { api } from "../../../../convex/_generated/api";
import { useGetUser } from "../../../hooks/useGetUser";
import { Id } from "../../../../convex/_generated/dataModel";

const gridColsClass = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
} as const;

export const DashboardGrid = () => {
  const currentUser = useGetUser();
  const {
    selectedTestCaseId,
    selectedAgentId,
    gridColumns,
    runIndex,
    generatingQuestions,
  } = useDashboardStore();
  const questions = useQuery(api.queries.getOrderedTestQuestions, {
    testCaseId: selectedTestCaseId
      ? (selectedTestCaseId as Id<"testCases">)
      : undefined,
    userId: currentUser?._id,
  });

  // New query for responses
  const responses = useQuery(api.queries.getTestResponses, {
    userId: currentUser?._id,
    testCaseId: selectedTestCaseId ?? undefined,
    agentId: selectedAgentId ?? undefined,
    runIndex,
  });

  // New response mapping
  const responseMap = new Map(
    responses?.map((response) => [response.testQuestionId, response]) ?? []
  );

  return (
    <div className={`flex-1 p-4 grid ${gridColsClass[gridColumns]} gap-4`}>
      {questions?.map((question) => {
        const response = responseMap.get(question._id);
        const isGenerating = generatingQuestions.has(question._id);
        const isAnswered = responseMap.has(question._id);

        return (
          <ChatWindow
            key={question._id}
            messages={[
              {
                role: "user" as const,
                content: question.testContent,
                id: question._id,
              },
              // Add response message if it exists
              ...(response
                ? [
                    {
                      role: "assistant" as const,
                      content: response.response,
                      id: `${response._id}`,
                    },
                  ]
                : []),
            ]}
            isTyping={!isAnswered && isGenerating}
            className="h-96"
          />
        );
      })}
    </div>
  );
};
