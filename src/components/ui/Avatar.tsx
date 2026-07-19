import { useState } from "react";
import { cn } from "@utils/cn";

type Size = "sm" | "md" | "lg";

const sizeClasses: Record<Size, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: Size;
  className?: string;
}

export default function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-semibold text-primary",
        sizeClasses[size],
        className
      )}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        initials || "?"
      )}
    </span>
  );
}
