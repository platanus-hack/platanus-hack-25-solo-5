import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { calculateOneRepMax } from "./personalRecords";

export const logExercisePerformance = mutation({
  args: {
    userId: v.id("userProfiles"),
    phoneNumber: v.string(),
    exerciseName: v.string(),
    normalizedName: v.string(),
    workoutSessionId: v.id("workoutSessions"),
    date: v.number(),
    sets: v.array(
      v.object({
        setNumber: v.optional(v.number()),
        reps: v.number(),
        weight: v.number(),
        rpe: v.optional(v.number()),
        notes: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    let maxOneRM = 0;
    let bestSetIndex = 0;
    let bestSetScore = 0;

    args.sets.forEach((set, index) => {
      const oneRM = calculateOneRepMax(set.weight, set.reps);
      if (oneRM > maxOneRM) {
        maxOneRM = oneRM;
      }

      const setScore = set.weight * set.reps;
      if (setScore > bestSetScore) {
        bestSetScore = setScore;
        bestSetIndex = index;
      }
    });

    const bestSet = args.sets[bestSetIndex];

    const totalVolume = args.sets.reduce(
      (sum, set) => sum + set.reps * set.weight,
      0
    );

    const setsWithRPE = args.sets.filter((set) => set.rpe !== undefined);
    const averageRPE =
      setsWithRPE.length > 0
        ? setsWithRPE.reduce((sum, set) => sum + (set.rpe || 0), 0) /
          setsWithRPE.length
        : undefined;

    const historyId = await ctx.db.insert("exerciseHistory", {
      userId: args.userId,
      phoneNumber: args.phoneNumber,
      exerciseName: args.exerciseName,
      normalizedName: args.normalizedName,
      workoutSessionId: args.workoutSessionId,
      date: args.date,
      bestSet: {
        reps: bestSet.reps,
        weight: bestSet.weight,
        estimatedOneRM: maxOneRM,
      },
      totalVolume,
      totalSets: args.sets.length,
      averageRPE,
      timestamp: now,
    });

    return historyId;
  },
});

export const getExerciseHistory = query({
  args: {
    userId: v.id("userProfiles"),
    normalizedName: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const history = await ctx.db
      .query("exerciseHistory")
      .withIndex("by_user_and_exercise", (q) =>
        q.eq("userId", args.userId).eq("normalizedName", args.normalizedName)
      )
      .order("desc")
      .take(limit);

    return history;
  },
});

export const getExerciseHistoryByPhone = query({
  args: {
    phoneNumber: v.string(),
    normalizedName: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const history = await ctx.db
      .query("exerciseHistory")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .filter((q) => q.eq(q.field("normalizedName"), args.normalizedName))
      .order("desc")
      .take(limit);

    return history;
  },
});

export const getExerciseHistoryByDateRange = query({
  args: {
    userId: v.id("userProfiles"),
    normalizedName: v.string(),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const history = await ctx.db
      .query("exerciseHistory")
      .withIndex("by_user_and_exercise", (q) =>
        q.eq("userId", args.userId).eq("normalizedName", args.normalizedName)
      )
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate)
        )
      )
      .order("desc")
      .collect();

    return history;
  },
});

