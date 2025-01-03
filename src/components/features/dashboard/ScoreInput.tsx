import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/utils";

const scoreInputVariants = cva(
  "flex items-center justify-center rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-center",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:brightness-95 border border-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]",
        secondary:
          "bg-secondary text-secondary-foreground hover:brightness-95 border border-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]",
        disabled:
          "border border-muted-foreground/20 text-muted-foreground cursor-not-allowed pointer-events-none",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

export interface ScoreInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size">,
    VariantProps<typeof scoreInputVariants> {
  onScoreChange?: (value: number) => void;
}

const ScoreInput = React.forwardRef<HTMLInputElement, ScoreInputProps>(
  ({ className, variant, onScoreChange, onChange, value, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      // Allow empty string or valid numbers
      if (value === "" || !isNaN(parseFloat(value))) {
        onChange?.(e);
        onScoreChange?.(value === "" ? 0 : parseFloat(value));
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.currentTarget.blur();
      }
    };

    return (
      <input
        type="number"
        className={cn(
          scoreInputVariants({ variant }),
          "h-10 w-10",
          "placeholder:text-muted-foreground",
          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          className
        )}
        placeholder="5.0"
        step="0.1"
        min="0"
        value={value ?? ""}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        ref={ref}
        {...props}
      />
    );
  }
);

ScoreInput.displayName = "ScoreInput";

export { ScoreInput, scoreInputVariants };
