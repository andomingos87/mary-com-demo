import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import { ObservabilityProvider } from "@/components/ObservabilityProvider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mary AI Platform",
  description: "Sua assistente inteligente para M&A",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${inter.className} bg-background text-foreground`}>
        <NextIntlClientProvider messages={messages}>
          <ObservabilityProvider>
            {children}
          </ObservabilityProvider>
        </NextIntlClientProvider>
        <Toaster richColors position="top-right" />
        <Script
          id="buug-embed"
          src="https://buug.io/embed.js"
          data-project="98f68c3d-bf07-4864-a74a-c36f08378d40"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
