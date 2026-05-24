import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const roleValidator = v.union(
  v.literal("buyer"),
  v.literal("vendor"),
  v.literal("mentor"),
  v.literal("super_admin")
);

const statusValidator = v.union(
  v.literal("pending"),
  v.literal("accepted"),
  v.literal("rejected")
);

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export const getAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const [buyers, vendors, mentors, admins, products, businesses, categories,
      pendingReqs, acceptedReqs, rejectedReqs, mentorships] = await Promise.all([
      ctx.db.query("profiles").withIndex("by_role", (q) => q.eq("role", "buyer")).collect(),
      ctx.db.query("profiles").withIndex("by_role", (q) => q.eq("role", "vendor")).collect(),
      ctx.db.query("profiles").withIndex("by_role", (q) => q.eq("role", "mentor")).collect(),
      ctx.db.query("profiles").withIndex("by_role", (q) => q.eq("role", "super_admin")).collect(),
      ctx.db.query("products").collect(),
      ctx.db.query("businesses").collect(),
      ctx.db.query("categories").collect(),
      ctx.db.query("mentorshipRequests").withIndex("by_status", (q) => q.eq("status", "pending")).collect(),
      ctx.db.query("mentorshipRequests").withIndex("by_status", (q) => q.eq("status", "accepted")).collect(),
      ctx.db.query("mentorshipRequests").withIndex("by_status", (q) => q.eq("status", "rejected")).collect(),
      ctx.db.query("mentorships").collect(),
    ]);

    return {
      users: {
        total: buyers.length + vendors.length + mentors.length + admins.length,
        buyers: buyers.length,
        vendors: vendors.length,
        mentors: mentors.length,
        admins: admins.length,
      },
      products: products.length,
      businesses: businesses.length,
      categories: categories.length,
      requests: {
        pending: pendingReqs.length,
        accepted: acceptedReqs.length,
        rejected: rejectedReqs.length,
        total: pendingReqs.length + acceptedReqs.length + rejectedReqs.length,
      },
      mentorships: {
        active: mentorships.filter((m) => m.isActive).length,
        total: mentorships.length,
      },
    };
  },
});

// ---------------------------------------------------------------------------
// User management
// ---------------------------------------------------------------------------

export const listAllUsers = query({
  args: { role: v.optional(roleValidator) },
  handler: async (ctx, { role }) => {
    if (role) {
      return await ctx.db
        .query("profiles")
        .withIndex("by_role", (q) => q.eq("role", role))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("profiles").order("desc").collect();
  },
});

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

export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.string(),
    role: roleValidator,
    phoneNo: v.optional(v.string()),
    location: v.optional(v.string()),
    adminUserId: v.string(),
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
      isVerified: args.role === "super_admin",
    });

    return { id: String(userId) };
  },
});

export const updateUserRole = mutation({
  args: {
    targetUserId: v.string(),
    role: roleValidator,
    adminUserId: v.string(),
  },
  handler: async (ctx, { targetUserId, role }) => {
    const normalized = ctx.db.normalizeId("users", targetUserId);
    if (normalized) await ctx.db.patch(normalized, { role });
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", targetUserId))
      .unique();
    if (profile) await ctx.db.patch(profile._id, { role });
  },
});

export const deleteUser = mutation({
  args: {
    targetUserId: v.string(),
    adminUserId: v.string(),
  },
  handler: async (ctx, { targetUserId }) => {
    const normalized = ctx.db.normalizeId("users", targetUserId);
    if (normalized) await ctx.db.delete(normalized);
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", targetUserId))
      .unique();
    if (profile) await ctx.db.delete(profile._id);
  },
});

// ---------------------------------------------------------------------------
// Product / Business admin actions
// ---------------------------------------------------------------------------

export const updateUser = mutation({
  args: {
    targetUserId: v.string(),
    adminUserId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phoneNo: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, { targetUserId, adminUserId: _a, ...fields }) => {
    const normalized = ctx.db.normalizeId("users", targetUserId);
    if (normalized) await ctx.db.patch(normalized, fields);
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", targetUserId))
      .unique();
    if (profile) await ctx.db.patch(profile._id, fields);
  },
});

