import { v } from "convex/values";
import { query } from "./_generated/server";

export const getDashboardOverview = query({
  args: {
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .first();

    if (!userProfile) {
      throw new Error("User not found");
    }

    const latestBodyScan = await ctx.db
      .query("bodyScans")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .order("desc")
      .first();

    const latestTrainingPlan = await ctx.db
      .query("trainingPlans")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .order("desc")
      .first();

    const latestNutritionPlan = await ctx.db
      .query("nutritionPlans")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .order("desc")
      .first();

    const latestPrediction = await ctx.db
      .query("predictions")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .order("desc")
      .first();

    const recentWorkouts = await ctx.db
      .query("workoutSessions")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .order("desc")
      .take(5);

    const recentPRs = await ctx.db
      .query("personalRecords")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .order("desc")
      .take(5);

    const allWorkouts = await ctx.db
      .query("workoutSessions")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .collect();

    const allPRs = await ctx.db
      .query("personalRecords")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .collect();

    const allScans = await ctx.db
      .query("bodyScans")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .collect();

    const allPlans = await ctx.db
      .query("trainingPlans")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .collect();

    const allBodyScans = await ctx.db
      .query("bodyScans")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .order("desc")
      .collect();

    return {
      userProfile,
      latestBodyScan,
      latestTrainingPlan,
      latestNutritionPlan,
      latestPrediction,
      recentWorkouts,
      recentPRs,
      stats: {
        totalWorkouts: allWorkouts.length,
        totalPRs: allPRs.length,
        totalScans: allScans.length,
        totalPlans: allPlans.length,
      },
      bodyScansHistory: allBodyScans,
    };
  },
});
