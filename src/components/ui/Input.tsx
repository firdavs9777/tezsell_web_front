import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error = false, className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg border bg-surface px-3 text-sm text-foreground",
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
Input.displayName = "Input";

export default Input;
