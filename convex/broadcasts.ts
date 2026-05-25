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
    const broadcastId = await ctx.db.insert("broadcasts", {
      adminUserId: args.adminUserId,
      subject: args.subject,
      message: args.message,
      audience: args.audience,
      sentAt: Date.now(),
    });

    const roleMap = { vendors: "vendor", mentors: "mentor", buyers: "buyer" } as const;
    const profiles =
      args.audience === "all"
        ? await ctx.db.query("profiles").collect()
        : await ctx.db
            .query("profiles")
            .withIndex("by_role", (q) => q.eq("role", roleMap[args.audience as keyof typeof roleMap]))
            .collect();

    const now = Date.now();
    await Promise.all(
      profiles.map((p) =>
        ctx.db.insert("notifications", {
          userId: p.userId,
          type: "broadcast",
          title: args.subject,
          body: args.message,
          read: false,
          createdAt: now,
          fromUserId: args.adminUserId,
        })
      )
    );

    return broadcastId;
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
