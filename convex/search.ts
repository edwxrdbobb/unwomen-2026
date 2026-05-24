import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const saveHistory = mutation({
  args: { userId: v.string(), query: v.string() },
  handler: async (ctx, { userId, query: searchQuery }) => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 2) return;

    const existing = await ctx.db
      .query("searchHistory")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const duplicate = existing.find(
      (h) => h.query.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      await ctx.db.patch(duplicate._id, { createdAt: Date.now() });
      return;
    }

    await ctx.db.insert("searchHistory", {
      userId,
      query: trimmed,
      createdAt: Date.now(),
    });

    // Prune to max 20 entries
    if (existing.length >= 20) {
      const oldest = existing.sort((a, b) => a.createdAt - b.createdAt)[0];
      await ctx.db.delete(oldest._id);
    }
  },
});

export const listHistory = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("searchHistory")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .take(10);
  },
});

export const clearHistory = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const items = await ctx.db
      .query("searchHistory")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const item of items) {
      await ctx.db.delete(item._id);
    }
  },
});

export const removeOne = mutation({
  args: { id: v.id("searchHistory") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
