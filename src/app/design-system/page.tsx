import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DesignSystemShowcase } from "@/components/design-system/DesignSystemShowcase";

/**
 * Rota isolada: não está no matcher do middleware (sem updateSession).
 * Habilitada em desenvolvimento ou com NEXT_PUBLIC_SHOW_DESIGN_SYSTEM=true.
 */
function isDesignSystemEnabled(): boolean {
  if (process.env.NODE_ENV === "development") return true;
  return process.env.NEXT_PUBLIC_SHOW_DESIGN_SYSTEM === "true";
}

export const metadata: Metadata = {
  title: "Design System — Mary AI Platform",
  robots: { index: false, follow: false },
};

export default function DesignSystemPage() {
  if (!isDesignSystemEnabled()) {
    notFound();
  }

  return <DesignSystemShowcase />;
}
