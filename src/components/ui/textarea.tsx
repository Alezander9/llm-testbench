import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const textareaVariants = cva(
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
      size: {
        default: "min-h-[80px] px-3 py-2",
        sm: "min-h-[60px] px-2 py-1",
        lg: "min-h-[120px] px-4 py-3",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea, textareaVariants };
