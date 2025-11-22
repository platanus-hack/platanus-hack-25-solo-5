import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const logWorkoutSession = mutation({
  args: {
    phoneNumber: v.string(),
    userId: v.id("userProfiles"),
    trainingPlanId: v.optional(v.id("trainingPlans")),
    weekNumber: v.optional(v.number()),
    dayNumber: v.optional(v.number()),
    date: v.number(),
    exercises: v.array(
      v.object({
        exerciseId: v.optional(v.string()),
        name: v.string(),
        normalizedName: v.string(),
        sets: v.array(
          v.object({
            setNumber: v.number(),
            reps: v.number(),
            weight: v.number(),
            rpe: v.optional(v.number()),
            notes: v.optional(v.string()),
          })
        ),
        targetSets: v.optional(v.number()),
        targetReps: v.optional(v.string()),
      })
    ),
    duration: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const workoutSessionId = await ctx.db.insert("workoutSessions", {
      userId: args.userId,
      phoneNumber: args.phoneNumber,
      trainingPlanId: args.trainingPlanId,
      weekNumber: args.weekNumber,
      dayNumber: args.dayNumber,
      date: args.date,
      exercises: args.exercises,
      duration: args.duration,
      notes: args.notes,
      completedAt: now,
      createdAt: now,
    });

    return workoutSessionId;
  },
});

export const getUserWorkoutSessions = query({
  args: {
    userId: v.id("userProfiles"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    const sessions = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    return sessions;
  },
});

export const getUserWorkoutSessionsByPhone = query({
  args: {
    phoneNumber: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    const sessions = await ctx.db
      .query("workoutSessions")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .order("desc")
      .take(limit);

    return sessions;
  },
});

export const getWorkoutSessionById = query({
  args: {
    sessionId: v.id("workoutSessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    return session;
  },
});

export const getRecentWorkouts = query({
  args: {
    userId: v.id("userProfiles"),
    days: v.number(),
  },
  handler: async (ctx, args) => {
    const cutoffDate = Date.now() - args.days * 24 * 60 * 60 * 1000;

    const sessions = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", args.userId).gte("date", cutoffDate)
      )
      .order("desc")
      .collect();

    return sessions;
  },
});

export const getWorkoutsByDateRange = query({
  args: {
    userId: v.id("userProfiles"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", args.userId).gte("date", args.startDate)
      )
      .filter((q) => q.lte(q.field("date"), args.endDate))
      .order("desc")
      .collect();

    return sessions;
  },
});

export const updateWorkoutSession = mutation({
  args: {
    sessionId: v.id("workoutSessions"),
    exercises: v.optional(
      v.array(
        v.object({
          exerciseId: v.optional(v.string()),
          name: v.string(),
          normalizedName: v.string(),
          sets: v.array(
            v.object({
              setNumber: v.number(),
              reps: v.number(),
              weight: v.number(),
              rpe: v.optional(v.number()),
              notes: v.optional(v.string()),
            })
          ),
          targetSets: v.optional(v.number()),
          targetReps: v.optional(v.string()),
        })
      )
    ),
    duration: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { sessionId, ...updates } = args;

    await ctx.db.patch(sessionId, updates);

    return sessionId;
  },
});

export const deleteWorkoutSession = mutation({
  args: {
    sessionId: v.id("workoutSessions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.sessionId);
    return { success: true };
  },
});

export const getWorkoutStats = query({
  args: {
    userId: v.id("userProfiles"),
    days: v.number(),
  },
  handler: async (ctx, args) => {
    const cutoffDate = Date.now() - args.days * 24 * 60 * 60 * 1000;

    const sessions = await ctx.db
      .query("workoutSessions")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", args.userId).gte("date", cutoffDate)
      )
      .collect();

    const totalWorkouts = sessions.length;
    const totalExercises = sessions.reduce(
      (sum, session) => sum + session.exercises.length,
      0
    );
    const totalSets = sessions.reduce(
      (sum, session) =>
        sum +
        session.exercises.reduce(
          (exerciseSum, exercise) => exerciseSum + exercise.sets.length,
          0
        ),
      0
    );
    const totalVolume = sessions.reduce(
      (sum, session) =>
        sum +
        session.exercises.reduce(
          (exerciseSum, exercise) =>
            exerciseSum +
            exercise.sets.reduce(
              (setSum, set) => setSum + set.reps * set.weight,
              0
            ),
          0
        ),
      0
    );
    const averageDuration =
      sessions.filter((s) => s.duration).reduce((sum, s) => sum + (s.duration || 0), 0) /
      sessions.filter((s) => s.duration).length || 0;

    return {
      totalWorkouts,
      totalExercises,
      totalSets,
      totalVolume,
      averageDuration,
      period: args.days,
    };
  },
});
