import { useState } from "react";
import { Input } from "../../ui/input";
import { IconButton } from "../../ui/icon-button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";

interface APIKeyInputProps {
  provider: "openai" | "anthropic" | "deepseek";
  value: string;
  onChange: (value: string) => void;
  onDelete: () => void;
  error?: string;
  savedLastDigits: string | null;
}

const PLACEHOLDERS = {
  openai: "sk-...",
  anthropic: "sk-ant-...",
  deepseek: "sk-...",
};

export function APIKeyInput({
  provider,
  value,
  onChange,
  onDelete,
  error,
  savedLastDigits,
}: APIKeyInputProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Mask the API key, showing only the first 3 and last 4 characters
  const maskApiKey = (key: string) => {
    if (!key) return "";
    if (key.length <= 7) return key;
    return key.slice(0, 3) + "*".repeat(key.length - 7) + key.slice(-4);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          variant="secondary"
          value={maskApiKey(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            savedLastDigits
              ? `Current key ends in ${savedLastDigits}`
              : PLACEHOLDERS[provider]
          }
          className="font-mono"
        />
        {(savedLastDigits || value) && (
          <IconButton
            variant="ghost"
            onClick={() => setShowDeleteDialog(true)}
            disabled={!savedLastDigits && !value}
            aria-label="Delete API key"
          >
            <Trash2 className="h-4 w-4" />
          </IconButton>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your {provider.toUpperCase()} API
              key? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete();
                setShowDeleteDialog(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
