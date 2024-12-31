import { ArrowLeft } from "lucide-react";
import { IconButton } from "../../ui/icon-button";
import { Button } from "../../ui/button";
import { useTestCaseEditorStore } from "../../../stores/test-case-editor";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useGetUser } from "../../../hooks/useGetUser";
import { useToast } from "../../../hooks/use-toast";
import { useState } from "react";
import { LoadingDialog } from "./TestCaseLoadingDialog";

export const TestCaseEditorTopBar = () => {
  const currentUser = useGetUser();
  const { editorTestCase, questionsAdded, questionsRemoved, mode, reset } =
    useTestCaseEditorStore();
  const testResponses = useQuery(api.queries.getTestResponsesByTestCaseId, {
    testCaseId: editorTestCase._id,
  });
  const createTestCase = useMutation(api.mutations.createTestCaseWithQuestions);
  const updateTestCase = useAction(api.actions.updateTestCase);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    reset();
    window.location.hash = "";
  };

  const validateTestCase = () => {
    if (!currentUser?._id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to save a test case.",
        variant: "destructive",
      });
      return false;
    }

    if (!editorTestCase.name) {
      toast({
        title: "Error",
        description: "Please provide a name for your test case.",
        variant: "destructive",
      });
      return false;
    }

    // Check if there's at least one question
    if (editorTestCase.questions.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one question.",
        variant: "destructive",
      });
      return false;
    }

    // Check if all questions have content
    const emptyQuestions = editorTestCase.questions.some(
      (q) => !q.content.trim()
    );
    if (emptyQuestions) {
      toast({
        title: "Error",
        description: "All questions must have content.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleCreate = async () => {
    if (!validateTestCase() || !currentUser?._id) return;

    try {
      await createTestCase({
        userId: currentUser._id,
        testCaseName: editorTestCase.name,
        testCaseDescription: editorTestCase.description,
        questions: editorTestCase.questions.map((q) => q.content),
      });

      toast({
        title: "Success",
        description: "Test case created successfully!",
      });
      handleBack();
    } catch (error) {
      console.error("Failed to create test case:", error);
      toast({
        title: "Error",
        description: "Failed to create test case. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!validateTestCase() || !currentUser?._id || !editorTestCase._id) return;

    setIsLoading(true);

    try {
      await updateTestCase({
        testCaseId: editorTestCase._id,
        name: editorTestCase.name,
        description: editorTestCase.description,
        questions: editorTestCase.questions.map((q) => ({
          id: q.id,
          content: q.content,
          orderIndex: q.orderIndex,
        })),
      });

      toast({
        title: "Success",
        description: "Test case updated successfully!",
      });
      handleBack();
    } catch (error) {
      console.error("Failed to update test case:", error);
      toast({
        title: "Error",
        description: "Failed to update test case. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="w-full flex-shrink-0 p-2 border-b border-muted sticky top-0 bg-background z-10">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <IconButton
              variant="ghost"
              onClick={handleBack}
              aria-label="Go back"
            >
              <ArrowLeft className="h-6 w-6" />
            </IconButton>
            <h1 className="text-lg font-semibold">
              {mode === "create" ? "New Test Case" : "Edit Test Case"}
            </h1>
          </div>
          <Button
            variant="primary"
            onClick={mode === "create" ? handleCreate : handleSave}
          >
            {mode === "create" ? "Create" : "Save"}
          </Button>
        </div>
      </div>
      <LoadingDialog
        open={isLoading}
        newQuestions={questionsAdded}
        deletedQuestions={questionsRemoved}
        totalRuns={
          editorTestCase.questions.length > 0 && testResponses?.length
            ? Math.floor(
                testResponses.length /
                  (editorTestCase.questions.length -
                    questionsAdded +
                    questionsRemoved)
              )
            : 0
        }
      />
    </>
  );
};
