import { cn } from "@utils/cn";

export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-foreground/10", className)}
      aria-hidden="true"
    />
  );
}
