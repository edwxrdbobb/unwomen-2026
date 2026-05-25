import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const toggle = mutation({
  args: {
    followerId: v.string(),
    targetId: v.string(),
    targetType: v.union(v.literal("vendor"), v.literal("business")),
    followerName: v.optional(v.string()),
  },
  handler: async (ctx, { followerId, targetId, targetType, followerName }) => {
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_follower_target", (q) =>
        q.eq("followerId", followerId).eq("targetId", targetId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { following: false };
    }

    await ctx.db.insert("follows", { followerId, targetId, targetType });

    if (targetType === "vendor") {
      await ctx.db.insert("notifications", {
        userId: targetId,
        type: "new_follower",
        title: "New Follower",
        body: `${followerName ?? "Someone"} started following you`,
        read: false,
        createdAt: Date.now(),
        fromUserId: followerId,
      });
    }

    return { following: true };
  },
});

export const isFollowing = query({
  args: { followerId: v.string(), targetId: v.string() },
  handler: async (ctx, { followerId, targetId }) => {
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_follower_target", (q) =>
        q.eq("followerId", followerId).eq("targetId", targetId)
      )
      .unique();
    return !!existing;
  },
});

export const countFollowers = query({
  args: { targetId: v.string() },
  handler: async (ctx, { targetId }) => {
    const followers = await ctx.db
      .query("follows")
      .withIndex("by_target", (q) => q.eq("targetId", targetId))
      .collect();
    return followers.length;
  },
});

export const listFollowing = query({
  args: { followerId: v.string() },
  handler: async (ctx, { followerId }) => {
    return await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", followerId))
      .collect();
  },
});
