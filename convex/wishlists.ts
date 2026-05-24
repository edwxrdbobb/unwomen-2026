import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const add = mutation({
  args: { userId: v.string(), productId: v.id("products") },
  handler: async (ctx, { userId, productId }) => {
    const existing = await ctx.db
      .query("wishlists")
      .withIndex("by_user_product", (q) => q.eq("userId", userId).eq("productId", productId))
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert("wishlists", { userId, productId });
  },
});

export const remove = mutation({
  args: { userId: v.string(), productId: v.id("products") },
  handler: async (ctx, { userId, productId }) => {
    const existing = await ctx.db
      .query("wishlists")
      .withIndex("by_user_product", (q) => q.eq("userId", userId).eq("productId", productId))
      .unique();
    if (existing) await ctx.db.delete(existing._id);
  },
});

/** Toggle wishlist status. Returns true if added, false if removed. */
export const toggle = mutation({
  args: { userId: v.string(), productId: v.id("products") },
  handler: async (ctx, { userId, productId }) => {
    const existing = await ctx.db
      .query("wishlists")
      .withIndex("by_user_product", (q) => q.eq("userId", userId).eq("productId", productId))
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
      return false;
    }
    await ctx.db.insert("wishlists", { userId, productId });
    return true;
  },
});

/** Get all wishlisted products for a user (returns full product docs). */
export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const entries = await ctx.db
      .query("wishlists")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const products = await Promise.all(entries.map((e) => ctx.db.get(e.productId)));
    return products.filter(Boolean);
  },
});

export const isWishlisted = query({
  args: { userId: v.string(), productId: v.id("products") },
  handler: async (ctx, { userId, productId }) => {
    const existing = await ctx.db
      .query("wishlists")
      .withIndex("by_user_product", (q) => q.eq("userId", userId).eq("productId", productId))
      .unique();
    return !!existing;
  },
});

export const countByProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, { productId }) => {
    const entries = await ctx.db
      .query("wishlists")
      .withIndex("by_product", (q) => q.eq("productId", productId))
      .collect();
    return entries.length;
  },
});
