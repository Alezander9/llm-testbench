import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { useTestCaseEditorStore } from "../../../stores/test-case-editor";
import { cn } from "../../../lib/utils";
import { api } from "../../../../convex/_generated/api";
import { useQuery } from "convex/react";

export const TestCaseEditorInput = () => {
  const {
    editorTestCase,
    setEditorTestCase,
    questionsAdded,
    questionsRemoved,
  } = useTestCaseEditorStore();

  const testResponses = useQuery(api.queries.getTestResponsesByTestCaseId, {
    testCaseId: editorTestCase._id,
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Name Input */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Name</span>
        <Input
          placeholder="Test Case Name"
          value={editorTestCase.name}
          onChange={(e) => setEditorTestCase({ name: e.target.value })}
          variant="secondary"
          className={cn("border-foreground")}
        />
      </div>

      {/* Description Input */}
      <div className="flex flex-col gap-2 flex-1">
        <span className="text-sm font-medium">Description</span>
        <Textarea
          placeholder="Enter a description of your test case..."
          value={editorTestCase.description || ""}
          onChange={(e) => setEditorTestCase({ description: e.target.value })}
          variant="secondary"
          className={cn(
            "resize-none min-h-[200px]",
            "font-normal" // Different from agent editor's monospace
          )}
        />
      </div>

      {/* Statistics Section */}
      <div className="flex flex-col gap-2 mt-4">
        <span className="text-sm font-medium">Statistics</span>
        <div className="bg-secondary rounded-md p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-secondary-foreground/80">Questions</p>
              <p className="text-lg font-medium">
                {editorTestCase.questions.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary-foreground/80">Times Used</p>
              <p className="text-lg font-medium">
                {editorTestCase.questions.length > 0 && testResponses?.length
                  ? Math.floor(
                      testResponses.length /
                        (editorTestCase.questions.length -
                          questionsAdded +
                          questionsRemoved)
                    )
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
