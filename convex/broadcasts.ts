import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const send = mutation({
  args: {
    adminUserId: v.string(),
    subject: v.string(),
    message: v.string(),
    audience: v.union(
      v.literal("all"),
      v.literal("vendors"),
      v.literal("mentors"),
      v.literal("buyers")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("broadcasts", {
      adminUserId: args.adminUserId,
      subject: args.subject,
      message: args.message,
      audience: args.audience,
      sentAt: Date.now(),
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("broadcasts").order("desc").collect();
  },
});

export const remove = mutation({
  args: { id: v.id("broadcasts"), adminUserId: v.string() },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
