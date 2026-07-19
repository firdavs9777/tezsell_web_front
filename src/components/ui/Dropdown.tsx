import { ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@utils/cn";
import { useClickOutside } from "@hooks/useClickOutside";

export interface DropdownProps {
  trigger: ReactNode;
  align?: "left" | "right";
  children: ReactNode;
  className?: string;
}

export default function Dropdown({
  trigger,
  align = "left",
  children,
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {trigger}
      </button>
      {open && (
        <div
          role="menu"
          onClick={() => setOpen(false)}
          className={cn(
            "absolute z-50 mt-2 min-w-48 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-lg",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  to?: string;
  className?: string;
}

export function DropdownItem({ children, onClick, to, className }: DropdownItemProps) {
  const classes = cn(
    "flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-foreground/5",
    className
  );
  if (to) {
    return (
      <Link to={to} className={classes} role="menuitem">
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes} role="menuitem">
      {children}
    </button>
  );
}
