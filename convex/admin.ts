import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const saveAdminMessage = mutation({
  args: {
    threadId: v.string(),
    phoneNumber: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
  },
  handler: async (ctx, { threadId, phoneNumber, role, content }) => {
    await ctx.db.insert("adminChatMessages", {
      threadId,
      phoneNumber,
      role,
      content,
      timestamp: Date.now(),
    });
  },
});

export const getAllThreads = query({
  args: {},
  handler: async (ctx) => {
    const mappings = await ctx.db
      .query("phoneThreadMappings")
      .order("desc")
      .collect();

    const threadsWithData = await Promise.all(
      mappings.map(async (mapping) => {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_phone", (q) => q.eq("phoneNumber", mapping.from))
          .first();

        const threadMessages = await ctx.db
          .query("adminChatMessages")
          .withIndex("by_thread", (q) => q.eq("threadId", mapping.threadId))
          .collect();

        const lastMessage = threadMessages[threadMessages.length - 1];

        return {
          threadId: mapping.threadId,
          from: mapping.from,
          to: mapping.to,
          createdAt: mapping.createdAt,
          userName: profile?.phoneNumber || mapping.from,
          messageCount: threadMessages.length,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                timestamp: lastMessage.timestamp,
                role: lastMessage.role,
              }
            : null,
        };
      })
    );

    return threadsWithData.sort((a, b) => {
      const aTime = a.lastMessage?.timestamp || a.createdAt;
      const bTime = b.lastMessage?.timestamp || b.createdAt;
      return bTime - aTime;
    });
  },
});

export const getThreadMessages = query({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, { threadId }) => {
    const messages = await ctx.db
      .query("adminChatMessages")
      .withIndex("by_thread_and_time", (q) => q.eq("threadId", threadId))
      .collect();

    const mapping = await ctx.db
      .query("phoneThreadMappings")
      .filter((q) => q.eq(q.field("threadId"), threadId))
      .first();

    const profile = mapping
      ? await ctx.db
          .query("userProfiles")
          .withIndex("by_phone", (q) => q.eq("phoneNumber", mapping.from))
          .first()
      : null;

    return {
      threadId,
      phoneNumber: mapping?.from,
      userName: profile?.phoneNumber || mapping?.from,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
    };
  },
});

export const deleteUserCompletely = mutation({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, { threadId }) => {
    const mapping = await ctx.db
      .query("phoneThreadMappings")
      .filter((q) => q.eq(q.field("threadId"), threadId))
      .first();

    if (!mapping) {
      throw new Error("Thread mapping not found");
    }

    const phoneNumber = mapping.from;

    const adminMessages = await ctx.db
      .query("adminChatMessages")
      .withIndex("by_thread", (q) => q.eq("threadId", threadId))
      .collect();
    for (const message of adminMessages) {
      await ctx.db.delete(message._id);
    }

    const bodyScans = await ctx.db
      .query("bodyScans")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", phoneNumber))
      .collect();
    for (const scan of bodyScans) {
      if (scan.imageStorageId) {
        await ctx.storage.delete(scan.imageStorageId);
      }
      await ctx.db.delete(scan._id);
    }

    const biomechanics = await ctx.db
      .query("biomechanics")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", phoneNumber))
      .collect();
    for (const biomech of biomechanics) {
      if (biomech.videoStorageId) {
        await ctx.storage.delete(biomech.videoStorageId);
      }
      await ctx.db.delete(biomech._id);
    }

    const trainingPlans = await ctx.db
      .query("trainingPlans")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", phoneNumber))
      .collect();
    for (const plan of trainingPlans) {
      await ctx.db.delete(plan._id);
    }

    const predictions = await ctx.db
      .query("predictions")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", phoneNumber))
      .collect();
    for (const prediction of predictions) {
      await ctx.db.delete(prediction._id);
    }

    const nutritionPlans = await ctx.db
      .query("nutritionPlans")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", phoneNumber))
      .collect();
    for (const plan of nutritionPlans) {
      await ctx.db.delete(plan._id);
    }

    const workoutSessions = await ctx.db
      .query("workoutSessions")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", phoneNumber))
      .collect();
    for (const session of workoutSessions) {
      await ctx.db.delete(session._id);
    }

    const personalRecords = await ctx.db
      .query("personalRecords")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", phoneNumber))
      .collect();
    for (const record of personalRecords) {
      await ctx.db.delete(record._id);
    }

    const exerciseHistory = await ctx.db
      .query("exerciseHistory")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", phoneNumber))
      .collect();
    for (const history of exerciseHistory) {
      await ctx.db.delete(history._id);
    }

    const pendingConfirmation = await ctx.db
      .query("pendingBiomechanicsConfirmation")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", phoneNumber))
      .first();
    if (pendingConfirmation) {
      await ctx.db.delete(pendingConfirmation._id);
    }

    const dashboardTokens = await ctx.db
      .query("dashboardTokens")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", phoneNumber))
      .collect();
    for (const token of dashboardTokens) {
      await ctx.db.delete(token._id);
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", phoneNumber))
      .first();
    if (profile) {
      if (profile.lastImageStorageId) {
        await ctx.storage.delete(profile.lastImageStorageId);
      }
      if (profile.lastVideoStorageId) {
        await ctx.storage.delete(profile.lastVideoStorageId);
      }
      await ctx.db.delete(profile._id);
    }

    await ctx.db.delete(mapping._id);

    return { success: true, phoneNumber };
  },
});
