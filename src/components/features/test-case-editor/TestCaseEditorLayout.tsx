import { useEffect } from "react";
import { useTestCaseEditorStore } from "../../../stores/test-case-editor";
import { TestCaseEditorTopBar } from "./TestCaseEditorTopBar";
import { TestCaseEditorInput } from "./TestCaseEditorInput";
import { TestCaseQuestionList } from "./TestCaseQuestionList";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

const getTestCaseIdFromHash = (): Id<"testCases"> | null => {
  const hash = window.location.hash;
  const match = hash.match(/#edit-test-case\/(.+)/);
  return match ? (match[1] as Id<"testCases">) : null;
};

export const TestCaseEditorLayout = () => {
  const { reset, setMode, setEditorTestCase } = useTestCaseEditorStore();

  // Get testCaseId from URL if in edit mode
  const testCaseId = getTestCaseIdFromHash();

  // Fetch test case and questions if in edit mode
  const testCase = useQuery(api.queries.getTestCase, {
    testCaseId: testCaseId ?? undefined,
  });

  const questions = useQuery(api.queries.getOrderedTestQuestions, {
    testCaseId: testCaseId ?? undefined,
    userId: testCase?.userId,
  });

  // Set up initial state based on URL and data
  useEffect(() => {
    const hash = window.location.hash;

    if (hash.startsWith("#make-test-case")) {
      setMode("create");
    } else if (hash.startsWith("#edit-test-case/")) {
      setMode("edit");

      // If we have the test case and questions data, set up the editor
      if (testCase && questions) {
        setEditorTestCase({
          _id: testCase._id,
          userId: testCase.userId,
          name: testCase.name,
          description: testCase.description,
          questions: questions.map((q) => ({
            id: q._id,
            content: q.testContent,
            orderIndex: q.orderIndex,
            isLocked: true, // Lock existing questions in edit mode
          })),
        });
      }
    }
  }, [window.location.hash, testCase, questions, setMode, setEditorTestCase]);

  // Reset store when component unmounts
  useEffect(() => {
    return () => reset();
  }, [reset]);

  return (
    <div className="flex flex-col h-screen">
      <TestCaseEditorTopBar />
      <div className="flex flex-1 gap-12 px-6 relative overflow-hidden">
        {/* Background accent for right panel */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/25 -z-10" />

        {/* Left panel - Test case metadata */}
        <div className="flex-1 min-w-0 pt-7 mt-10 overflow-y-auto px-2">
          <TestCaseEditorInput />
        </div>

        {/* Right panel - Question list */}
        <div className="flex-1 min-w-0 h-[calc(100vh-56.8px)] pt-7 px-2">
          <TestCaseQuestionList />
        </div>
      </div>
    </div>
  );
};
