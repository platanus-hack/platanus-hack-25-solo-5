import { customCtx, customQuery, customMutation } from "convex-helpers/server/customFunctions";
import { query, mutation } from "../_generated/server";

export const userQuery = customQuery(query, {
  args: {},
  input: async (ctx, args) => {
    return { ctx: {}, args };
  },
});

export const userMutation = customMutation(mutation, {
  args: {},
  input: async (ctx, args) => {
    return { ctx: {}, args };
  },
});
