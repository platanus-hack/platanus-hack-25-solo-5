import { v } from "convex/values";

export type MessageType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "document"
  | "media"
  | "location"
  | "contact"
  | "button";

export interface TwilioMessage {
  SmsMessageSid: string;
  NumMedia: string;
  ProfileName: string;
  MessageType: MessageType;
  SmsSid: string;
  WaId: string;
  SmsStatus: string;
  Body: string;
  To: string;
  NumSegments: string;
  ReferralNumMedia: string;
  MessageSid: string;
  AccountSid: string;
  From: string;
  ApiVersion: string;
  MediaContentType0?: string; // Opcional para mensajes de imagen
  MediaUrl0?: string; // Opcional para mensajes de imagen
  conversationSid?: string; // Opcional para mensajes en conversaciones
  MediaConvexUrl?: string; // URL del archivo en Convex Storage
  // Location fields for WhatsApp location messages
  Latitude?: string; // GPS latitude coordinate from Twilio
  Longitude?: string; // GPS longitude coordinate from Twilio
  Address?: string; // Human-readable address from Twilio
}

// Create context custom type for TwilioMessage

export const twilioMessageConvexType = {
  SmsMessageSid: v.string(),
  NumMedia: v.string(),
  ProfileName: v.string(),
  MessageType: v.union(
    v.literal("text"),
    v.literal("image"),
    v.literal("video"),
    v.literal("audio"),
    v.literal("media"),
    v.literal("document"),
    v.literal("location"),
    v.literal("contact"),
    v.literal("button"),
  ),
  SmsSid: v.string(),
  WaId: v.string(),
  SmsStatus: v.string(),
  Body: v.string(),
  To: v.string(),
  From: v.string(),
  NumSegments: v.string(),
  ReferralNumMedia: v.string(),
  MessageSid: v.string(),
  AccountSid: v.string(),
  ApiVersion: v.string(),
  MediaContentType0: v.optional(v.string()), // Opcional para mensajes de imagen
  MediaUrl0: v.optional(v.string()), // Opcional para mensajes de imagen
  conversationSid: v.optional(v.string()), // Opcional para mensajes en conversaciones
  MediaConvexUrl: v.optional(v.string()), // URL del archivo en Convex Storage
  // Location fields for WhatsApp location messages
  Latitude: v.optional(v.string()), // GPS latitude coordinate from Twilio
  Longitude: v.optional(v.string()), // GPS longitude coordinate from Twilio
  Address: v.optional(v.string()), // Human-readable address from Twilio
};
