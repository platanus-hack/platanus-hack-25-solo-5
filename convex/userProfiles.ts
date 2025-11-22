import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserProfile = query({
  args: {
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .first();

    return profile;
  },
});

export const updateUserProfile = mutation({
  args: {
    phoneNumber: v.string(),
    age: v.optional(v.number()),
    sex: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("other"))),
    weight: v.optional(v.number()),
    height: v.optional(v.number()),
    goal: v.optional(v.string()),
    experience: v.optional(v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced"))),
    equipment: v.optional(v.array(v.string())),
    trainingDaysPerWeek: v.optional(v.number()),
    onboardingCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { phoneNumber, ...updates } = args;

    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", phoneNumber))
      .first();

    const now = Date.now();

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, {
        ...updates,
        updatedAt: now,
      });

      return {
        success: true,
        message: "Profile updated successfully",
        profileId: existingProfile._id,
      };
    } else {
      const profileId = await ctx.db.insert("userProfiles", {
        phoneNumber,
        ...updates,
        onboardingCompleted: updates.onboardingCompleted ?? false,
        createdAt: now,
        updatedAt: now,
      });

      return {
        success: true,
        message: "Profile created successfully",
        profileId,
      };
    }
  },
});

export const updateLastImage = mutation({
  args: {
    phoneNumber: v.string(),
    imageUrl: v.string(),
    imageStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .first();

    const now = Date.now();

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, {
        lastImageUrl: args.imageUrl,
        lastImageStorageId: args.imageStorageId,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("userProfiles", {
        phoneNumber: args.phoneNumber,
        onboardingCompleted: false,
        lastImageUrl: args.imageUrl,
        lastImageStorageId: args.imageStorageId,
        createdAt: now,
        updatedAt: now,
      });
    }

    return {
      success: true,
      message: "Last image updated",
    };
  },
});

export const updateLastVideo = mutation({
  args: {
    phoneNumber: v.string(),
    videoUrl: v.string(),
    videoStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .first();

    const now = Date.now();

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, {
        lastVideoUrl: args.videoUrl,
        lastVideoStorageId: args.videoStorageId,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("userProfiles", {
        phoneNumber: args.phoneNumber,
        onboardingCompleted: false,
        lastVideoUrl: args.videoUrl,
        lastVideoStorageId: args.videoStorageId,
        createdAt: now,
        updatedAt: now,
      });
    }

    return {
      success: true,
      message: "Last video updated",
    };
  },
});

export const checkOnboardingComplete = query({
  args: {
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .first();

    if (!profile) {
      return {
        complete: false,
        missingFields: ["all"],
        message: "No profile found - onboarding needed",
      };
    }

    const requiredFields = [
      "age",
      "sex",
      "weight",
      "height",
      "goal",
      "experience",
      "equipment",
      "trainingDaysPerWeek",
    ];

    const missingFields = requiredFields.filter(
      (field) => !profile[field as keyof typeof profile]
    );

    const complete = missingFields.length === 0 && profile.onboardingCompleted;

    return {
      complete,
      missingFields,
      message: complete
        ? "Onboarding complete"
        : `Missing: ${missingFields.join(", ")}`,
    };
  },
});
