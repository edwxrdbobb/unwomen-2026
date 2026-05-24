import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Send a message within an active mentorship thread. */
export const send = mutation({
  args: {
    mentorshipId: v.id("mentorships"),
    fromUserId: v.string(),
    toUserId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const mentorship = await ctx.db.get(args.mentorshipId);
    if (!mentorship || !mentorship.isActive) {
      throw new Error("Mentorship not found or inactive");
    }
    const participants = [mentorship.mentorId, mentorship.menteeUserId];
    if (!participants.includes(args.fromUserId) || !participants.includes(args.toUserId)) {
      throw new Error("Not a participant of this mentorship");
    }
    return await ctx.db.insert("messages", {
      mentorshipId: args.mentorshipId,
      fromUserId: args.fromUserId,
      toUserId: args.toUserId,
      content: args.content,
      createdAt: Date.now(),
      read: false,
    });
  },
});

/** Get all messages for a mentorship thread, oldest first. */
export const listByMentorship = query({
  args: { mentorshipId: v.id("mentorships") },
  handler: async (ctx, { mentorshipId }) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_mentorship", (q) => q.eq("mentorshipId", mentorshipId))
      .order("asc")
      .collect();
  },
});

/** Mark all unread messages in a mentorship thread as read for a given user. */
export const markRead = mutation({
  args: { mentorshipId: v.id("mentorships"), userId: v.string() },
  handler: async (ctx, { mentorshipId, userId }) => {
    const unread = await ctx.db
      .query("messages")
      .withIndex("by_mentorship", (q) => q.eq("mentorshipId", mentorshipId))
      .filter((q) =>
        q.and(
          q.eq(q.field("toUserId"), userId),
          q.eq(q.field("read"), false)
        )
      )
      .collect();
    await Promise.all(unread.map((m) => ctx.db.patch(m._id, { read: true })));
  },
});

/** Total unread message count for a user across all their mentorship threads. */
export const unreadCount = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const unread = await ctx.db
      .query("messages")
      .withIndex("by_recipient_read", (q) => q.eq("toUserId", userId).eq("read", false))
      .collect();
    return unread.length;
  },
});
