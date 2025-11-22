import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const saveBiomechanicsAnalysis = mutation({
  args: {
    userId: v.id("userProfiles"),
    phoneNumber: v.string(),
    videoStorageId: v.id("_storage"),
    videoUrl: v.string(),
    exercise: v.string(),
    analysis: v.any(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const biomechanicsId = await ctx.db.insert("biomechanics", args);
    return biomechanicsId;
  },
});

export const getUserBiomechanics = query({
  args: {
    phoneNumber: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("biomechanics")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .order("desc");

    if (args.limit) {
      return await query.take(args.limit);
    }

    return await query.collect();
  },
});

export const getLatestBiomechanics = query({
  args: {
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("biomechanics")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .order("desc")
      .first();
  },
});

export const savePendingConfirmation = mutation({
  args: {
    phoneNumber: v.string(),
    detectedExercise: v.string(),
    videoUrl: v.string(),
    videoStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pendingBiomechanicsConfirmation")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    return await ctx.db.insert("pendingBiomechanicsConfirmation", {
      phoneNumber: args.phoneNumber,
      detectedExercise: args.detectedExercise,
      videoUrl: args.videoUrl,
      videoStorageId: args.videoStorageId,
      waitingForCorrectExercise: false,
      createdAt: Date.now(),
    });
  },
});

export const getPendingConfirmation = query({
  args: { phoneNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pendingBiomechanicsConfirmation")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .first();
  },
});

export const getPendingConfirmationWaitingCorrection = query({
  args: { phoneNumber: v.string() },
  handler: async (ctx, args) => {
    const pending = await ctx.db
      .query("pendingBiomechanicsConfirmation")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .first();

    return pending?.waitingForCorrectExercise ? pending : null;
  },
});

export const updatePendingConfirmation = mutation({
  args: {
    phoneNumber: v.string(),
    waitingForCorrectExercise: v.boolean(),
  },
  handler: async (ctx, args) => {
    const pending = await ctx.db
      .query("pendingBiomechanicsConfirmation")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .first();

    if (pending) {
      await ctx.db.patch(pending._id, {
        waitingForCorrectExercise: args.waitingForCorrectExercise,
      });
    }
  },
});

export const deletePendingConfirmation = mutation({
  args: { phoneNumber: v.string() },
  handler: async (ctx, args) => {
    const pending = await ctx.db
      .query("pendingBiomechanicsConfirmation")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .first();

    if (pending) {
      await ctx.db.delete(pending._id);
    }
  },
});
