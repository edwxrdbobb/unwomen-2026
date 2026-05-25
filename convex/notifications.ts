import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});

export const unreadCount = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", userId).eq("read", false))
      .collect();
    return unread.length;
  },
});

export const markRead = mutation({
  args: { id: v.id("notifications"), userId: v.string() },
  handler: async (ctx, { id, userId }) => {
    const notif = await ctx.db.get(id);
    if (!notif || notif.userId !== userId) return;
    await ctx.db.patch(id, { read: true });
  },
});

export const markAllRead = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", userId).eq("read", false))
      .collect();
    await Promise.all(unread.map((n) => ctx.db.patch(n._id, { read: true })));
  },
});
