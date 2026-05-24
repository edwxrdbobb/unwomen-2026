import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const roleValidator = v.union(
  v.literal("buyer"),
  v.literal("vendor"),
  v.literal("mentor"),
  v.literal("super_admin")
);

/** Create or update a public profile — call this after every login with the legacy auth data. */
export const upsert = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    role: roleValidator,
    profileImageUrl: v.optional(v.string()),
    phoneNo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email,
        profileImageUrl: args.profileImageUrl,
        phoneNo: args.phoneNo,
      });
      return existing._id;
    }
    return await ctx.db.insert("profiles", {
      userId: args.userId,
      name: args.name,
      email: args.email,
      role: args.role,
      profileImageUrl: args.profileImageUrl,
      phoneNo: args.phoneNo,
      isVerified: false,
    });
  },
});

export const get = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const normalized = ctx.db.normalizeId("profiles", id);
    if (!normalized) return null;
    return await ctx.db.get(normalized);
  },
});

export const listByRole = query({
  args: { role: roleValidator },
  handler: async (ctx, { role }) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_role", (q) => q.eq("role", role))
      .order("desc")
      .collect();
  },
});

export const update = mutation({
  args: {
    userId: v.string(),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    expertise: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
    phoneNo: v.optional(v.string()),
    whatsappNumber: v.optional(v.string()),
    telegramUsername: v.optional(v.string()),
  },
  handler: async (ctx, { userId, ...fields }) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) throw new Error("Profile not found");
    await ctx.db.patch(profile._id, fields);
  },
});

/** Seed a demo vendor profile tied to the "demo-vendor" userId used by seeded products & businesses. */
export const seedDemoProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", "demo-vendor"))
      .unique();
    if (existing) return { message: "Demo profile already exists." };

    await ctx.db.insert("profiles", {
      userId: "demo-vendor",
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

    return { message: "Demo vendor profile seeded." };
  },
});

/** Seed demo mentor profiles for the mentors browse page. */
export const seedMentors = mutation({
  args: {},
  handler: async (ctx) => {
    const mentors = [
      {
        userId: "mentor-001",
        name: "Fatmata Bangura",
        email: "fatmata.bangura@mentor.sl",
        role: "mentor" as const,
        bio: "Former BRAC microfinance officer turned business coach with 12 years helping women-led SMEs in Freetown scale sustainably. I specialise in financial literacy, pricing strategy, and accessing grant funding.",
        location: "Freetown, Sierra Leone",
        phoneNo: "+232 76 221 334",
        expertise: "Financial management, grant writing, pricing strategy",
        profileImageUrl: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&q=80",
        isVerified: true,
      },
      {
        userId: "mentor-002",
        name: "Mariama Sesay",
        email: "mariama.sesay@mentor.sl",
        role: "mentor" as const,
        bio: "Serial entrepreneur and trade consultant. Founded two export businesses before transitioning to mentorship full-time. I help vendors access international markets, particularly in the UK and EU.",
        location: "Bo, Sierra Leone",
        phoneNo: "+232 78 456 112",
        expertise: "Export trade, international markets, business development",
        profileImageUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80",
        isVerified: true,
      },
      {
        userId: "mentor-003",
        name: "Isata Koroma",
        email: "isata.koroma@mentor.sl",
        role: "mentor" as const,
        bio: "Digital marketing specialist who has trained over 200 women entrepreneurs in social media sales, WhatsApp Business, and e-commerce. Passionate about bridging the digital divide for rural vendors.",
        location: "Kenema, Sierra Leone",
        phoneNo: "+232 77 983 055",
        expertise: "Digital marketing, social media, e-commerce",
        profileImageUrl: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400&q=80",
        isVerified: true,
      },
      {
        userId: "mentor-004",
        name: "Aminata Turay",
        email: "aminata.turay@mentor.sl",
        role: "mentor" as const,
        bio: "Certified accountant and tax advisor. I guide small businesses through bookkeeping, NRA compliance, and preparing financials for bank loans. Available for both in-person and virtual sessions.",
        location: "Freetown, Sierra Leone",
        phoneNo: "+232 79 012 678",
        expertise: "Accounting, tax compliance, loan preparation",
        profileImageUrl: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&q=80",
        isVerified: false,
      },
      {
        userId: "mentor-005",
        name: "Hawa Conteh",
        email: "hawa.conteh@mentor.sl",
        role: "mentor" as const,
        bio: "Agricultural value-chain expert with 8 years of experience helping women farmers and agro-processors add value to their produce. Specialist in packaging, quality standards, and cooperative formation.",
        location: "Makeni, Sierra Leone",
        phoneNo: "+232 76 774 229",
        expertise: "Agriculture, food processing, cooperatives",
        profileImageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&q=80",
        isVerified: true,
      },
      {
        userId: "mentor-006",
        name: "Adama Kamara",
        email: "adama.kamara@mentor.sl",
        role: "mentor" as const,
        bio: "Fashion and creative industries consultant. Former head of design at a Freetown textile firm, now coaching emerging designers and tailors on brand-building, production scaling, and retail distribution.",
        location: "Freetown, Sierra Leone",
        phoneNo: "+232 78 339 500",
        expertise: "Fashion design, brand building, retail",
        profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
        isVerified: true,
      },
    ];

    let seeded = 0;
    for (const mentor of mentors) {
      const existing = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", mentor.userId))
        .unique();
      if (!existing) {
        await ctx.db.insert("profiles", mentor);
        seeded++;
      }
    }
    return { message: `${seeded} mentor profile(s) seeded.` };
  },
});

/** Admin only: verify or unverify a profile. */
export const setVerified = mutation({
  args: {
    targetUserId: v.string(),
    adminUserId: v.string(),
    isVerified: v.boolean(),
  },
  handler: async (ctx, { targetUserId, isVerified }) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", targetUserId))
      .unique();
    if (!profile) throw new Error("Profile not found");
    await ctx.db.patch(profile._id, { isVerified });
  },
});
