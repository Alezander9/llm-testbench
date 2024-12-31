import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const inputVariants = cva(
  "flex w-full rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground border border-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]",
        secondary:
          "bg-secondary text-secondary-foreground border border-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]",
        viewOnly:
          "bg-muted/25 border border-muted-foreground/20 text-foreground cursor-not-allowed pointer-events-none",
        disabled:
          "border border-muted-foreground/20 text-muted-foreground cursor-not-allowed pointer-events-none",
      },
      inputSize: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      inputSize: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, inputSize, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input, inputVariants };
