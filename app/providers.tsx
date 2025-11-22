"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProvider } from "convex/react";
import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://dummy.convex.cloud";

if (!process.env.NEXT_PUBLIC_CONVEX_URL && process.env.NODE_ENV === "development") {
  console.warn("⚠️ NEXT_PUBLIC_CONVEX_URL not configured. Run 'convex dev' and check .env.local");
}

const convex = new ConvexReactClient(convexUrl);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </ConvexProvider>
  );
}