export const updateProduct = mutation({
  args: {
    id: v.id("products"),
    adminUserId: v.string(),
    productName: v.optional(v.string()),
    productLocation: v.optional(v.string()),
    category: v.optional(v.string()),
    discription: v.optional(v.string()),
    currentPrice: v.optional(v.number()),
    previousPrice: v.optional(v.number()),
  },
  handler: async (ctx, { id, adminUserId: _a, ...fields }) => {
    await ctx.db.patch(id, fields);
  },
});

export const updateBusiness = mutation({
  args: {
    id: v.id("businesses"),
    adminUserId: v.string(),
    businessName: v.optional(v.string()),
    businessLocation: v.optional(v.string()),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    website: v.optional(v.string()),
  },
  handler: async (ctx, { id, adminUserId: _a, ...fields }) => {
    await ctx.db.patch(id, fields);
  },
});

export const deleteProduct = mutation({
  args: { id: v.id("products"), adminUserId: v.string() },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const deleteBusiness = mutation({
  args: { id: v.id("businesses"), adminUserId: v.string() },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// ---------------------------------------------------------------------------
// Enriched queries (join with profile names)
// ---------------------------------------------------------------------------

export const listRequestsEnriched = query({
  args: { status: v.optional(statusValidator) },
  handler: async (ctx, { status }) => {
    const requests = status
      ? await ctx.db
          .query("mentorshipRequests")
          .withIndex("by_status", (q) => q.eq("status", status))
          .order("desc")
          .collect()
      : await ctx.db.query("mentorshipRequests").order("desc").collect();

    return await Promise.all(
      requests.map(async (r) => {
        const [vendorProfile, mentorProfile, business] = await Promise.all([
          ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", r.vendorUserId))
            .unique(),
          r.mentorId
            ? ctx.db
                .query("profiles")
                .withIndex("by_userId", (q) => q.eq("userId", r.mentorId!))
                .unique()
            : null,
          r.businessId ? ctx.db.get(r.businessId) : null,
        ]);
        return {
          ...r,
          vendorName: vendorProfile?.name ?? "Unknown",
          vendorEmail: vendorProfile?.email ?? "",
          mentorName: mentorProfile?.name ?? null,
          businessName: business?.businessName ?? null,
        };
      })
    );
  },
});

export const listMentorshipsEnriched = query({
  args: {},
  handler: async (ctx) => {
    const mentorships = await ctx.db.query("mentorships").order("desc").collect();

    return await Promise.all(
      mentorships.map(async (m) => {
        const [mentorProfile, menteeProfile, business, messages] = await Promise.all([
          ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", m.mentorId))
            .unique(),
          ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", m.menteeUserId))
            .unique(),
          m.businessId ? ctx.db.get(m.businessId) : null,
          ctx.db
            .query("messages")
            .withIndex("by_mentorship", (q) => q.eq("mentorshipId", m._id))
            .collect(),
        ]);
        return {
          ...m,
          mentorName: mentorProfile?.name ?? "Unknown",
          mentorEmail: mentorProfile?.email ?? "",
          menteeName: menteeProfile?.name ?? "Unknown",
          menteeEmail: menteeProfile?.email ?? "",
          businessName: business?.businessName ?? null,
          messageCount: messages.length,
        };
      })
    );
  },
});

export const listMessagesEnriched = query({
  args: { mentorshipId: v.id("mentorships") },
  handler: async (ctx, { mentorshipId }) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_mentorship", (q) => q.eq("mentorshipId", mentorshipId))
      .order("asc")
      .collect();

    const senderIds = [...new Set(messages.map((m) => m.fromUserId))];
    const profiles = await Promise.all(
      senderIds.map((id) =>
        ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", id))
          .unique()
      )
    );
    const profileMap = Object.fromEntries(
      senderIds.map((id, i) => [id, profiles[i]])
    );

    return messages.map((m) => ({
      ...m,
      senderName: profileMap[m.fromUserId]?.name ?? "Unknown",
    }));
  },
});

export const listMentorsForAssign = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_role", (q) => q.eq("role", "mentor"))
      .collect();
  },
});
