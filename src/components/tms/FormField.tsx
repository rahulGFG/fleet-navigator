import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { LucideIcon } from "lucide-react";

export function FormField({
  label,
  required,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive font-medium">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export const IconInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input> & { icon?: LucideIcon; invalid?: boolean }
>(({ icon: Icon, invalid, className, ...props }, ref) => {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      )}
      <Input
        ref={ref}
        className={cn(
          Icon && "pl-9",
          invalid && "border-destructive focus-visible:ring-destructive/40",
          className,
        )}
        {...props}
      />
    </div>
  );
});
IconInput.displayName = "IconInput";