import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const savePredictionMutation = mutation({
  args: {
    userId: v.id("userProfiles"),
    phoneNumber: v.string(),
    basedOnScans: v.array(v.id("bodyScans")),
    basedOnBiomech: v.array(v.id("biomechanics")),
    timeframe: v.number(),
    predictions: v.object({
      bodyfatChange: v.object({
        min: v.number(),
        max: v.number(),
      }),
      muscularChanges: v.string(),
      strengthProgress: v.string(),
      postureProgress: v.string(),
      aestheticBalance: v.string(),
    }),
    assumptions: v.array(v.string()),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const predictionId = await ctx.db.insert("predictions", args);
    return predictionId;
  },
});

export const getUserPredictions = query({
  args: {
    phoneNumber: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("predictions")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .order("desc");

    if (args.limit) {
      return await query.take(args.limit);
    }

    return await query.collect();
  },
});

export const getLatestPrediction = query({
  args: {
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("predictions")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .order("desc")
      .first();
  },
});
