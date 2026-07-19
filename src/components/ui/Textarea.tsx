import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@utils/cn";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error = false, className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-24 w-full rounded-lg border bg-surface px-3 py-2 text-sm text-foreground",
        "placeholder:text-muted",
        "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error ? "border-danger" : "border-border",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export default Textarea;
