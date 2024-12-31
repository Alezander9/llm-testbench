import { Textarea } from "../../../components/ui/textarea";
import { Button } from "../../../components/ui/button";
import { IconButton } from "../../../components/ui/icon-button";
import { Trash2, GripVertical, Plus } from "lucide-react";
import { useTestCaseEditorStore } from "../../../stores/test-case-editor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { useState } from "react";
import { cn } from "../../../lib/utils";
import { ScrollArea } from "../../../components/ui/scroll-area";

export const TestCaseQuestionList = () => {
  const { editorTestCase, addQuestion, removeQuestion, updateQuestion } =
    useTestCaseEditorStore();
  const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    // Only handle if the question isn't locked
    if (editorTestCase.questions[index].isLocked) return;

    // Allow shift+enter to create new lines
    if (e.key === "Enter" && e.shiftKey) {
      return; // Let the default behavior happen
    }

    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault(); // Prevent default tab/enter behavior

      addQuestion();

      // Focus the new textarea on the next render
      setTimeout(() => {
        const textareas = document.querySelectorAll("textarea");
        const newTextarea = textareas[index + 2]; // +2 because there is one textarea for the name of the test case

        if (newTextarea) {
          newTextarea.focus();
        }
      }, 0);
    }
  };

  const handleDeleteQuestion = (index: number) => {
    if (editorTestCase.questions[index].isLocked) {
      setQuestionToDelete(index);
    } else {
      removeQuestion(index);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-[40px]">
        <h2 className="text-lg font-semibold">Input Messages</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={addQuestion}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Input
        </Button>
      </div>

      <ScrollArea className="h-[calc(100%-40px)]">
        <div className="space-y-4 pr-4">
          {editorTestCase.questions.map((question, index) => (
            <div
              key={index}
              className={cn(
                "group relative flex gap-3 items-start rounded-lg border p-4",
                "hover:border-primary/50 transition-colors"
              )}
            >
              {/* Question number & drag handle (placeholder for now) */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm font-medium text-muted-foreground min-w-[1.5rem]">
                  {index + 1}
                </span>
                <div className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              {/* Question content */}
              <div className="flex-1">
                <Textarea
                  value={question.content}
                  onChange={(e) => updateQuestion(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  disabled={question.isLocked}
                  placeholder={`Enter question ${index + 1}...`}
                  variant={question.isLocked ? "viewOnly" : "secondary"}
                  className="resize-none min-h-[60px]"
                />
              </div>

              {/* Delete button */}
              <IconButton
                variant="ghost"
                onClick={() => handleDeleteQuestion(index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete input"
              >
                <Trash2 className="h-4 w-4" />
              </IconButton>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={questionToDelete !== null}
        onOpenChange={() => setQuestionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Input?</AlertDialogTitle>
            <AlertDialogDescription>
              If you delete this input, it will also delete all agent responses
              to this input in your tests. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (questionToDelete !== null) {
                  removeQuestion(questionToDelete);
                  setQuestionToDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
