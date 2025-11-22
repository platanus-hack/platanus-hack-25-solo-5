"use client";

// Nombres de cookies
const FIRST_TOUCH_COOKIE = "chattia_attr_ft";
const LAST_TOUCH_COOKIE = "chattia_attr_lt";
const CLICK_IDS_COOKIE = "chattia_attr_ids";

// Duración de cookies: 30 días
const COOKIE_MAX_AGE = 2592000; // 30 días en segundos

export interface UTMData {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referrer?: string;
  landingPage?: string;
  timestamp: number;
}

export interface ClickIDs {
  gclid?: string;
  fbclid?: string;
  ttclid?: string;
  msclkid?: string;
}

export interface StoredAttribution {
  firstTouch: UTMData | null;
  lastTouch: UTMData | null;
  clickIds: ClickIDs | null;
}

function getCookieDomain(): string {
  if (typeof window === "undefined") return "";

  const hostname = window.location.hostname;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "localhost";
  }

  if (hostname.includes("chattia.app")) {
    return ".chattia.app";
  }

  return hostname;
}

function isSecureContext(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.protocol === "https:";
}

export function hasMarketingConsent(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const consent = localStorage.getItem("cookie-consent-preferences");
    if (!consent) return false;

    const preferences = JSON.parse(consent);
    return preferences.marketing === true;
  } catch (error) {
    console.error("Failed to check marketing consent:", error);
    return false;
  }
}

function setCookie(name: string, value: string): void {
  if (typeof document === "undefined") return;

  const domain = getCookieDomain();
  const secure = isSecureContext();
  const maxAge = COOKIE_MAX_AGE;

  let cookieString = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;

  if (domain && domain !== "localhost") {
    cookieString += `; domain=${domain}`;
  }

  if (secure) {
    cookieString += "; Secure";
  }

  document.cookie = cookieString;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split("=");
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}

function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;

  const domain = getCookieDomain();

  let cookieString = `${name}=; path=/; max-age=0; SameSite=Lax`;
  if (domain && domain !== "localhost") {
    cookieString += `; domain=${domain}`;
  }
  document.cookie = cookieString;

  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function extractUTMsFromURL(url: string): Partial<UTMData> | null {
  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;

    const utmSource = params.get("utm_source");
    const utmMedium = params.get("utm_medium");
    const utmCampaign = params.get("utm_campaign");
    const utmContent = params.get("utm_content");
    const utmTerm = params.get("utm_term");

    if (!utmSource && !utmMedium && !utmCampaign && !utmContent && !utmTerm) {
      return null;
    }

    return {
      utmSource: utmSource || undefined,
      utmMedium: utmMedium || undefined,
      utmCampaign: utmCampaign || undefined,
      utmContent: utmContent || undefined,
      utmTerm: utmTerm || undefined,
      referrer: document.referrer || undefined,
      landingPage: url,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Error extracting UTMs from URL:", error);
    return null;
  }
}

export function extractClickIDs(url: string): ClickIDs | null {
  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;

    const gclid = params.get("gclid");
    const fbclid = params.get("fbclid");
    const ttclid = params.get("ttclid");
    const msclkid = params.get("msclkid");

    if (!gclid && !fbclid && !ttclid && !msclkid) {
      return null;
    }

    return {
      gclid: gclid || undefined,
      fbclid: fbclid || undefined,
      ttclid: ttclid || undefined,
      msclkid: msclkid || undefined,
    };
  } catch (error) {
    console.error("Error extracting click IDs from URL:", error);
    return null;
  }
}

export function saveFirstTouch(data: UTMData): void {
  if (!hasMarketingConsent()) {
    return;
  }

  try {
    const existing = getCookie(FIRST_TOUCH_COOKIE);
    if (!existing) {
      setCookie(FIRST_TOUCH_COOKIE, JSON.stringify(data));
    }
  } catch (error) {
    console.error("Failed to save first touch cookie:", error);
  }
}

export function saveLastTouch(data: UTMData): void {
  if (!hasMarketingConsent()) {
    return;
  }

  try {
    setCookie(LAST_TOUCH_COOKIE, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save last touch cookie:", error);
  }
}

export function saveClickIDs(ids: ClickIDs): void {
  if (!hasMarketingConsent()) {
    return;
  }

  try {
    const existing = getCookie(CLICK_IDS_COOKIE);
    const existingIDs = existing ? JSON.parse(existing) : {};

    const merged = {
      ...existingIDs,
      ...Object.fromEntries(
        Object.entries(ids).filter(([_, v]) => v !== undefined)
      ),
    };

    setCookie(CLICK_IDS_COOKIE, JSON.stringify(merged));
  } catch (error) {
    console.error("Failed to save click IDs cookie:", error);
  }
}

export function getStoredAttribution(): StoredAttribution {
  if (typeof window === "undefined") {
    return { firstTouch: null, lastTouch: null, clickIds: null };
  }

  try {
    const firstTouchStr = getCookie(FIRST_TOUCH_COOKIE);
    const lastTouchStr = getCookie(LAST_TOUCH_COOKIE);
    const clickIdsStr = getCookie(CLICK_IDS_COOKIE);

    return {
      firstTouch: firstTouchStr ? JSON.parse(firstTouchStr) : null,
      lastTouch: lastTouchStr ? JSON.parse(lastTouchStr) : null,
      clickIds: clickIdsStr ? JSON.parse(clickIdsStr) : null,
    };
  } catch (error) {
    console.error("Failed to get stored attribution:", error);
    return { firstTouch: null, lastTouch: null, clickIds: null };
  }
}

export function trackPageVisit(): void {
  if (typeof window === "undefined") return;

  if (!hasMarketingConsent()) {
    return;
  }

  const currentURL = window.location.href;

  const utms = extractUTMsFromURL(currentURL);
  if (utms) {
    saveFirstTouch(utms as UTMData);
    saveLastTouch(utms as UTMData);
  }

  const clickIds = extractClickIDs(currentURL);
  if (clickIds) {
    saveClickIDs(clickIds);
  }
}

export function clearAttribution(): void {
  if (typeof window === "undefined") return;

  try {
    deleteCookie(FIRST_TOUCH_COOKIE);
    deleteCookie(LAST_TOUCH_COOKIE);
    deleteCookie(CLICK_IDS_COOKIE);
  } catch (error) {
    console.error("Failed to clear attribution cookies:", error);
  }
}
