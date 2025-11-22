import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  phoneThreadMappings: defineTable({
    from: v.string(),
    to: v.string(),
    threadId: v.string(),
    createdAt: v.number(),
  }).index("by_phone_pair", ["from", "to"]),

  userProfiles: defineTable({
    phoneNumber: v.string(),
    age: v.optional(v.number()),
    sex: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("other"))),
    weight: v.optional(v.number()),
    height: v.optional(v.number()),
    goal: v.optional(v.string()),
    experience: v.optional(v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced"))),
    equipment: v.optional(v.array(v.string())),
    trainingDaysPerWeek: v.optional(v.number()),
    onboardingCompleted: v.boolean(),
    lastImageUrl: v.optional(v.string()),
    lastImageStorageId: v.optional(v.id("_storage")),
    lastVideoUrl: v.optional(v.string()),
    lastVideoStorageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_phone", ["phoneNumber"])
    .index("by_onboarding", ["onboardingCompleted"]),

  bodyScans: defineTable({
    userId: v.id("userProfiles"),
    phoneNumber: v.string(),
    imageStorageId: v.id("_storage"),
    imageUrl: v.string(),
    analysis: v.object({
      bodyfatPercentage: v.object({
        min: v.number(),
        max: v.number(),
      }),
      measurements: v.object({
        chest: v.optional(v.object({ min: v.number(), max: v.number() })),
        waist: v.optional(v.object({ min: v.number(), max: v.number() })),
        hips: v.optional(v.object({ min: v.number(), max: v.number() })),
        shoulders: v.optional(v.object({ min: v.number(), max: v.number() })),
        arms: v.optional(v.object({ min: v.number(), max: v.number() })),
        thighs: v.optional(v.object({ min: v.number(), max: v.number() })),
        calves: v.optional(v.object({ min: v.number(), max: v.number() })),
      }),
      physiqueType: v.string(),
      strengths: v.array(v.string()),
      opportunities: v.array(v.string()),
    }),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_phone", ["phoneNumber"])
    .index("by_timestamp", ["timestamp"]),

  trainingPlans: defineTable({
    userId: v.id("userProfiles"),
    phoneNumber: v.string(),
    startDate: v.number(),
    duration: v.number(),
    daysPerWeek: v.number(),
    goal: v.string(),
    weeks: v.array(
      v.object({
        weekNumber: v.number(),
        days: v.array(
          v.object({
            dayNumber: v.number(),
            focus: v.string(),
            exercises: v.array(
              v.object({
                name: v.string(),
                sets: v.number(),
                reps: v.string(),
                rest: v.string(),
                rpe: v.optional(v.string()),
                notes: v.optional(v.string()),
              })
            ),
          })
        ),
      })
    ),
    rationale: v.string(),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_phone", ["phoneNumber"])
    .index("by_timestamp", ["timestamp"]),

  biomechanics: defineTable({
    userId: v.id("userProfiles"),
    phoneNumber: v.string(),
    videoStorageId: v.id("_storage"),
    videoUrl: v.string(),
    exercise: v.string(),
    analysis: v.object({
      strengths: v.array(v.string()),
      corrections: v.array(v.string()),
      regressions: v.array(v.string()),
      progressions: v.array(v.string()),
      riskFactors: v.array(v.string()),
    }),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_phone", ["phoneNumber"])
    .index("by_timestamp", ["timestamp"]),

  pendingBiomechanicsConfirmation: defineTable({
    phoneNumber: v.string(),
    detectedExercise: v.string(),
    videoUrl: v.string(),
    videoStorageId: v.id("_storage"),
    waitingForCorrectExercise: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_phone", ["phoneNumber"]),

  predictions: defineTable({
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
  })
    .index("by_user", ["userId"])
    .index("by_phone", ["phoneNumber"])
    .index("by_timestamp", ["timestamp"]),

  nutritionPlans: defineTable({
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
    mealExamples: v.array(
      v.object({
        dayType: v.union(v.literal("training"), v.literal("rest")),
        meals: v.array(
          v.object({
            mealTime: v.string(),
            foods: v.array(v.string()),
            macros: v.object({
              protein: v.number(),
              carbs: v.number(),
              fats: v.number(),
              calories: v.number(),
            }),
          })
        ),
      })
    ),
    culturalContext: v.string(),
    rationale: v.string(),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_phone", ["phoneNumber"])
    .index("by_timestamp", ["timestamp"]),

  workoutSessions: defineTable({
    userId: v.id("userProfiles"),
    phoneNumber: v.string(),
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
    completedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_phone", ["phoneNumber"])
    .index("by_date", ["date"])
    .index("by_user_and_date", ["userId", "date"]),

  personalRecords: defineTable({
    userId: v.id("userProfiles"),
    phoneNumber: v.string(),
    exerciseName: v.string(),
    normalizedName: v.string(),
    recordType: v.union(
      v.literal("one_rep_max"),
      v.literal("max_reps"),
      v.literal("max_volume"),
      v.literal("best_set")
    ),
    value: v.number(),
    reps: v.optional(v.number()),
    weight: v.optional(v.number()),
    workoutSessionId: v.id("workoutSessions"),
    previousRecord: v.optional(v.number()),
    improvementPercentage: v.optional(v.number()),
    achievedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_phone", ["phoneNumber"])
    .index("by_exercise", ["normalizedName"])
    .index("by_user_and_exercise", ["userId", "normalizedName"])
    .index("by_record_type", ["recordType"])
    .index("by_achieved_at", ["achievedAt"]),

  exerciseHistory: defineTable({
    userId: v.id("userProfiles"),
    phoneNumber: v.string(),
    exerciseName: v.string(),
    normalizedName: v.string(),
    workoutSessionId: v.id("workoutSessions"),
    date: v.number(),
    bestSet: v.object({
      reps: v.number(),
      weight: v.number(),
      estimatedOneRM: v.number(),
    }),
    totalVolume: v.number(),
    totalSets: v.number(),
    averageRPE: v.optional(v.number()),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_phone", ["phoneNumber"])
    .index("by_user_and_exercise", ["userId", "normalizedName"])
    .index("by_date", ["date"])
    .index("by_exercise_and_date", ["normalizedName", "date"]),

  dashboardTokens: defineTable({
    token: v.string(),
    phoneNumber: v.string(),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_token", ["token"])
    .index("by_phone", ["phoneNumber"]),

  adminChatMessages: defineTable({
    threadId: v.string(),
    phoneNumber: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    timestamp: v.number(),
  })
    .index("by_thread", ["threadId"])
    .index("by_thread_and_time", ["threadId", "timestamp"])
    .index("by_phone", ["phoneNumber"]),
});
