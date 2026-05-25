import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const statusValidator = v.union(
  v.literal("pending"),
  v.literal("accepted"),
  v.literal("rejected")
);

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

/** Any logged-in user can request a specific mentor from the browse page. */
export const createRequest = mutation({
  args: {
    vendorUserId: v.string(),
    mentorId: v.string(),
    businessId: v.optional(v.id("businesses")),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Prevent duplicate pending requests to the same mentor
    const existing = await ctx.db
      .query("mentorshipRequests")
      .withIndex("by_vendor", (q) => q.eq("vendorUserId", args.vendorUserId))
      .collect();
    const duplicate = existing.find(
      (r) => r.mentorId === args.mentorId && r.status === "pending"
    );
    if (duplicate) throw new Error("You already have a pending request to this mentor.");

    return await ctx.db.insert("mentorshipRequests", {
      vendorUserId: args.vendorUserId,
      mentorId: args.mentorId,
      businessId: args.businessId,
      message: args.message,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

/** Admin: list all requests, optionally filtered by status. */
export const listRequests = query({
  args: { status: v.optional(statusValidator) },
  handler: async (ctx, { status }) => {
    if (status) {
      return await ctx.db
        .query("mentorshipRequests")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("mentorshipRequests").order("desc").collect();
  },
});

/** Vendor: see their own requests and their statuses. */
export const listRequestsByVendor = query({
  args: { vendorUserId: v.string() },
  handler: async (ctx, { vendorUserId }) => {
    return await ctx.db
      .query("mentorshipRequests")
      .withIndex("by_vendor", (q) => q.eq("vendorUserId", vendorUserId))
      .order("desc")
      .collect();
  },
});

/** Mentor: see requests directed at them (with requester profile data). */
export const listRequestsByMentor = query({
  args: { mentorId: v.string() },
  handler: async (ctx, { mentorId }) => {
    const requests = await ctx.db
      .query("mentorshipRequests")
      .withIndex("by_mentor", (q) => q.eq("mentorId", mentorId))
      .order("desc")
      .collect();

    return await Promise.all(
      requests.map(async (req) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", req.vendorUserId))
          .unique();
        return { ...req, requesterProfile: profile ?? null };
      })
    );
  },
});

/**
 * Mentor: accept or decline a request directed at them.
 * Accepting immediately activates the mentorship and notifies the vendor.
 */
export const respondToRequest = mutation({
  args: {
    id: v.id("mentorshipRequests"),
    mentorId: v.string(),
    status: v.union(v.literal("accepted"), v.literal("rejected")),
  },
  handler: async (ctx, { id, mentorId, status }) => {
    const req = await ctx.db.get(id);
    if (!req) throw new Error("Request not found");
    if (req.mentorId !== mentorId) throw new Error("Permission denied");
    if (req.status !== "pending") throw new Error("Request is no longer pending");

    await ctx.db.patch(id, {
      status,
      reviewedAt: Date.now(),
      reviewedBy: mentorId,
      assignedMentorId: status === "accepted" ? mentorId : undefined,
    });

    if (status === "accepted") {
      await ctx.db.insert("mentorships", {
        mentorId,
        menteeUserId: req.vendorUserId,
        businessId: req.businessId,
        requestId: id,
        startedAt: Date.now(),
        isActive: true,
      });

      // Notify the vendor their mentorship is now active
      const mentorProfile = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", mentorId))
        .unique();
      await ctx.db.insert("notifications", {
        userId: req.vendorUserId,
        type: "mentorship_accepted",
        title: "Mentorship Accepted",
        body: `${mentorProfile?.name ?? "Your mentor"} has accepted your mentorship. You can now connect with them.`,
        read: false,
        createdAt: Date.now(),
        fromUserId: mentorId,
      });
    } else {
      // Notify the vendor the request was declined
      const mentorProfile = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", mentorId))
        .unique();
      await ctx.db.insert("notifications", {
        userId: req.vendorUserId,
        type: "mentorship_rejected",
        title: "Mentorship Declined",
        body: `${mentorProfile?.name ?? "The assigned mentor"} was unable to take on your mentorship at this time.`,
        read: false,
        createdAt: Date.now(),
        fromUserId: mentorId,
      });
    }
  },
});

/** Admin: accept or reject a request (status only, no mentorship activation). */
export const reviewRequest = mutation({
  args: {
    id: v.id("mentorshipRequests"),
    adminUserId: v.string(),
    status: v.union(v.literal("accepted"), v.literal("rejected")),
    assignedMentorId: v.optional(v.string()),
  },
  handler: async (ctx, { id, adminUserId, status, assignedMentorId }) => {
    const row = await ctx.db.get(id);
    if (!row) throw new Error("Request not found");
    await ctx.db.patch(id, {
      status,
      reviewedAt: Date.now(),
      reviewedBy: adminUserId,
      assignedMentorId,
    });
  },
});

// ---------------------------------------------------------------------------
// Active mentorships
// ---------------------------------------------------------------------------

/**
 * Admin: accept a vendor's request and activate the mentorship.
 * The admin has reviewed this request — notify both parties.
 */
export const createMentorship = mutation({
  args: {
    requestId: v.id("mentorshipRequests"),
    adminUserId: v.string(),
    mentorId: v.string(),
  },
  handler: async (ctx, { requestId, adminUserId, mentorId }) => {
    const request = await ctx.db.get(requestId);
    if (!request) throw new Error("Request not found");
    await ctx.db.patch(requestId, {
      status: "accepted",
      reviewedAt: Date.now(),
      reviewedBy: adminUserId,
      assignedMentorId: mentorId,
      mentorId,
    });
    const mentorshipId = await ctx.db.insert("mentorships", {
      mentorId,
      menteeUserId: request.vendorUserId,
      businessId: request.businessId,
      requestId,
      startedAt: Date.now(),
      isActive: true,
    });

    const [mentorProfile, vendorProfile] = await Promise.all([
      ctx.db.query("profiles").withIndex("by_userId", (q) => q.eq("userId", mentorId)).unique(),
      ctx.db.query("profiles").withIndex("by_userId", (q) => q.eq("userId", request.vendorUserId)).unique(),
    ]);
    const now = Date.now();

    // Notify the mentor they have a new mentee
    await ctx.db.insert("notifications", {
      userId: mentorId,
      type: "mentorship_accepted",
      title: "New Mentee Assigned",
      body: `You have been assigned to mentor ${vendorProfile?.name ?? "a vendor"}. Head to your dashboard to get started.`,
      read: false,
      createdAt: now,
      fromUserId: adminUserId,
    });
    // Notify the vendor their request was accepted
    await ctx.db.insert("notifications", {
      userId: request.vendorUserId,
      type: "mentorship_accepted",
      title: "Mentorship Request Accepted",
      body: `Your mentorship request has been approved. ${mentorProfile?.name ?? "A mentor"} will be working with you.`,
      read: false,
      createdAt: now,
      fromUserId: adminUserId,
    });

    return mentorshipId;
  },
});

/**
 * Admin: propose a direct pairing. Creates a pending request the mentor must accept.
 * The mentorship only activates when the mentor calls respondToRequest.
 */
export const connectDirectly = mutation({
  args: {
    adminUserId: v.string(),
    mentorId: v.string(),
    menteeUserId: v.string(),
    businessId: v.optional(v.id("businesses")),
  },
  handler: async (ctx, args) => {
    const requestId = await ctx.db.insert("mentorshipRequests", {
      vendorUserId: args.menteeUserId,
      businessId: args.businessId,
      mentorId: args.mentorId,
      status: "pending",
      createdAt: Date.now(),
      reviewedBy: args.adminUserId,
    });

    const [mentorProfile, vendorProfile] = await Promise.all([
      ctx.db.query("profiles").withIndex("by_userId", (q) => q.eq("userId", args.mentorId)).unique(),
      ctx.db.query("profiles").withIndex("by_userId", (q) => q.eq("userId", args.menteeUserId)).unique(),
    ]);
    const now = Date.now();

    // Ask the mentor to review and accept
    await ctx.db.insert("notifications", {
      userId: args.mentorId,
      type: "mentorship_request",
      title: "Mentorship Assignment",
      body: `Admin has proposed you as a mentor for ${vendorProfile?.name ?? "a vendor"}. Please review and accept or decline in your dashboard.`,
      read: false,
      createdAt: now,
      fromUserId: args.adminUserId,
    });
    // Let the vendor know a mentor has been proposed and is reviewing
    await ctx.db.insert("notifications", {
      userId: args.menteeUserId,
      type: "mentorship_request",
      title: "Mentor Proposed",
      body: `Admin has proposed ${mentorProfile?.name ?? "a mentor"} for you. Awaiting their confirmation.`,
      read: false,
      createdAt: now,
      fromUserId: args.adminUserId,
    });

    return requestId;
  },
});

/** Mentor: see all their mentees (active and past). */
export const listByMentor = query({
  args: { mentorId: v.string() },
  handler: async (ctx, { mentorId }) => {
    const mentorships = await ctx.db
      .query("mentorships")
      .withIndex("by_mentor", (q) => q.eq("mentorId", mentorId))
      .order("desc")
      .collect();

    return await Promise.all(
      mentorships.map(async (m) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", m.menteeUserId))
          .unique();
        return { ...m, menteeProfile: profile ?? null };
      })
    );
  },
});

/** Vendor: see their assigned mentors. */
export const listByMentee = query({
  args: { menteeUserId: v.string() },
  handler: async (ctx, { menteeUserId }) => {
    return await ctx.db
      .query("mentorships")
      .withIndex("by_mentee", (q) => q.eq("menteeUserId", menteeUserId))
      .order("desc")
      .collect();
  },
});

/** Admin: see all mentorships. */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("mentorships").order("desc").collect();
  },
});

/** Mentor: update progress notes for a mentee. */
export const updateProgress = mutation({
  args: {
    id: v.id("mentorships"),
    mentorId: v.string(),
    progressNotes: v.string(),
  },
  handler: async (ctx, { id, mentorId, progressNotes }) => {
    const row = await ctx.db.get(id);
    if (!row || row.mentorId !== mentorId) {
      throw new Error("Mentorship not found or permission denied");
    }
    await ctx.db.patch(id, { progressNotes });
  },
});

/** Admin: end an active mentorship. */
export const endMentorship = mutation({
  args: { id: v.id("mentorships"), adminUserId: v.string() },
  handler: async (ctx, { id }) => {
    const row = await ctx.db.get(id);
    if (!row) throw new Error("Mentorship not found");
    await ctx.db.patch(id, { isActive: false });
  },
});
