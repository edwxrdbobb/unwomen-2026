import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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

export const signup = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.string(),
    role: roleValidator,
    phoneNo: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .unique();
    if (existing) throw new Error("Email already registered");

    const salt = generateSalt();
    const passwordHash = await hashPassword(args.password, salt);

    const userId = await ctx.db.insert("users", {
      email: args.email.toLowerCase(),
      name: args.name,
      passwordHash,
      salt,
      role: args.role,
      phoneNo: args.phoneNo,
      location: args.location,
    });

    await ctx.db.insert("profiles", {
      userId: String(userId),
      name: args.name,
      email: args.email.toLowerCase(),
      role: args.role,
      phoneNo: args.phoneNo,
      location: args.location,
      isVerified: false,
    });

    return {
      id: String(userId),
      email: args.email.toLowerCase(),
      name: args.name,
      role: args.role,
      phoneNo: args.phoneNo,
      location: args.location,
    };
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { email, password }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .unique();
    if (!user) throw new Error("Invalid email or password");

    const hash = await hashPassword(password, user.salt);
    if (hash !== user.passwordHash) throw new Error("Invalid email or password");

    return {
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
      phoneNo: user.phoneNo,
      location: user.location,
      profileImageUrl: user.profileImageUrl,
    };
  },
});

export const getMe = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const normalized = ctx.db.normalizeId("users", id);
    if (!normalized) return null;
    const user = await ctx.db.get(normalized);
    if (!user) return null;
    return {
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
      phoneNo: user.phoneNo,
      location: user.location,
      profileImageUrl: user.profileImageUrl,
    };
  },
});

/** Seed Aminata Koroma as a vendor user so demo products + businesses resolve to a real account. */
export const seedDemoVendorUser = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "aminata.koroma@sierraleone.sl"))
      .unique();
    if (existing) return { message: "Demo vendor user already exists.", userId: String(existing._id) };

    const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const encoder = new TextEncoder();
    const data = encoder.encode("Aminata2024!" + salt);
    const buf = await crypto.subtle.digest("SHA-256", data);
    const passwordHash = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const userId = await ctx.db.insert("users", {
      email: "aminata.koroma@sierraleone.sl",
      name: "Aminata Koroma",
      passwordHash,
      salt,
      role: "vendor",
      phoneNo: "+232 79 123 456",
      location: "Freetown, Sierra Leone",
      profileImageUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80",
    });

    // Upsert profile with the real userId
    const profileExisting = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", "demo-vendor"))
      .unique();

    if (profileExisting) {
      // Update the demo-vendor placeholder to point at the real userId
      await ctx.db.patch(profileExisting._id, { userId: String(userId) });
    } else {
      await ctx.db.insert("profiles", {
        userId: String(userId),
        name: "Aminata Koroma",
        email: "aminata.koroma@sierraleone.sl",
        role: "vendor",
        bio: "Women entrepreneur from Freetown with over 10 years of experience in fashion, beauty, and agricultural trade. Passionate about empowering other women through mentorship and fair-trade commerce.",
        location: "Freetown, Sierra Leone",
        phoneNo: "+232 79 123 456",
        profileImageUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80",
        expertise: "Fashion design, natural beauty products, agricultural exports",
        isVerified: true,
      });
    }

    return { message: "Demo vendor user seeded.", userId: String(userId) };
  },
});

export const updateProfile = mutation({
  args: {
    id: v.string(),
    name: v.optional(v.string()),
    phoneNo: v.optional(v.string()),
    location: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const normalized = ctx.db.normalizeId("users", id);
    if (!normalized) throw new Error("User not found");
    await ctx.db.patch(normalized, fields);
    // Keep profile in sync
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", id))
      .unique();
    if (profile) await ctx.db.patch(profile._id, fields);
  },
});
