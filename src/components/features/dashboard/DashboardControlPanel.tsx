import { useQuery, useAction, useMutation } from "convex/react";

import { useDashboardStore } from "../../../stores/dashboard";
import { api } from "../../../../convex/_generated/api";
import { useGetUser } from "../../../hooks/useGetUser";
import { Id } from "../../../../convex/_generated/dataModel";
import { useSidebar } from "../../../components/ui/sidebar";
import { cn } from "../../../lib/utils";
import { IconButton } from "../../../components/ui/icon-button";
import { Save, Settings } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { ScoreInput } from "./ScoreInput";
import { useEffect, useState } from "react";
import { useDebounce } from "../../../hooks/useDebounce";
import { RunSelector } from "./RunSelector";
import { SearchSelector } from "../../ui/search-selector";
import { AVAILABLE_MODELS } from "../../features/llm/available-models";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../../ui/context-menu";

export const DashboardControlPanel = () => {
  const currentUser = useGetUser();
  const {
    selectedTestCaseId,
    setSelectedTestCaseId,
    selectedAgentId,
    runIndex,
    setRunIndex,
    generatingQuestions,
    addGeneratingQuestion,
    clearGeneratingQuestions,
  } = useDashboardStore();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const selectedAgent = useQuery(api.queries.getAgent, {
    agentId: selectedAgentId ?? undefined,
  });

  const questions = useQuery(api.queries.getOrderedTestQuestions, {
    testCaseId: selectedTestCaseId ?? undefined,
    userId: currentUser?._id,
  });

  const responses = useQuery(api.queries.getTestResponses, {
    userId: currentUser?._id,
    testCaseId: selectedTestCaseId ?? undefined,
    agentId: selectedAgentId ?? undefined,
    runIndex,
  });

  const generate = useAction(api.actions.generateSingleResponse);
  const updateAgentScore = useMutation(api.mutations.updateAgentScore);
  const addRecentTestCase = useMutation(api.mutations.addRecentTestCase);

  const [tempScore, setTempScore] = useState<number | undefined>(
    selectedAgent?.score
  );

  useEffect(() => {
    setTempScore(selectedAgent?.score);
  }, [selectedAgent?.score]);

  const debouncedUpdateScore = useDebounce((newScore: number) => {
    if (selectedAgent?._id) {
      updateAgentScore({
        agentId: selectedAgent._id,
        score: newScore,
      }).catch((error) => {
        console.error("Failed to update agent score:", error);
        // Revert the temp score if the mutation fails
        setTempScore(selectedAgent.score);
      });
    }
  }, 500); // 500ms delay

  const handleScoreChange = (newScore: number) => {
    setTempScore(newScore); // Update UI immediately
    debouncedUpdateScore(newScore); // Debounce the API call
  };

  const handleGenerate = async (newRunIndex: number) => {
    // Set the run index immediately so we can see the responses as they come in
    setRunIndex(newRunIndex);

    if (
      !currentUser?._id ||
      !selectedTestCaseId ||
      !selectedAgentId ||
      !selectedAgent ||
      !questions
    ) {
      return;
    }

    questions.forEach(async (question) => {
      addGeneratingQuestion(question._id);
      try {
        await generate({
          userId: currentUser._id,
          testCaseId: selectedTestCaseId,
          agentId: selectedAgentId,
          testQuestionId: question._id,
          runIndex: newRunIndex,
          questionContent: question.testContent,
          agentPrompt: selectedAgent.prompt,
          agentModel: selectedAgent.model,
        });
      } catch (error) {
        console.error(
          `Failed to generate response for question ${question._id}:`,
          error
        );
      }
    });

    clearGeneratingQuestions();
  };

  const handleTestCaseSelect = (testCaseId: Id<"testCases">) => {
    setSelectedTestCaseId(testCaseId);
    if (currentUser?._id) {
      addRecentTestCase({
        userId: currentUser._id,
        testCaseId,
      });
    }
  };

  const hasQuestions = Boolean(questions?.length);
  const hasResponses = Boolean(responses?.length);
  const hasAllResponses =
    hasQuestions && hasResponses && questions!.length === responses!.length;
  const isGenerating = generatingQuestions.size > 0 && !hasAllResponses;

  const totalRunsCount =
    useQuery(api.queries.getTestRunCount, {
      userId: currentUser?._id,
      testCaseId: selectedTestCaseId ?? undefined,
      agentId: selectedAgentId ?? undefined,
    }) ?? 0;

  const testCases = useQuery(api.queries.getUserTestCases, {
    userId: currentUser?._id,
  });

  const userState = useQuery(api.queries.getUserState, {
    userId: currentUser?._id,
  });

  const handleSaveAction = (action: string) => {
    switch (action) {
      case "download-csv":
        if (!questions || !responses || !selectedAgent || !selectedTestCaseId) {
          return;
        }

        // Create CSV content with headers
        let csvContent = "Input,Output\n";

        // Match questions with responses and add to CSV
        questions.forEach((question) => {
          const response = responses.find(
            (r) => r.testQuestionId === question._id
          );
          if (response) {
            // Escape quotes and commas in content
            const sanitizedQuestion = question.testContent.replace(/"/g, '""');
            const sanitizedResponse = response.response.replace(/"/g, '""');

            csvContent += `"${sanitizedQuestion}","${sanitizedResponse}"\n`;
          }
        });

        // Create and trigger download
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `Theo_results_${selectedAgent.name}_${selectedTestCaseId}_${runIndex}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        break;

      case "save-test-case":
        console.log("Save as test case");
        break;
    }
  };

  const handleSaveButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const contextMenuEvent = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: e.clientX,
      clientY: e.clientY,
    });
    e.currentTarget.dispatchEvent(contextMenuEvent);
  };

  return (
    <div
      className={cn(
        "w-full flex-shrink-0 p-2 border-b transition-[padding] duration-200 ease-linear relative",
        "sticky top-0 bg-background z-10",
        isCollapsed ? "pl-32" : "pl-4"
      )}
    >
      <div className="flex items-center justify-between w-full pr-[80px]">
        <div className="min-w-[200px] flex flex-col items-center">
          {selectedAgent ? (
            <>
              <Button
                variant="ghost"
                className="text-md font-semibold h-full hover:bg-muted/30"
                onClick={() => {
                  window.location.hash = `view-agent/${selectedAgent._id}`;
                }}
              >
                {selectedAgent.name}
              </Button>
              <span className="text-sm text-muted-foreground">
                Agent (
                {
                  AVAILABLE_MODELS[
                    selectedAgent.model as keyof typeof AVAILABLE_MODELS
                  ]
                }
                )
              </span>
            </>
          ) : (
            <>
              <span className="text-md text-muted-foreground">
                No Agent Selected
              </span>
              <span className="text-sm text-muted-foreground">Agent</span>
            </>
          )}
        </div>
        <div className="min-w-[200px] flex flex-col items-center">
          {currentUser && (
            <>
              <SearchSelector
                value={selectedTestCaseId ?? undefined}
                onValueChange={handleTestCaseSelect}
                items={testCases}
                recentIds={userState?.recentTestCaseIds}
                placeholder="Select test case"
                createNewText="Create new test case"
                onCreateNew={() => {
                  window.location.hash = "make-test-case";
                }}
                onEdit={(id) => {
                  window.location.hash = `edit-test-case/${id}`;
                }}
                variant="testcase"
              />
              <span className="text-sm text-muted-foreground">Test</span>
            </>
          )}
        </div>
        <div className="min-w-[120px] flex flex-col items-center">
          {selectedTestCaseId && selectedAgentId ? (
            <>
              <RunSelector
                currentRun={runIndex}
                totalRuns={totalRunsCount}
                onRunSelect={(run) => setRunIndex(run)}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
              <span className="text-sm text-muted-foreground">Run</span>
            </>
          ) : (
            <>
              <span className="text-md text-muted-foreground">-</span>
              <span className="text-sm text-muted-foreground">Run</span>
            </>
          )}
        </div>
        <div className="min-w-[120px] flex flex-col items-center">
          {selectedAgent ? (
            <>
              <ScoreInput
                variant="secondary"
                value={tempScore ?? undefined}
                onScoreChange={handleScoreChange}
                disabled={!selectedAgent}
              />
              <span className="text-sm text-muted-foreground">Score</span>
            </>
          ) : (
            <>
              <span className="text-md text-muted-foreground">-</span>
              <span className="text-sm text-muted-foreground">Score</span>
            </>
          )}
        </div>
      </div>
      {selectedAgent && selectedTestCaseId && hasAllResponses && (
        <ContextMenu>
          <ContextMenuTrigger>
            <IconButton
              variant="ghost"
              className="absolute right-14 top-2"
              aria-label="Save results"
              onClick={handleSaveButtonClick}
            >
              <Save className="h-6 w-6" />
            </IconButton>
          </ContextMenuTrigger>
          <ContextMenuContent
            onCloseAutoFocus={(e) => {
              e.preventDefault();
            }}
          >
            <ContextMenuItem onSelect={() => handleSaveAction("download-csv")}>
              Download as CSV
            </ContextMenuItem>
            <ContextMenuItem
              onSelect={() => handleSaveAction("save-test-case")}
            >
              Save as test case
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )}
      <IconButton
        variant="ghost"
        className="absolute right-4 top-2"
        aria-label="Open settings"
        onClick={() => {
          window.location.hash = "settings";
        }}
      >
        <Settings className="h-6 w-6" />
      </IconButton>
    </div>
  );
};
