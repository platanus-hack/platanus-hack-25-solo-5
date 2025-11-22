"use client";

import { useEffect } from "react";
import { trackPageVisit } from "@/lib/attribution-cookies";

export function AttributionTracker() {
  useEffect(() => {
    trackPageVisit();
  }, []);

  return null;
}
