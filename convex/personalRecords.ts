import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export function calculateOneRepMax(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

function calculateBestSet(sets: Array<{ reps: number; weight: number }>): {
  reps: number;
  weight: number;
  score: number;
} {
  let bestSet = sets[0];
  let bestScore = sets[0].weight * sets[0].reps;

  for (const set of sets) {
    const score = set.weight * set.reps;
    if (score > bestScore) {
      bestScore = score;
      bestSet = set;
    }
  }

  return { ...bestSet, score: bestScore };
}

export const checkAndUpdatePRs = mutation({
  args: {
    userId: v.id("userProfiles"),
    phoneNumber: v.string(),
    workoutSessionId: v.id("workoutSessions"),
    exerciseName: v.string(),
    normalizedName: v.string(),
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
    const newPRs: Array<{
      type: string;
      value: number;
      previousValue?: number;
      improvement?: number;
    }> = [];

    const oneRepMax = Math.max(
      ...args.sets.map((set) => calculateOneRepMax(set.weight, set.reps))
    );

    const existingOneRMRecord = await ctx.db
      .query("personalRecords")
      .withIndex("by_user_and_exercise", (q) =>
        q.eq("userId", args.userId).eq("normalizedName", args.normalizedName)
      )
      .filter((q) => q.eq(q.field("recordType"), "one_rep_max"))
      .first();

    if (!existingOneRMRecord || oneRepMax > existingOneRMRecord.value) {
      const previousValue = existingOneRMRecord?.value;
      const improvement = previousValue
        ? ((oneRepMax - previousValue) / previousValue) * 100
        : undefined;

      await ctx.db.insert("personalRecords", {
        userId: args.userId,
        phoneNumber: args.phoneNumber,
        exerciseName: args.exerciseName,
        normalizedName: args.normalizedName,
        recordType: "one_rep_max",
        value: oneRepMax,
        reps: 1,
        weight: oneRepMax,
        workoutSessionId: args.workoutSessionId,
        previousRecord: previousValue,
        improvementPercentage: improvement,
        achievedAt: now,
        createdAt: now,
      });

      newPRs.push({
        type: "1RM",
        value: oneRepMax,
        previousValue,
        improvement,
      });
    }

    const maxRepsSet = args.sets.reduce((max, set) =>
      set.reps > max.reps ? set : max
    );

    const existingMaxRepsRecord = await ctx.db
      .query("personalRecords")
      .withIndex("by_user_and_exercise", (q) =>
        q.eq("userId", args.userId).eq("normalizedName", args.normalizedName)
      )
      .filter((q) => q.eq(q.field("recordType"), "max_reps"))
      .first();

    const maxRepsValue = maxRepsSet.reps;
    const shouldUpdateMaxReps =
      !existingMaxRepsRecord ||
      maxRepsSet.reps > (existingMaxRepsRecord.reps || 0) ||
      (maxRepsSet.reps === (existingMaxRepsRecord.reps || 0) &&
        maxRepsSet.weight > (existingMaxRepsRecord.weight || 0));

    if (shouldUpdateMaxReps) {
      const previousValue = existingMaxRepsRecord?.reps;
      const improvement = previousValue
        ? ((maxRepsSet.reps - previousValue) / previousValue) * 100
        : undefined;

      await ctx.db.insert("personalRecords", {
        userId: args.userId,
        phoneNumber: args.phoneNumber,
        exerciseName: args.exerciseName,
        normalizedName: args.normalizedName,
        recordType: "max_reps",
        value: maxRepsSet.reps,
        reps: maxRepsSet.reps,
        weight: maxRepsSet.weight,
        workoutSessionId: args.workoutSessionId,
        previousRecord: previousValue,
        improvementPercentage: improvement,
        achievedAt: now,
        createdAt: now,
      });

      newPRs.push({
        type: "Max Reps",
        value: maxRepsSet.reps,
        previousValue,
        improvement,
      });
    }

    const totalVolume = args.sets.reduce(
      (sum, set) => sum + set.reps * set.weight,
      0
    );

    const existingVolumeRecord = await ctx.db
      .query("personalRecords")
      .withIndex("by_user_and_exercise", (q) =>
        q.eq("userId", args.userId).eq("normalizedName", args.normalizedName)
      )
      .filter((q) => q.eq(q.field("recordType"), "max_volume"))
      .first();

    if (!existingVolumeRecord || totalVolume > existingVolumeRecord.value) {
      const previousValue = existingVolumeRecord?.value;
      const improvement = previousValue
        ? ((totalVolume - previousValue) / previousValue) * 100
        : undefined;

      await ctx.db.insert("personalRecords", {
        userId: args.userId,
        phoneNumber: args.phoneNumber,
        exerciseName: args.exerciseName,
        normalizedName: args.normalizedName,
        recordType: "max_volume",
        value: totalVolume,
        workoutSessionId: args.workoutSessionId,
        previousRecord: previousValue,
        improvementPercentage: improvement,
        achievedAt: now,
        createdAt: now,
      });

      newPRs.push({
        type: "Volumen Total",
        value: totalVolume,
        previousValue,
        improvement,
      });
    }

    const bestSet = calculateBestSet(args.sets);

    const existingBestSetRecord = await ctx.db
      .query("personalRecords")
      .withIndex("by_user_and_exercise", (q) =>
        q.eq("userId", args.userId).eq("normalizedName", args.normalizedName)
      )
      .filter((q) => q.eq(q.field("recordType"), "best_set"))
      .first();

    if (!existingBestSetRecord || bestSet.score > existingBestSetRecord.value) {
      const previousValue = existingBestSetRecord?.value;
      const improvement = previousValue
        ? ((bestSet.score - previousValue) / previousValue) * 100
        : undefined;

      await ctx.db.insert("personalRecords", {
        userId: args.userId,
        phoneNumber: args.phoneNumber,
        exerciseName: args.exerciseName,
        normalizedName: args.normalizedName,
        recordType: "best_set",
        value: bestSet.score,
        reps: bestSet.reps,
        weight: bestSet.weight,
        workoutSessionId: args.workoutSessionId,
        previousRecord: previousValue,
        improvementPercentage: improvement,
        achievedAt: now,
        createdAt: now,
      });

      newPRs.push({
        type: "Best Set",
        value: bestSet.score,
        previousValue,
        improvement,
      });
    }

    return {
      hasNewPRs: newPRs.length > 0,
      newPRs,
    };
  },
});

export const getUserPRs = query({
  args: {
    userId: v.id("userProfiles"),
  },
  handler: async (ctx, args) => {
    const allPRs = await ctx.db
      .query("personalRecords")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    const prsByExercise = allPRs.reduce(
      (acc, pr) => {
        if (!acc[pr.normalizedName]) {
          acc[pr.normalizedName] = {
            exerciseName: pr.exerciseName,
            normalizedName: pr.normalizedName,
            records: {},
          };
        }

        if (
          !acc[pr.normalizedName].records[pr.recordType] ||
          pr.achievedAt >
            acc[pr.normalizedName].records[pr.recordType].achievedAt
        ) {
          acc[pr.normalizedName].records[pr.recordType] = pr;
        }

        return acc;
      },
      {} as Record<
        string,
        {
          exerciseName: string;
          normalizedName: string;
          records: Record<string, Doc<"personalRecords">>;
        }
      >
    );

    return Object.values(prsByExercise);
  },
});

export const getUserPRsByPhone = query({
  args: {
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const allPRs = await ctx.db
      .query("personalRecords")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .order("desc")
      .collect();

    const prsByExercise = allPRs.reduce(
      (acc, pr) => {
        if (!acc[pr.normalizedName]) {
          acc[pr.normalizedName] = {
            exerciseName: pr.exerciseName,
            normalizedName: pr.normalizedName,
            records: {},
          };
        }

        if (
          !acc[pr.normalizedName].records[pr.recordType] ||
          pr.achievedAt >
            acc[pr.normalizedName].records[pr.recordType].achievedAt
        ) {
          acc[pr.normalizedName].records[pr.recordType] = pr;
        }

        return acc;
      },
      {} as Record<
        string,
        {
          exerciseName: string;
          normalizedName: string;
          records: Record<string, Doc<"personalRecords">>;
        }
      >
    );

    return Object.values(prsByExercise);
  },
});

export const getPRByExercise = query({
  args: {
    userId: v.id("userProfiles"),
    normalizedName: v.string(),
  },
  handler: async (ctx, args) => {
    const prs = await ctx.db
      .query("personalRecords")
      .withIndex("by_user_and_exercise", (q) =>
        q.eq("userId", args.userId).eq("normalizedName", args.normalizedName)
      )
      .order("desc")
      .collect();

    const latestPRs: Record<string, Doc<"personalRecords">> = {};

    for (const pr of prs) {
      if (
        !latestPRs[pr.recordType] ||
        pr.achievedAt > latestPRs[pr.recordType].achievedAt
      ) {
        latestPRs[pr.recordType] = pr;
      }
    }

    return {
      exerciseName: prs[0]?.exerciseName,
      normalizedName: args.normalizedName,
      records: latestPRs,
      history: prs,
    };
  },
});

export const getPRHistory = query({
  args: {
    userId: v.id("userProfiles"),
    normalizedName: v.string(),
    recordType: v.union(
      v.literal("one_rep_max"),
      v.literal("max_reps"),
      v.literal("max_volume"),
      v.literal("best_set")
    ),
  },
  handler: async (ctx, args) => {
    const history = await ctx.db
      .query("personalRecords")
      .withIndex("by_user_and_exercise", (q) =>
        q.eq("userId", args.userId).eq("normalizedName", args.normalizedName)
      )
      .filter((q) => q.eq(q.field("recordType"), args.recordType))
      .order("desc")
      .collect();

    return history;
  },
});

export const getRecentPRs = query({
  args: {
    userId: v.id("userProfiles"),
    days: v.number(),
  },
  handler: async (ctx, args) => {
    const cutoffDate = Date.now() - args.days * 24 * 60 * 60 * 1000;

    const recentPRs = await ctx.db
      .query("personalRecords")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("achievedAt"), cutoffDate))
      .order("desc")
      .collect();

    return recentPRs;
  },
});
