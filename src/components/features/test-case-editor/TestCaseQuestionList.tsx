import { Textarea } from "../../../components/ui/textarea";
import { Button } from "../../../components/ui/button";
import { IconButton } from "../../../components/ui/icon-button";
import { Trash2, GripVertical, Plus, FileUp } from "lucide-react";
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
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Label } from "../../../components/ui/label";
import { FileInput } from "../../../components/ui/file-input";

// Define props interface for SortableQuestion
interface SortableQuestionProps {
  id: string | Id<"testQuestions">;
  question: {
    content: string;
    isLocked?: boolean;
  };
  index: number;
  updateQuestion: (index: number, content: string) => void;
  handleDeleteQuestion: (index: number) => void;
  handleKeyDown: (e: React.KeyboardEvent, index: number) => void;
}

// Update SortableQuestion to receive props
const SortableQuestion = ({
  id,
  question,
  index,
  updateQuestion,
  handleDeleteQuestion,
  handleKeyDown,
}: SortableQuestionProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex gap-3 items-start rounded-lg border p-4",
        "hover:border-primary/50 transition-colors",
        isDragging && "opacity-50"
      )}
    >
      {/* Question number & drag handle */}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-sm font-medium text-muted-foreground min-w-[1.5rem]">
          {index + 1}
        </span>
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
        >
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
  );
};

export const TestCaseQuestionList = () => {
  const {
    editorTestCase,
    addQuestion,
    removeQuestion,
    updateQuestion,
    reorderQuestions,
    setEditorTestCase,
  } = useTestCaseEditorStore();
  const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [csvContent, setCsvContent] = useState<string[][]>([]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = editorTestCase.questions.findIndex(
        (q) => (q.id || `question-${q.orderIndex}`) === active.id
      );
      const newIndex = editorTestCase.questions.findIndex(
        (q) => (q.id || `question-${q.orderIndex}`) === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderQuestions(oldIndex, newIndex);
      }
    }
  };

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

  const handleFileSelect = async (file: File) => {
    const text = await file.text();
    const rows = text
      .split("\n")
      .map((row) => row.split(",").map((cell) => cell.trim()));
    const headers = rows[0];

    setCsvColumns(headers);
    setCsvContent(rows.slice(1)); // Store content without headers
  };

  const handleImport = () => {
    if (!selectedColumn || !csvContent.length) return;

    const columnIndex = csvColumns.indexOf(selectedColumn);
    if (columnIndex === -1) return;

    // Filter out empty rows and create new questions
    const newQuestions = csvContent
      .filter((row) => row[columnIndex]?.trim())
      .map((row, index) => ({
        content: row[columnIndex].trim(),
        orderIndex: editorTestCase.questions.length + index,
      }));

    // Update the editor state with all existing and new questions
    setEditorTestCase({
      questions: [...editorTestCase.questions, ...newQuestions],
    });

    // Reset the import dialog state
    setIsImportDialogOpen(false);
    setSelectedColumn("");
    setCsvColumns([]);
    setCsvContent([]);
  };

  const getValidQuestionCount = () => {
    if (!selectedColumn || !csvContent.length) return 0;

    const columnIndex = csvColumns.indexOf(selectedColumn);
    if (columnIndex === -1) return 0;

    return csvContent.filter((row) => row[columnIndex]?.trim()).length;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-[40px]">
        <h2 className="text-lg font-semibold">Input Messages</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsImportDialogOpen(true)}
            className="gap-1"
          >
            <FileUp className="h-4 w-4" />
            Import
          </Button>
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
      </div>

      <ScrollArea className="h-[calc(100%-40px)]">
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={editorTestCase.questions.map(
              (q) => q.id || `question-${q.orderIndex}`
            )}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4 pr-4">
              {editorTestCase.questions.map((question, index) => (
                <SortableQuestion
                  key={question.id || `question-${index}`}
                  id={question.id || `question-${index}`}
                  question={question}
                  index={index}
                  updateQuestion={updateQuestion}
                  handleDeleteQuestion={handleDeleteQuestion}
                  handleKeyDown={handleKeyDown}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
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

      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Import Questions from CSV</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="csvFile">Choose CSV file</Label>
              <div className="flex items-center gap-2">
                <FileInput
                  variant="secondary"
                  size="sm"
                  accept=".csv"
                  onValueChange={(file) => {
                    if (file) {
                      handleFileSelect(file);
                    }
                  }}
                />
              </div>
            </div>

            {csvColumns.length > 0 && (
              <div className="grid gap-2">
                <Label>Column to import from</Label>
                <Select
                  value={selectedColumn}
                  onValueChange={setSelectedColumn}
                >
                  <SelectTrigger variant="secondary">
                    <SelectValue placeholder="Select a column" />
                  </SelectTrigger>
                  <SelectContent>
                    {csvColumns.map((column) => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              onClick={handleImport}
              variant={
                selectedColumn && csvContent.length ? "primary" : "disabled"
              }
              className="w-full"
            >
              Import {getValidQuestionCount()} Questions
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
