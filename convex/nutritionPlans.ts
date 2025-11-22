import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const saveNutritionPlanMutation = mutation({
  args: {
    userId: v.id("userProfiles"),
    phoneNumber: v.string(),
    basedOnScan: v.id("bodyScans"),
    basedOnTrainingPlan: v.optional(v.id("trainingPlans")),
    goal: v.string(),
    macrosTrainingDays: v.object({
      calories: v.number(),
      protein: v.number(),
      carbs: v.number(),
      fats: v.number(),
    }),
    macrosRestDays: v.object({
      calories: v.number(),
      protein: v.number(),
      carbs: v.number(),
      fats: v.number(),
    }),
    mealExamples: v.any(),
    culturalContext: v.string(),
    rationale: v.string(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const nutritionPlanId = await ctx.db.insert("nutritionPlans", args);
    return nutritionPlanId;
  },
});

export const getUserNutritionPlans = query({
  args: {
    phoneNumber: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("nutritionPlans")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .order("desc");

    if (args.limit) {
      return await query.take(args.limit);
    }

    return await query.collect();
  },
});

export const getLatestNutritionPlan = query({
  args: {
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("nutritionPlans")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .order("desc")
      .first();
  },
});

export const getNutritionPlanById = query({
  args: {
    planId: v.id("nutritionPlans"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.planId);
  },
});
