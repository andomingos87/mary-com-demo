import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DesignSystemSection({
  id,
  title,
  description,
  children,
  className,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-28 border-b border-border pb-16 last:border-0 last:pb-0",
        className
      )}
    >
      <h2 className="mb-2 text-2xl font-semibold tracking-tight">{title}</h2>
      {description ? (
        <p className="mb-8 max-w-2xl text-sm text-muted-foreground">{description}</p>
      ) : (
        <div className="mb-8" />
      )}
      {children}
    </section>
  );
}

export function DemoSurface({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-6 shadow-card",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DemoRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4 rounded-lg border border-dashed border-border bg-background/50 p-4",
        className
      )}
    >
      {children}
    </div>
  );
}
