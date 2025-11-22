"use client";

import { Analytics } from "@vercel/analytics/next";
import { useEffect, useState } from "react";
import { getConsentPreferences } from "@/lib/cookie-consent";

/**
 * Conditional Analytics Component
 *
 * Only loads Vercel Analytics if user has given analytics consent
 * Respects GDPR and ePrivacy requirements
 */
export function ConditionalAnalytics() {
  const [hasConsent, setHasConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check consent preferences
    const preferences = getConsentPreferences();

    if (preferences && preferences.analytics) {
      setHasConsent(true);
    } else {
      setHasConsent(false);
    }

    setIsLoading(false);

    // Listen for storage changes (when user updates consent)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cookie-consent-preferences") {
        const newPreferences = getConsentPreferences();
        setHasConsent(newPreferences?.analytics || false);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Don't render until we've checked consent
  if (isLoading) return null;

  // Only render Analytics if user has given consent
  return hasConsent ? <Analytics /> : null;
}