export const getProgressSummary = query({
  args: {
    userId: v.id("userProfiles"),
    normalizedName: v.string(),
  },
  handler: async (ctx, args) => {
    const allHistory = await ctx.db
      .query("exerciseHistory")
      .withIndex("by_user_and_exercise", (q) =>
        q.eq("userId", args.userId).eq("normalizedName", args.normalizedName)
      )
      .order("desc")
      .collect();

    if (allHistory.length === 0) {
      return null;
    }

    const latest = allHistory[0];
    const earliest = allHistory[allHistory.length - 1];

    const oneRMImprovement =
      ((latest.bestSet.estimatedOneRM - earliest.bestSet.estimatedOneRM) /
        earliest.bestSet.estimatedOneRM) *
      100;

    const volumeImprovement =
      ((latest.totalVolume - earliest.totalVolume) / earliest.totalVolume) *
      100;

    const totalSessions = allHistory.length;

    const averageVolume =
      allHistory.reduce((sum, h) => sum + h.totalVolume, 0) / totalSessions;

    const maxVolume = Math.max(...allHistory.map((h) => h.totalVolume));
    const maxOneRM = Math.max(
      ...allHistory.map((h) => h.bestSet.estimatedOneRM)
    );

    return {
      exerciseName: latest.exerciseName,
      normalizedName: args.normalizedName,
      totalSessions,
      firstSession: earliest.date,
      lastSession: latest.date,
      current: {
        oneRM: latest.bestSet.estimatedOneRM,
        volume: latest.totalVolume,
        bestSet: latest.bestSet,
      },
      allTimeRecords: {
        maxOneRM,
        maxVolume,
      },
      improvement: {
        oneRM: oneRMImprovement,
        volume: volumeImprovement,
      },
      averageVolume,
    };
  },
});

export const getAllExercisesProgress = query({
  args: {
    userId: v.id("userProfiles"),
  },
  handler: async (ctx, args) => {
    const allHistory = await ctx.db
      .query("exerciseHistory")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    const exerciseGroups = allHistory.reduce(
      (acc, record) => {
        if (!acc[record.normalizedName]) {
          acc[record.normalizedName] = [];
        }
        acc[record.normalizedName].push(record);
        return acc;
      },
      {} as Record<string, Doc<"exerciseHistory">[]>
    );

    const summaries = Object.entries(exerciseGroups).map(
      ([normalizedName, records]) => {
        const latest = records[0];
        const earliest = records[records.length - 1];

        const oneRMImprovement =
          records.length > 1
            ? ((latest.bestSet.estimatedOneRM - earliest.bestSet.estimatedOneRM) /
                earliest.bestSet.estimatedOneRM) *
              100
            : 0;

        return {
          exerciseName: latest.exerciseName,
          normalizedName,
          totalSessions: records.length,
          lastSession: latest.date,
          currentOneRM: latest.bestSet.estimatedOneRM,
          improvement: oneRMImprovement,
        };
      }
    );

    return summaries.sort((a, b) => b.lastSession - a.lastSession);
  },
});

export const comparePerformance = query({
  args: {
    userId: v.id("userProfiles"),
    normalizedName: v.string(),
    sessionId1: v.id("workoutSessions"),
    sessionId2: v.id("workoutSessions"),
  },
  handler: async (ctx, args) => {
    const performance1 = await ctx.db
      .query("exerciseHistory")
      .withIndex("by_user_and_exercise", (q) =>
        q.eq("userId", args.userId).eq("normalizedName", args.normalizedName)
      )
      .filter((q) => q.eq(q.field("workoutSessionId"), args.sessionId1))
      .first();

    const performance2 = await ctx.db
      .query("exerciseHistory")
      .withIndex("by_user_and_exercise", (q) =>
        q.eq("userId", args.userId).eq("normalizedName", args.normalizedName)
      )
      .filter((q) => q.eq(q.field("workoutSessionId"), args.sessionId2))
      .first();

    if (!performance1 || !performance2) {
      return null;
    }

    const oneRMDiff =
      performance2.bestSet.estimatedOneRM - performance1.bestSet.estimatedOneRM;
    const volumeDiff = performance2.totalVolume - performance1.totalVolume;

    return {
      session1: performance1,
      session2: performance2,
      comparison: {
        oneRMDifference: oneRMDiff,
        oneRMPercentChange:
          (oneRMDiff / performance1.bestSet.estimatedOneRM) * 100,
        volumeDifference: volumeDiff,
        volumePercentChange: (volumeDiff / performance1.totalVolume) * 100,
      },
    };
  },
});
