import { Dialog, DialogContent } from "../../../components/ui/dialog";
import { Loader2 } from "lucide-react";

interface LoadingDialogProps {
  open: boolean;
  newQuestions: number;
  deletedQuestions: number;
  totalRuns: number;
}

export const LoadingDialog = ({
  open,
  newQuestions,
  deletedQuestions,
  totalRuns,
}: LoadingDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="flex flex-col items-center text-center gap-2">
            <h3 className="text-lg font-semibold">Just a moment</h3>
            <p className="text-sm text-muted-foreground">
              Updating {totalRuns} previous test{totalRuns === 1 ? "" : "s"} run
              {totalRuns === 1 ? "" : "s"} with {newQuestions} new input
              {newQuestions === 1 ? "" : "s"} and cleaning up old results for{" "}
              {deletedQuestions} deleted input
              {deletedQuestions === 1 ? "" : "s"}.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
