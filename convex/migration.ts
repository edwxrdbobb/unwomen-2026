import { v } from "convex/values";
import { mutation } from "./_generated/server";

const roleValidator = v.union(
  v.literal("buyer"),
  v.literal("vendor"),
  v.literal("mentor"),
  v.literal("super_admin")
);

async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const importUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phoneNo: v.optional(v.string()),
    location: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
    role: roleValidator,
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .unique();
    if (existing) return { id: String(existing._id), skipped: true };

    const salt = generateSalt();
    const passwordHash = await hashPassword("Welcome123!", salt);

    const userId = await ctx.db.insert("users", {
      email: args.email.toLowerCase(),
      name: args.name,
      passwordHash,
      salt,
      role: args.role,
      phoneNo: args.phoneNo,
      location: args.location,
      profileImageUrl: args.profileImageUrl,
    });

    await ctx.db.insert("profiles", {
      userId: String(userId),
      name: args.name,
      email: args.email.toLowerCase(),
      role: args.role,
      phoneNo: args.phoneNo,
      location: args.location,
      profileImageUrl: args.profileImageUrl,
      isVerified: false,
    });

    return { id: String(userId), skipped: false };
  },
});

export const importProduct = mutation({
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
    return await ctx.db.insert("products", args);
  },
});

export const importBusiness = mutation({
  args: {
    vendorUserId: v.string(),
    businessName: v.string(),
    businessLocation: v.string(),
    category: v.string(),
    description: v.string(),
    imageUrls: v.array(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("businesses", args);
  },
});

export const seedCategories = mutation({
  args: {},
  handler: async (ctx) => {
    const cats = [
      { name: "Food & Agriculture", slug: "food",        emoji: "🌾", color: "bg-green-100",  textColor: "text-green-700",  type: "products"  as const, description: "Fresh produce, packaged foods and agricultural products", sortOrder: 1 },
      { name: "Household",          slug: "household",   emoji: "🏠", color: "bg-orange-100", textColor: "text-orange-600", type: "products"  as const, description: "Home goods, furniture and household essentials",           sortOrder: 2 },
      { name: "Beauty & Cosmetics", slug: "beauty",      emoji: "💄", color: "bg-pink-100",   textColor: "text-pink-600",   type: "products"  as const, description: "Skincare, makeup, haircare and personal care products",    sortOrder: 3 },
      { name: "Apparel & Fashion",  slug: "apparel",     emoji: "👗", color: "bg-purple-100", textColor: "text-purple-600", type: "both"      as const, description: "Clothing, footwear and fashion accessories",              sortOrder: 4 },
      { name: "Electronics",        slug: "electronics", emoji: "💻", color: "bg-blue-100",   textColor: "text-blue-600",   type: "products"  as const, description: "Electronic devices, gadgets and accessories",             sortOrder: 5 },
      { name: "Stationery & Office",slug: "stationery",  emoji: "📚", color: "bg-yellow-100", textColor: "text-yellow-600", type: "products"  as const, description: "Office supplies, stationery and educational materials",   sortOrder: 6 },
      { name: "Services",           slug: "services",    emoji: "🛠️", color: "bg-teal-100",   textColor: "text-teal-600",   type: "services"  as const, description: "Professional and personal services",                    sortOrder: 7 },
      { name: "General & Others",   slug: "others",      emoji: "📦", color: "bg-gray-100",   textColor: "text-gray-600",   type: "both"      as const, description: "Miscellaneous products and services",                    sortOrder: 8 },
    ];

    let seeded = 0;
    for (const cat of cats) {
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", cat.slug))
        .unique();
      if (!existing) {
        await ctx.db.insert("categories", cat);
        seeded++;
      }
    }
    return { seeded, skipped: cats.length - seeded };
  },
});
