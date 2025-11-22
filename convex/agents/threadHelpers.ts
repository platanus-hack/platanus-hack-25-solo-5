import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";
import { twilioAgent } from "./twilioAgent";

export const getThreadByPhonePair = internalQuery({
  args: {
    from: v.string(),
    to: v.string(),
  },
  handler: async (ctx, { from, to }) => {
    const threadMapping = await ctx.db
      .query("phoneThreadMappings")
      .withIndex("by_phone_pair", (q) =>
        q.eq("from", from).eq("to", to)
      )
      .first();

    return threadMapping?.threadId;
  },
});

export const createThreadForPhonePair = internalMutation({
  args: {
    from: v.string(),
    to: v.string(),
    userName: v.optional(v.string()),
  },
  handler: async (ctx, { from, to, userName }) => {
    const existingMapping = await ctx.db
      .query("phoneThreadMappings")
      .withIndex("by_phone_pair", (q) =>
        q.eq("from", from).eq("to", to)
      )
      .first();

    if (existingMapping) {
      return existingMapping.threadId;
    }

    const { threadId } = await twilioAgent.createThread(ctx, {
      userId: from,
      title: `WhatsApp conversation with ${userName || from}`,
    });

    await ctx.db.insert("phoneThreadMappings", {
      from,
      to,
      threadId,
      createdAt: Date.now(),
    });

    return threadId;
  },
});

export const getOrCreateThread = internalMutation({
  args: {
    from: v.string(),
    to: v.string(),
    userName: v.optional(v.string()),
  },
  handler: async (ctx, { from, to, userName }) => {
    const existingMapping = await ctx.db
      .query("phoneThreadMappings")
      .withIndex("by_phone_pair", (q) =>
        q.eq("from", from).eq("to", to)
      )
      .first();

    if (existingMapping) {
      return existingMapping.threadId;
    }

    const { threadId } = await twilioAgent.createThread(ctx, {
      userId: from,
      title: `WhatsApp conversation with ${userName || from}`,
    });

    await ctx.db.insert("phoneThreadMappings", {
      from,
      to,
      threadId,
      createdAt: Date.now(),
    });

    return threadId;
  },
});
