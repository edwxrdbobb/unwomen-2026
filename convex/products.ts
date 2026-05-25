import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").order("desc").collect();
  },
});

export const listByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, { category }) => {
    const all = await ctx.db.query("products").order("desc").collect();
    return all.filter((p) => p.category === category);
  },
});

export const distinctCategories = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const seen = new Set<string>();
    const categories: { category: string }[] = [];
    for (const p of products) {
      if (p.category && !seen.has(p.category)) {
        seen.add(p.category);
        categories.push({ category: p.category });
      }
    }
    return categories;
  },
});

export const listByVendor = query({
  args: { vendorUserId: v.string() },
  handler: async (ctx, { vendorUserId }) => {
    return await ctx.db
      .query("products")
      .withIndex("by_vendor", (q) => q.eq("vendorUserId", vendorUserId))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const normalized = ctx.db.normalizeId("products", id);
    if (!normalized) {
      return null;
    }
    return await ctx.db.get(normalized);
  },
});

export const create = mutation({
  args: {
    vendorUserId: v.string(),
    productName: v.string(),
    productLocation: v.string(),
    category: v.string(),
    discription: v.string(),
    currentPrice: v.number(),
    previousPrice: v.number(),
    imageUrls: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const urls = args.imageUrls.filter((u) => u.trim().length > 0);
    if (urls.length === 0) {
      throw new Error("At least one image URL is required");
    }
    const productId = await ctx.db.insert("products", {
      vendorUserId: args.vendorUserId,
      productName: args.productName,
      productLocation: args.productLocation,
      category: args.category,
      discription: args.discription,
      currentPrice: args.currentPrice,
      previousPrice: args.previousPrice,
      imageUrls: urls,
    });

    const followers = await ctx.db
      .query("follows")
      .withIndex("by_target", (q) => q.eq("targetId", args.vendorUserId))
      .collect();

    if (followers.length > 0) {
      const vendorProfile = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", args.vendorUserId))
        .unique();
      const vendorName = vendorProfile?.name ?? "A vendor";
      const now = Date.now();
      await Promise.all(
        followers.map((f) =>
          ctx.db.insert("notifications", {
            userId: f.followerId,
            type: "new_product",
            title: "New Product Listed",
            body: `${vendorName} just listed "${args.productName}"`,
            read: false,
            createdAt: now,
            relatedProductId: productId,
            fromUserId: args.vendorUserId,
          })
        )
      );
    }

    return productId;
  },
});

export const remove = mutation({
  args: {
    id: v.id("products"),
    vendorUserId: v.string(),
  },
  handler: async (ctx, { id, vendorUserId }) => {
    const row = await ctx.db.get(id);
    if (!row || row.vendorUserId !== vendorUserId) {
      throw new Error("Product not found or you do not have permission to delete it");
    }
    await ctx.db.delete(id);
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    vendorUserId: v.string(),
    productName: v.string(),
    productLocation: v.string(),
    category: v.string(),
    discription: v.string(),
    currentPrice: v.number(),
    previousPrice: v.number(),
    imageUrls: v.array(v.string()),
  },
  handler: async (ctx, { id, vendorUserId, ...fields }) => {
    const row = await ctx.db.get(id);
    if (!row || row.vendorUserId !== vendorUserId) {
      throw new Error("Product not found or you do not have permission to update it");
    }
    const urls = fields.imageUrls.filter((u) => u.trim().length > 0);
    if (urls.length === 0) {
      throw new Error("At least one image URL is required");
    }
    await ctx.db.patch(id, { ...fields, imageUrls: urls });
  },
});

/** Safe to call multiple times: only inserts when the products table is empty. */
export const seedIfEmpty = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("products").first();
    if (existing) {
      return { inserted: 0, message: "Products already exist; skipped seed." };
    }
    const samples = [
      {
        vendorUserId: "demo-vendor",
        productName: "Shea Butter Body Balm",
        productLocation: "Freetown",
        category: "Beauty & Skincare",
        discription: "Rich shea butter balm for dry skin. Made by women-led cooperatives.",
        currentPrice: 45.0,
        previousPrice: 55.0,
        imageUrls: [
          "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80",
        ],
      },
      {
        vendorUserId: "demo-vendor",
        productName: "Handwoven Market Tote",
        productLocation: "Bo",
        category: "Accessories & Jewellery",
        discription: "Durable cotton tote, handwoven. Perfect for market days.",
        currentPrice: 120.0,
        previousPrice: 140.0,
        imageUrls: [
          "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
        ],
      },
      {
        vendorUserId: "demo-vendor",
        productName: "Spiced Ginger Tea Blend",
        productLocation: "Makeni",
        category: "Food & Beverages",
        discription: "Caffeine-free ginger and lemongrass blend. 15 sachets.",
        currentPrice: 35.0,
        previousPrice: 40.0,
        imageUrls: [
          "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80",
        ],
      },
      {
        vendorUserId: "demo-vendor",
        productName: "Ceramic Cooking Pot (Medium)",
        productLocation: "Freetown",
        category: "Home & Household",
        discription: "Glazed ceramic pot for stews and rice. Oven-safe.",
        currentPrice: 280.0,
        previousPrice: 320.0,
        imageUrls: [
          "https://images.unsplash.com/photo-1584990347449-a8b2917bc352?w=800&q=80",
        ],
      },
      {
        vendorUserId: "demo-vendor",
        productName: "Printed Wax Print Fabric (6 yards)",
        productLocation: "Kenema",
        category: "Fashion & Clothing",
        discription: "Vibrant authentic wax print cotton fabric.",
        currentPrice: 450.0,
        previousPrice: 500.0,
        imageUrls: [
          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
        ],
      },
    ];
    for (const row of samples) {
      await ctx.db.insert("products", row);
    }
    return { inserted: samples.length, message: "Sample products inserted." };
  },
});

/** One-time migration: fix seeded products that used short category names. */
export const fixSeedCategories = mutation({
  args: {},
  handler: async (ctx) => {
    const MAP: Record<string, string> = {
      "Beauty":      "Beauty & Skincare",
      "Accessories": "Accessories & Jewellery",
      "Food":        "Food & Beverages",
      "Home":        "Home & Household",
      "Fashion":     "Fashion & Clothing",
    };
    const all = await ctx.db.query("products").collect();
    let updated = 0;
    for (const p of all) {
      const fixed = MAP[p.category];
      if (fixed) {
        await ctx.db.patch(p._id, { category: fixed });
        updated++;
      }
    }
    return { updated };
  },
});
