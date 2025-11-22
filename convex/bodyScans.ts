import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const saveBodyScanMutation = mutation({
  args: {
    userId: v.id("userProfiles"),
    phoneNumber: v.string(),
    imageStorageId: v.id("_storage"),
    imageUrl: v.string(),
    analysis: v.any(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const bodyScanId = await ctx.db.insert("bodyScans", args);
    return bodyScanId;
  },
});

export const getUserBodyScans = query({
  args: {
    phoneNumber: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("bodyScans")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .order("desc");

    if (args.limit) {
      return await query.take(args.limit);
    }

    return await query.collect();
  },
});

export const getLatestBodyScan = query({
  args: {
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bodyScans")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .order("desc")
      .first();
  },
});
