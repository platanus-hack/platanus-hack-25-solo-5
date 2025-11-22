import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateToken = mutation({
  args: {
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .first();

    if (!existingProfile) {
      const now = Date.now();
      await ctx.db.insert("userProfiles", {
        phoneNumber: args.phoneNumber,
        onboardingCompleted: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    const existingToken = await ctx.db
      .query("dashboardTokens")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .order("desc")
      .first();

    if (existingToken) {
      const now = Date.now();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;

      if (!existingToken.expiresAt || existingToken.expiresAt > now) {
        return existingToken.token;
      }
    }

    const token = crypto.randomUUID();
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    await ctx.db.insert("dashboardTokens", {
      token,
      phoneNumber: args.phoneNumber,
      createdAt: now,
      expiresAt: now + thirtyDays,
    });

    return token;
  },
});

export const validateToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const tokenRecord = await ctx.db
      .query("dashboardTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!tokenRecord) {
      return null;
    }

    if (tokenRecord.expiresAt && tokenRecord.expiresAt < Date.now()) {
      return null;
    }

    return {
      phoneNumber: tokenRecord.phoneNumber,
      isValid: true,
    };
  },
});

export const getUserByToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const tokenRecord = await ctx.db
      .query("dashboardTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!tokenRecord) {
      throw new Error("Invalid token");
    }

    if (tokenRecord.expiresAt && tokenRecord.expiresAt < Date.now()) {
      throw new Error("Token expired");
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", tokenRecord.phoneNumber))
      .first();

    if (!userProfile) {
      throw new Error("User not found");
    }

    return {
      phoneNumber: tokenRecord.phoneNumber,
      userProfile,
    };
  },
});
