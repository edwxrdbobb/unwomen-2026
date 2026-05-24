import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("categories").order("asc").collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
  },
});

export const listByType = query({
  args: { type: v.union(v.literal("products"), v.literal("services"), v.literal("both")) },
  handler: async (ctx, { type }) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_type", (q) => q.eq("type", type))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    emoji: v.string(),
    color: v.string(),
    textColor: v.string(),
    type: v.union(v.literal("products"), v.literal("services"), v.literal("both")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) throw new Error("A category with this slug already exists");
    const all = await ctx.db.query("categories").collect();
    const maxOrder = all.reduce((max, c) => Math.max(max, c.sortOrder), 0);
    return await ctx.db.insert("categories", { ...args, sortOrder: maxOrder + 1 });
  },
});

export const update = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    emoji: v.optional(v.string()),
    color: v.optional(v.string()),
    textColor: v.optional(v.string()),
    type: v.optional(v.union(v.literal("products"), v.literal("services"), v.literal("both"))),
  },
  handler: async (ctx, { id, ...fields }) => {
    const cat = await ctx.db.get(id);
    if (!cat) throw new Error("Category not found");
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

/** Safe to call multiple times — skips if categories already seeded. */
export const seedCategories = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("categories").first();
    if (existing) return { inserted: 0, message: "Categories already seeded." };

    const categories = [
      {
        name: "Beauty & Skincare",
        slug: "beauty-skincare",
        description: "Soaps, shea butter, natural oils, lotions, and cosmetics made by Sierra Leonean women",
        emoji: "💄",
        color: "bg-pink-100",
        textColor: "text-pink-600",
        type: "both" as const,
        sortOrder: 1,
      },
      {
        name: "Fashion & Clothing",
        slug: "fashion-clothing",
        description: "Ready-to-wear outfits, traditional attire, wax print designs, and everyday wear",
        emoji: "👗",
        color: "bg-purple-100",
        textColor: "text-purple-600",
        type: "products" as const,
        sortOrder: 2,
      },
      {
        name: "Accessories & Jewellery",
        slug: "accessories-jewellery",
        description: "Handcrafted beaded jewellery, bags, belts, headwear, and hair accessories",
        emoji: "💍",
        color: "bg-yellow-100",
        textColor: "text-yellow-600",
        type: "products" as const,
        sortOrder: 3,
      },
      {
        name: "Food & Beverages",
        slug: "food-beverages",
        description: "Processed foods, snacks, drinks, spices, palm oil, and traditional condiments",
        emoji: "🍲",
        color: "bg-orange-100",
        textColor: "text-orange-600",
        type: "both" as const,
        sortOrder: 4,
      },
      {
        name: "Farm Produce",
        slug: "farm-produce",
        description: "Fresh vegetables, fruits, grains, cassava, peppers, and groundnuts direct from women farmers",
        emoji: "🥬",
        color: "bg-green-100",
        textColor: "text-green-700",
        type: "products" as const,
        sortOrder: 5,
      },
      {
        name: "Crafts & Artwork",
        slug: "crafts-artwork",
        description: "Handmade crafts, weaving, pottery, paintings, and cultural art from local artisans",
        emoji: "🎨",
        color: "bg-teal-100",
        textColor: "text-teal-600",
        type: "products" as const,
        sortOrder: 6,
      },
      {
        name: "Home & Household",
        slug: "home-household",
        description: "Cookware, home décor, cleaning supplies, and everyday household items",
        emoji: "🏠",
        color: "bg-blue-100",
        textColor: "text-blue-600",
        type: "products" as const,
        sortOrder: 7,
      },
      {
        name: "Textiles & Fabrics",
        slug: "textiles-fabrics",
        description: "Wax prints, tie-dye gara cloth, kente fabric, and sewing materials",
        emoji: "🧵",
        color: "bg-indigo-100",
        textColor: "text-indigo-600",
        type: "products" as const,
        sortOrder: 8,
      },
      {
        name: "Health & Wellness",
        slug: "health-wellness",
        description: "Herbal remedies, traditional medicines, supplements, and wellness products",
        emoji: "🌿",
        color: "bg-emerald-100",
        textColor: "text-emerald-600",
        type: "both" as const,
        sortOrder: 9,
      },
      {
        name: "Baby & Kids",
        slug: "baby-kids",
        description: "Children's clothing, toys, school supplies, and baby care products",
        emoji: "👶",
        color: "bg-rose-100",
        textColor: "text-rose-600",
        type: "products" as const,
        sortOrder: 10,
      },
      {
        name: "Hair & Beauty Services",
        slug: "hair-beauty-services",
        description: "Salons, braiding, makeup artistry, nail care, and personal grooming services",
        emoji: "✂️",
        color: "bg-fuchsia-100",
        textColor: "text-fuchsia-600",
        type: "services" as const,
        sortOrder: 11,
      },
      {
        name: "Catering & Baking",
        slug: "catering-baking",
        description: "Event catering, pastries, cakes, local dishes, and meal preparation services",
        emoji: "🍰",
        color: "bg-amber-100",
        textColor: "text-amber-600",
        type: "both" as const,
        sortOrder: 12,
      },
      {
        name: "Tailoring & Design",
        slug: "tailoring-design",
        description: "Custom clothing, alterations, uniforms, and fashion design services",
        emoji: "🧶",
        color: "bg-violet-100",
        textColor: "text-violet-600",
        type: "both" as const,
        sortOrder: 13,
      },
      {
        name: "Education & Training",
        slug: "education-training",
        description: "Tutoring, vocational skills training, literacy programmes, and workshops",
        emoji: "📚",
        color: "bg-cyan-100",
        textColor: "text-cyan-600",
        type: "services" as const,
        sortOrder: 14,
      },
      {
        name: "Cleaning & Home Services",
        slug: "cleaning-home-services",
        description: "Domestic cleaning, laundry, ironing, and household management services",
        emoji: "🧹",
        color: "bg-lime-100",
        textColor: "text-lime-700",
        type: "services" as const,
        sortOrder: 15,
      },
      {
        name: "Event Planning",
        slug: "event-planning",
        description: "Wedding decoration, party planning, photography, and venue styling services",
        emoji: "🎉",
        color: "bg-red-100",
        textColor: "text-red-600",
        type: "services" as const,
        sortOrder: 16,
      },
      {
        name: "Electronics & Tech",
        slug: "electronics-tech",
        description: "Mobile phones, accessories, repairs, mobile money, and digital services",
        emoji: "📱",
        color: "bg-sky-100",
        textColor: "text-sky-600",
        type: "both" as const,
        sortOrder: 17,
      },
      {
        name: "Stationery & Office",
        slug: "stationery-office",
        description: "School supplies, office materials, printing, and educational stationery",
        emoji: "📎",
        color: "bg-slate-100",
        textColor: "text-slate-600",
        type: "products" as const,
        sortOrder: 18,
      },
    ];

    for (const cat of categories) {
      await ctx.db.insert("categories", cat);
    }
    return { inserted: categories.length, message: "Categories seeded successfully." };
  },
});
