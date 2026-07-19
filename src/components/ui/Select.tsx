import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@utils/cn";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error = false, className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg border bg-surface px-3 text-sm text-foreground",
        "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error ? "border-danger" : "border-border",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

export default Select;
