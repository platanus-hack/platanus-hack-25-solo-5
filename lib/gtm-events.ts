"use client";

import { getConsentPreferences } from "./cookie-consent";

/**
 * Google Tag Manager Event Helpers
 *
 * This file provides helper functions to send events to Google Tag Manager (GTM)
 * while respecting user consent preferences (GDPR / Consent Mode v2).
 *
 * All events automatically check consent before firing.
 */

/**
 * Check if GTM is available and initialized
 */
function isGTMAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.gtag === "function";
}

/**
 * Send a custom event to GTM dataLayer
 * Respects user consent preferences
 *
 * @param eventName - Name of the event
 * @param eventParams - Event parameters
 *
 * @example
 * trackEvent("button_click", { button_name: "subscribe", location: "header" });
 */
export function trackEvent(eventName: string, eventParams?: Record<string, unknown>): void {
  if (!isGTMAvailable()) return;

  const consent = getConsentPreferences();

  // Only track if user has given analytics consent
  if (!consent || !consent.analytics) {
    console.debug(`Event "${eventName}" not sent: analytics consent not given`);
    return;
  }

  try {
    window.gtag?.("event", eventName, eventParams as Record<string, string>);
  } catch (error) {
    console.error("Failed to track event:", error);
  }
}

/**
 * Track page view (useful for SPA navigation)
 *
 * @example
 * trackPageView("/chat/explore-bots", "Explore Bots");
 */
export function trackPageView(path: string, title?: string): void {
  trackEvent("page_view", {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href,
  });
}

/**
 * Track conversion event (requires marketing consent)
 *
 * @param conversionId - Conversion identifier
 * @param conversionLabel - Conversion label
 * @param value - Conversion value
 * @param currency - Currency code (default: USD)
 *
 * @example
 * trackConversion("AW-123456789", "abc123", 29.99, "USD");
 */
export function trackConversion(
  conversionId: string,
  conversionLabel: string,
  value?: number,
  currency: string = "USD"
): void {
  if (!isGTMAvailable()) return;

  const consent = getConsentPreferences();

  // Conversions require marketing consent
  if (!consent || !consent.marketing) {
    console.debug("Conversion not tracked: marketing consent not given");
    return;
  }

  try {
    window.gtag?.("event", "conversion", {
      send_to: `${conversionId}/${conversionLabel}`,
      value: value,
      currency: currency,
    } as Record<string, string>);
  } catch (error) {
    console.error("Failed to track conversion:", error);
  }
}

/**
 * Track user signup event
 *
 * @param method - Signup method (e.g., "google", "email", "apple")
 *
 * @example
 * trackSignup("google");
 */
export function trackSignup(method: string): void {
  trackEvent("sign_up", {
    method: method,
  });
}

/**
 * Track user login event
 *
 * @param method - Login method (e.g., "google", "email", "apple")
 */
export function trackLogin(method: string): void {
  trackEvent("login", {
    method: method,
  });
}

/**
 * Track purchase event (for premium subscriptions)
 *
 * @param transactionId - Unique transaction ID
 * @param value - Purchase value
 * @param currency - Currency code
 * @param items - Items purchased
 */
export function trackPurchase(
  transactionId: string,
  value: number,
  currency: string = "USD",
  items?: Array<{ item_name: string; item_id: string; price: number; quantity: number }>
): void {
  trackEvent("purchase", {
    transaction_id: transactionId,
    value: value,
    currency: currency,
    items: items,
  });
}

/**
 * Track when user starts a chat
 *
 * @param modelId - AI model used
 */
export function trackChatStart(modelId: string): void {
  trackEvent("chat_start", {
    model_id: modelId,
  });
}

/**
 * Track when user generates an image
 *
 * @param prompt - Image generation prompt
 */
export function trackImageGeneration(prompt: string): void {
  trackEvent("image_generation", {
    prompt_length: prompt.length,
  });
}

/**
 * Track when user searches
 *
 * @param query - Search query
 * @param resultsCount - Number of results (optional)
 */
export function trackSearch(query: string, resultsCount?: number): void {
  trackEvent("search", {
    search_term: query,
    results_count: resultsCount,
  });
}

/**
 * ============================================================================
 * INTEGRATION GUIDES
 * ============================================================================
 *
 * Below are instructions for integrating additional tracking services
 * when you're ready to add them. All integrations respect Consent Mode v2.
 */

