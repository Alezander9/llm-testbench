import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const fileInputVariants = cva(
  "flex w-full rounded-md border text-sm ring-offset-background file:border-0 file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-muted bg-background shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)] file:bg-secondary file:text-secondary-foreground hover:file:brightness-95 file:shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]",
        secondary:
          "border-muted bg-secondary shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)] file:bg-primary file:text-primary-foreground hover:file:brightness-95 file:shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]",
        ghost:
          "border-muted bg-transparent file:bg-muted/30 file:text-foreground hover:file:bg-muted/50",
        destructive:
          "border-destructive bg-destructive/5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)] file:bg-destructive file:text-destructive-foreground hover:file:brightness-95 file:shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]",
      },
      size: {
        default: "h-10 file:h-10 file:px-4 file:py-2",
        sm: "h-9 file:h-9 file:px-3 rounded-md",
        lg: "h-11 file:h-11 file:px-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface FileInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof fileInputVariants> {
  onValueChange?: (file: File | null) => void;
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ className, variant, size, onChange, onValueChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] || null;
      if (onValueChange) {
        onValueChange(file);
      }
      if (onChange) {
        onChange(event);
      }
    };

    return (
      <input
        type="file"
        className={cn(fileInputVariants({ variant, size, className }))}
        onChange={handleChange}
        ref={ref}
        {...props}
      />
    );
  }
);

FileInput.displayName = "FileInput";

export { FileInput, fileInputVariants };
