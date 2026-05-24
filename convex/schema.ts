import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    passwordHash: v.string(),
    salt: v.string(),
    role: v.union(
      v.literal("buyer"),
      v.literal("vendor"),
      v.literal("mentor"),
      v.literal("super_admin")
    ),
    phoneNo: v.optional(v.string()),
    location: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
  }).index("by_email", ["email"]),

  products: defineTable({
    vendorUserId: v.string(),
    productName: v.string(),
    productLocation: v.string(),
    category: v.string(),
    discription: v.string(),
    currentPrice: v.number(),
    previousPrice: v.number(),
    imageUrls: v.array(v.string()),
  }).index("by_vendor", ["vendorUserId"]),

  profiles: defineTable({
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("buyer"),
      v.literal("vendor"),
      v.literal("mentor"),
      v.literal("super_admin")
    ),
    bio: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
    phoneNo: v.optional(v.string()),
    location: v.optional(v.string()),
    expertise: v.optional(v.string()),
    isVerified: v.boolean(),
    whatsappNumber: v.optional(v.string()),
    telegramUsername: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_role", ["role"]),

  businesses: defineTable({
    vendorUserId: v.string(),
    businessName: v.string(),
    businessLocation: v.string(),
    category: v.string(),
    description: v.string(),
    imageUrls: v.array(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    website: v.optional(v.string()),
  })
    .index("by_vendor", ["vendorUserId"])
    .index("by_category", ["category"]),

  wishlists: defineTable({
    userId: v.string(),
    productId: v.id("products"),
  })
    .index("by_user", ["userId"])
    .index("by_product", ["productId"])
    .index("by_user_product", ["userId", "productId"]),

  mentorshipRequests: defineTable({
    vendorUserId: v.string(),
    businessId: v.optional(v.id("businesses")),
    mentorId: v.optional(v.string()),
    message: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
    createdAt: v.number(),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.string()),
    assignedMentorId: v.optional(v.string()),
  })
    .index("by_vendor", ["vendorUserId"])
    .index("by_status", ["status"])
    .index("by_mentor", ["mentorId"]),

  mentorships: defineTable({
    mentorId: v.string(),
    menteeUserId: v.string(),
    businessId: v.optional(v.id("businesses")),
    requestId: v.id("mentorshipRequests"),
    startedAt: v.number(),
    isActive: v.boolean(),
    progressNotes: v.optional(v.string()),
  })
    .index("by_mentor", ["mentorId"])
    .index("by_mentee", ["menteeUserId"])
    .index("by_mentor_active", ["mentorId", "isActive"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    emoji: v.string(),
    color: v.string(),
    textColor: v.string(),
    type: v.union(v.literal("products"), v.literal("services"), v.literal("both")),
    sortOrder: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_type", ["type"]),

  messages: defineTable({
    mentorshipId: v.id("mentorships"),
    fromUserId: v.string(),
    toUserId: v.string(),
    content: v.string(),
    createdAt: v.number(),
    read: v.boolean(),
  })
    .index("by_mentorship", ["mentorshipId"])
    .index("by_recipient_read", ["toUserId", "read"]),

  posts: defineTable({
    authorUserId: v.string(),
    title: v.string(),
    excerpt: v.string(),
    content: v.string(),
    category: v.string(),
    imageUrl: v.optional(v.string()),
    published: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_author", ["authorUserId"])
    .index("by_published", ["published"])
    .index("by_published_created", ["published", "createdAt"]),

  comments: defineTable({
    postId: v.id("posts"),
    authorUserId: v.string(),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_author", ["authorUserId"]),

  postLikes: defineTable({
    postId: v.id("posts"),
    userId: v.string(),
  })
    .index("by_post", ["postId"])
    .index("by_post_user", ["postId", "userId"]),

  searchHistory: defineTable({
    userId: v.string(),
    query: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"]),

  userMetadata: defineTable({
    userId: v.string(),
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"))),
    cookieConsent: v.optional(v.union(v.literal("accepted"), v.literal("declined"))),
    cookieConsentAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"]),

  broadcasts: defineTable({
    adminUserId: v.string(),
    subject: v.string(),
    message: v.string(),
    audience: v.union(
      v.literal("all"),
      v.literal("vendors"),
      v.literal("mentors"),
      v.literal("buyers")
    ),
    sentAt: v.number(),
  }).index("by_admin", ["adminUserId"]),
});