/**
 * ----------------------------------------------------------------------------
 * GOOGLE ANALYTICS 4 (GA4) INTEGRATION
 * ----------------------------------------------------------------------------
 *
 * To add GA4 tracking:
 *
 * 1. Add GA4 tag to GTM:
 *    - In GTM, create a new tag: Google Analytics: GA4 Configuration
 *    - Set Measurement ID to your GA4 ID (e.g., G-XXXXXXXXXX)
 *    - Add trigger: All Pages
 *    - Add consent requirements: analytics_storage = granted
 *
 * 2. Set environment variable:
 *    NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
 *
 * 3. GA4 events will automatically flow through GTM and respect consent
 *
 * No code changes needed - all events above work with GA4 automatically!
 */

/**
 * ----------------------------------------------------------------------------
 * GOOGLE ADS CONVERSION TRACKING
 * ----------------------------------------------------------------------------
 *
 * To add Google Ads conversion tracking:
 *
 * 1. In Google Ads, create conversion actions and note the IDs
 *
 * 2. Add Google Ads Conversion Tracking tag to GTM:
 *    - Tag type: Google Ads Conversion Tracking
 *    - Conversion ID: AW-XXXXXXXXX
 *    - Conversion Label: varies per action
 *    - Consent requirements: ad_storage, ad_user_data, ad_personalization = granted
 *
 * 3. Use the trackConversion() function above:
 *    trackConversion("AW-123456789", "abc123", 29.99, "USD");
 *
 * 4. Set environment variable (optional):
 *    NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXX
 */

/**
 * ----------------------------------------------------------------------------
 * META PIXEL (FACEBOOK / INSTAGRAM) INTEGRATION
 * ----------------------------------------------------------------------------
 *
 * To add Meta Pixel tracking:
 *
 * 1. Add Meta Pixel tag to GTM:
 *    - Use Custom HTML tag
 *    - Add Meta Pixel base code
 *    - Trigger: All Pages
 *    - Consent requirements: ad_storage = granted
 *
 * 2. Set environment variable:
 *    NEXT_PUBLIC_META_PIXEL_ID=XXXXXXXXXXXXXXX
 *
 * 3. Add helper function for Meta events:
 *
 * export function trackMetaEvent(eventName: string, params?: Record<string, unknown>): void {
 *   if (typeof window !== "undefined" && typeof window.fbq === "function") {
 *     const consent = getConsentPreferences();
 *     if (!consent || !consent.marketing) return;
 *     window.fbq("track", eventName, params);
 *   }
 * }
 *
 * 4. Add TypeScript declaration:
 *
 * declare global {
 *   interface Window {
 *     fbq?: (action: string, event: string, params?: Record<string, unknown>) => void;
 *   }
 * }
 */

/**
 * ----------------------------------------------------------------------------
 * BING ADS UET (UNIVERSAL EVENT TRACKING)
 * ----------------------------------------------------------------------------
 *
 * To add Bing Ads UET:
 *
 * 1. Add Bing UET tag to GTM:
 *    - Use Custom HTML tag
 *    - Add UET tracking code
 *    - Trigger: All Pages
 *    - Consent requirements: ad_storage = granted
 *
 * 2. Set environment variable:
 *    NEXT_PUBLIC_BING_UET_ID=XXXXXXXX
 *
 * 3. Add helper function:
 *
 * export function trackBingEvent(action: string, params?: Record<string, unknown>): void {
 *   if (typeof window !== "undefined" && typeof window.uetq !== "undefined") {
 *     const consent = getConsentPreferences();
 *     if (!consent || !consent.marketing) return;
 *     window.uetq = window.uetq || [];
 *     window.uetq.push("event", action, params);
 *   }
 * }
 */

/**
 * ----------------------------------------------------------------------------
 * LINKEDIN INSIGHT TAG
 * ----------------------------------------------------------------------------
 *
 * To add LinkedIn Insight Tag:
 *
 * 1. Add LinkedIn tag to GTM:
 *    - Use Custom HTML tag
 *    - Add LinkedIn Insight Tag code
 *    - Partner ID: XXXXXXX
 *    - Trigger: All Pages
 *    - Consent requirements: ad_storage = granted
 *
 * 2. Set environment variable:
 *    NEXT_PUBLIC_LINKEDIN_PARTNER_ID=XXXXXXX
 */

/**
 * TypeScript declarations for global tracking objects
 */
declare global {
  interface Window {
    gtag?: (command: string, action: string, params?: Record<string, string>) => void;
    dataLayer?: unknown[];
    // Uncomment when adding these services:
    // fbq?: (action: string, event: string, params?: Record<string, unknown>) => void;
    // uetq?: unknown[];
  }
}
