import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("userMetadata")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const upsert = mutation({
  args: {
    userId: v.string(),
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"))),
    cookieConsent: v.optional(v.union(v.literal("accepted"), v.literal("declined"))),
  },
  handler: async (ctx, { userId, ...fields }) => {
    const existing = await ctx.db
      .query("userMetadata")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    const payload = {
      ...fields,
      ...(fields.cookieConsent ? { cookieConsentAt: Date.now() } : {}),
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
    } else {
      await ctx.db.insert("userMetadata", { userId, ...payload });
    }
  },
});
