import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .order("desc")
      .collect();
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("posts").order("desc").collect();
  },
});

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const normalized = ctx.db.normalizeId("posts", id);
    if (!normalized) return null;
    return await ctx.db.get(normalized);
  },
});

export const listByAuthor = query({
  args: { authorUserId: v.string() },
  handler: async (ctx, { authorUserId }) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("authorUserId", authorUserId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    authorUserId: v.string(),
    title: v.string(),
    excerpt: v.string(),
    content: v.string(),
    category: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("posts", {
      ...args,
      published: true,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    authorUserId: v.string(),
    title: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    category: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, { id, authorUserId, ...fields }) => {
    const normalized = ctx.db.normalizeId("posts", id);
    if (!normalized) throw new Error("Post not found");
    const post = await ctx.db.get(normalized);
    if (!post) throw new Error("Post not found");
    if (post.authorUserId !== authorUserId) throw new Error("Unauthorized");
    await ctx.db.patch(normalized, fields);
  },
});

export const remove = mutation({
  args: { id: v.string(), authorUserId: v.string() },
  handler: async (ctx, { id, authorUserId }) => {
    const normalized = ctx.db.normalizeId("posts", id);
    if (!normalized) throw new Error("Post not found");
    const post = await ctx.db.get(normalized);
    if (!post) throw new Error("Post not found");
    if (post.authorUserId !== authorUserId) throw new Error("Unauthorized");
    await ctx.db.delete(normalized);
  },
});

// Comments

export const listComments = query({
  args: { postId: v.string() },
  handler: async (ctx, { postId }) => {
    const normalized = ctx.db.normalizeId("posts", postId);
    if (!normalized) return [];
    return await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", normalized))
      .order("asc")
      .collect();
  },
});

export const addComment = mutation({
  args: {
    postId: v.string(),
    authorUserId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, { postId, authorUserId, content }) => {
    const normalized = ctx.db.normalizeId("posts", postId);
    if (!normalized) throw new Error("Post not found");
    return await ctx.db.insert("comments", {
      postId: normalized,
      authorUserId,
      content,
      createdAt: Date.now(),
    });
  },
});

export const deleteComment = mutation({
  args: { commentId: v.string(), authorUserId: v.string() },
  handler: async (ctx, { commentId, authorUserId }) => {
    const normalized = ctx.db.normalizeId("comments", commentId);
    if (!normalized) throw new Error("Comment not found");
    const comment = await ctx.db.get(normalized);
    if (!comment) throw new Error("Comment not found");
    if (comment.authorUserId !== authorUserId) throw new Error("Unauthorized");
    await ctx.db.delete(normalized);
  },
});

// Likes

export const likeCount = query({
  args: { postId: v.string() },
  handler: async (ctx, { postId }) => {
    const normalized = ctx.db.normalizeId("posts", postId);
    if (!normalized) return 0;
    const likes = await ctx.db
      .query("postLikes")
      .withIndex("by_post", (q) => q.eq("postId", normalized))
      .collect();
    return likes.length;
  },
});

export const isLiked = query({
  args: { postId: v.string(), userId: v.string() },
  handler: async (ctx, { postId, userId }) => {
    const normalized = ctx.db.normalizeId("posts", postId);
    if (!normalized) return false;
    const like = await ctx.db
      .query("postLikes")
      .withIndex("by_post_user", (q) => q.eq("postId", normalized).eq("userId", userId))
      .unique();
    return !!like;
  },
});

export const toggleLike = mutation({
  args: { postId: v.string(), userId: v.string() },
  handler: async (ctx, { postId, userId }) => {
    const normalized = ctx.db.normalizeId("posts", postId);
    if (!normalized) throw new Error("Post not found");
    const existing = await ctx.db
      .query("postLikes")
      .withIndex("by_post_user", (q) => q.eq("postId", normalized).eq("userId", userId))
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
      return false;
    }
    await ctx.db.insert("postLikes", { postId: normalized, userId });
    return true;
  },
});

export const seedPosts = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("posts").first();
    if (existing) return { message: "Posts already seeded." };

    const samplePosts = [
      {
        authorUserId: "mentor-001",
        title: "Leone Makeover is offering a 35% discount this weekend",
        excerpt: "Local beauty brand Leone Makeover is running a limited-time weekend sale, slashing prices by 35% across their full range of skincare and cosmetics.",
        content: `Local beauty brand Leone Makeover is running a limited-time weekend sale, slashing prices by 35% across their full range of skincare and cosmetics. Don't miss out on this exclusive offer available only through UN Women Market Square.\n\nThe sale covers all of their bestselling products including shea butter moisturizers, natural hair oils, and artisanal soaps made right here in Freetown. Founder Aminata Bangura started the business from her home in 2019 and has since grown it into one of the most-loved beauty brands on our platform.\n\n"We want every woman in Sierra Leone to be able to afford quality skincare," Aminata told our team. "This discount is our way of saying thank you to our loyal customers."\n\nThe sale runs from Friday evening through Sunday midnight. Shop now before stock runs out.`,
        category: "Business Growth",
        imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80",
        published: true,
        createdAt: Date.now() - 20 * 60 * 1000,
      },
      {
        authorUserId: "mentor-002",
        title: "Saint Mary Supermarket is now on UN Women Market",
        excerpt: "We're excited to welcome Saint Mary Supermarket to our growing marketplace. Browse their wide selection of household essentials and fresh produce.",
        content: `We're excited to welcome Saint Mary Supermarket to our growing marketplace. Browse their wide selection of household essentials, fresh produce, and everyday goods — all available for delivery in Freetown.\n\nSaint Mary Supermarket has been a staple in the Congo Town community for over a decade. Owner Mary Bangura decided to bring her store online after seeing the success other vendors were having on the platform.\n\n"My customers kept asking me to go online," Mary said. "Now they can order from me without leaving home, and I can reach customers across the whole city."\n\nThe supermarket carries over 500 products including local produce, imported goods, household cleaning supplies, and fresh bakery items baked daily. Delivery is available within Freetown for orders above Le 50,000.`,
        category: "New Vendor",
        imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
        published: true,
        createdAt: Date.now() - 2 * 60 * 60 * 1000,
      },
      {
        authorUserId: "mentor-003",
        title: "5 women entrepreneurs share how mentorship changed their business",
        excerpt: "From struggling with cash flow to landing their first bulk orders, five vendors on our platform open up about the transformative impact of being matched with a mentor.",
        content: `From struggling with cash flow to landing their first bulk orders, five vendors on our platform open up about the transformative impact of being matched with a mentor through UN Women Market Square.\n\n**1. Kadiatu, Fabric Vendor, Kenema**\n"Before my mentor, I was buying fabric in small quantities and losing money on transport. She helped me form a buying group with three other vendors. We now order together and save 30% on costs."\n\n**2. Fanta, Soap Maker, Bo**\n"I had no idea how to price my products. I was selling below cost and didn't even know it. My mentor showed me how to calculate real cost price including my time. I was shocked."\n\n**3. Mariama, Fashion Designer, Freetown**\n"My mentor connected me with a buyer in the UK who now orders 50 pieces every three months. That single relationship changed my entire business."\n\n**4. Hawa, Food Processor, Makeni**\n"She helped me get certified by the Sierra Leone Standards Bureau. Now I can supply to hotels and supermarkets — markets that were closed to me before."\n\n**5. Isatu, Cosmetics Seller, Freetown**\n"I was about to give up. My mentor gave me the confidence to keep going and the tools to make it work. Now I have three staff and my own shop."`,
        category: "Community",
        imageUrl: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80",
        published: true,
        createdAt: Date.now() - 24 * 60 * 60 * 1000,
      },
      {
        authorUserId: "mentor-004",
        title: "How to write a product listing that converts — a vendor guide",
        excerpt: "Your product photo and description are your storefront. Here's a step-by-step guide from our top-performing vendors on crafting listings that attract buyers.",
        content: `Your product photo and description are your storefront. Here's a step-by-step guide from our top-performing vendors on crafting listings that attract buyers and drive repeat purchases.\n\n**1. Start with your best photo**\nUse natural light and a clean background. Buyers trust products they can see clearly. If you're selling clothing, show it on a person or mannequin. If it's food, show the finished product plated or packaged.\n\n**2. Write a title that says exactly what it is**\nBad: "Nice cream"\nGood: "Handmade shea butter body cream – 200ml, unscented"\n\nInclude size, quantity, material, or any key specification a buyer would search for.\n\n**3. List the benefits, not just the features**\nInstead of "Contains shea butter," write "Deeply moisturises in under 60 seconds — perfect for dry skin in the harmattan season."\n\n**4. Price fairly and confidently**\nResearch what similar products sell for. Don't undervalue your work. Buyers often assume higher price = higher quality.\n\n**5. Update your listing regularly**\nFresh listings rank higher in our search. Update your description or add a new photo every few weeks to stay visible.`,
        category: "Tips & Guides",
        imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
        published: true,
        createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
      },
    ];

    for (const post of samplePosts) {
      await ctx.db.insert("posts", post);
    }
    return { message: `${samplePosts.length} posts seeded.` };
  },
});
