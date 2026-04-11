"use client";

import { useEffect, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { DesignSystemFoundation } from "@/components/design-system/DesignSystemFoundation";
import { DesignSystemPrimitives } from "@/components/design-system/DesignSystemPrimitives";

const NAV = [
  { href: "#foundation", label: "Fundação" },
  { href: "#primitives", label: "Componentes" },
] as const;

export function DesignSystemShowcase() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Mary AI Platform
              </p>
              <h1 className="text-xl font-semibold">Design system</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <nav className="flex flex-wrap gap-2" aria-label="Seções">
                {NAV.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-smooth hover:bg-accent hover:text-accent-foreground"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDark((d) => !d)}
                className="border-border"
              >
                {dark ? "Modo claro" : "Modo escuro"}
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl space-y-16 px-4 py-10">
          <p className="text-sm text-muted-foreground">
            Vitrine isolada dos tokens em{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              globals.css
            </code>{" "}
            e dos primitives em{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              src/components/ui
            </code>
            .
          </p>

          <DesignSystemFoundation />
          <DesignSystemPrimitives />
        </main>

        <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
          Uso interno — não acoplado a rotas protegidas nem providers de org.
        </footer>
      </div>
    </TooltipProvider>
  );
}
