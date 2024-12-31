import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";

interface RunSelectorProps {
  currentRun: number;
  totalRuns: number;
  onRunSelect: (run: number) => void;
  onGenerate: (runIndex: number) => void;
  isGenerating?: boolean;
  className?: string;
}

const RunSelector = ({
  currentRun,
  totalRuns,
  onRunSelect,
  onGenerate,
  isGenerating = false,
  className,
}: RunSelectorProps) => {
  // If no runs exist yet, just show the generate button
  if (totalRuns === 0) {
    return (
      <Button
        onClick={() => onGenerate(1)}
        disabled={isGenerating}
        className={className}
      >
        {isGenerating ? "Generating..." : "Generate"}
      </Button>
    );
  }

  // Calculate which run numbers to show
  const getVisibleRuns = () => {
    if (totalRuns <= 5) {
      return Array.from({ length: totalRuns }, (_, i) => i + 1);
    }

    let runs = [];
    if (currentRun <= 3) {
      runs = [1, 2, 3, 4, 5];
    } else if (currentRun >= totalRuns - 2) {
      runs = Array.from({ length: 5 }, (_, i) => totalRuns - 4 + i);
    } else {
      runs = [currentRun - 1, currentRun, currentRun + 1];
    }
    return runs;
  };

  const visibleRuns = getVisibleRuns();
  const showLeftEllipsis = totalRuns > 5 && visibleRuns[0] > 1;
  const showRightEllipsis =
    totalRuns > 5 && visibleRuns[visibleRuns.length - 1] < totalRuns;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Previous button */}
      <Button
        variant="secondary"
        size="icon"
        onClick={() => onRunSelect(Math.max(1, currentRun - 1))}
        disabled={currentRun === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Run number buttons */}
      {showLeftEllipsis && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon">
              ...
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {Array.from({ length: visibleRuns[0] - 1 }, (_, i) => (
              <DropdownMenuItem key={i + 1} onClick={() => onRunSelect(i + 1)}>
                Run {i + 1}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {visibleRuns.map((run) => (
        <Button
          key={run}
          variant={run === currentRun ? "primary" : "secondary"}
          size="icon"
          onClick={() => onRunSelect(run)}
        >
          {run}
        </Button>
      ))}

      {showRightEllipsis && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon">
              ...
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Array.from(
              { length: totalRuns - visibleRuns[visibleRuns.length - 1] },
              (_, i) => (
                <DropdownMenuItem
                  key={visibleRuns[visibleRuns.length - 1] + i + 1}
                  onClick={() =>
                    onRunSelect(visibleRuns[visibleRuns.length - 1] + i + 1)
                  }
                >
                  Run {visibleRuns[visibleRuns.length - 1] + i + 1}
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Generate new run button */}
      <Button
        variant="secondary"
        size="icon"
        onClick={() => onGenerate(totalRuns + 1)}
        disabled={isGenerating}
      >
        <Plus className="h-4 w-4" />
      </Button>

      {/* Next button */}
      <Button
        variant="secondary"
        size="icon"
        onClick={() => onRunSelect(Math.min(totalRuns, currentRun + 1))}
        disabled={currentRun === totalRuns}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export { RunSelector };
export type { RunSelectorProps };
