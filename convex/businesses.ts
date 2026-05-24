import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    vendorUserId: v.string(),
    businessName: v.string(),
    businessLocation: v.string(),
    category: v.string(),
    description: v.string(),
    imageUrls: v.array(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("businesses", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("businesses"),
    vendorUserId: v.string(),
    businessName: v.optional(v.string()),
    businessLocation: v.optional(v.string()),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrls: v.optional(v.array(v.string())),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    website: v.optional(v.string()),
  },
  handler: async (ctx, { id, vendorUserId, ...fields }) => {
    const row = await ctx.db.get(id);
    if (!row || row.vendorUserId !== vendorUserId) {
      throw new Error("Business not found or permission denied");
    }
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("businesses"), vendorUserId: v.string() },
  handler: async (ctx, { id, vendorUserId }) => {
    const row = await ctx.db.get(id);
    if (!row || row.vendorUserId !== vendorUserId) {
      throw new Error("Business not found or permission denied");
    }
    await ctx.db.delete(id);
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("businesses").order("desc").collect();
  },
});

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const normalized = ctx.db.normalizeId("businesses", id);
    if (!normalized) return null;
    return await ctx.db.get(normalized);
  },
});

export const listByVendor = query({
  args: { vendorUserId: v.string() },
  handler: async (ctx, { vendorUserId }) => {
    return await ctx.db
      .query("businesses")
      .withIndex("by_vendor", (q) => q.eq("vendorUserId", vendorUserId))
      .order("desc")
      .collect();
  },
});

export const listByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, { category }) => {
    return await ctx.db
      .query("businesses")
      .withIndex("by_category", (q) => q.eq("category", category))
      .order("desc")
      .collect();
  },
});

/** Safe to call multiple times — skips if businesses already seeded. */
export const seedBusinesses = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("businesses").first();
    if (existing) return { inserted: 0, message: "Businesses already seeded." };

    const businesses = [
      // ── MICRO ───────────────────────────────────────────────────────────────
      {
        vendorUserId: "demo-vendor",
        businessName: "Fatmata's Gara Dyeing Studio",
        businessLocation: "Freetown, Sierra Leone",
        category: "MICRO",
        description: "Hand-crafted gara tie-dye fabrics made using traditional Sierra Leonean dyeing techniques passed down through generations.",
        imageUrls: ["https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80"],
        contactEmail: "fatmata.gara@gmail.com",
        contactPhone: "+232 76 123 456",
      },
      {
        vendorUserId: "demo-vendor",
        businessName: "Aminata Hair & Braiding Salon",
        businessLocation: "Bo, Sierra Leone",
        category: "MICRO",
        description: "Professional hair braiding, natural hair care, and beauty treatments using locally sourced natural products.",
        imageUrls: ["https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80"],
        contactEmail: "aminata.salon@gmail.com",
        contactPhone: "+232 78 234 567",
      },
      {
        vendorUserId: "demo-vendor",
        businessName: "Mariama's Kitchen & Catering",
        businessLocation: "Kenema, Sierra Leone",
        category: "MICRO",
        description: "Traditional Sierra Leonean cuisine for events, weddings, and everyday catering — fufu, jollof rice, groundnut soup and more.",
        imageUrls: ["https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80"],
        contactEmail: "mariamas.kitchen@gmail.com",
        contactPhone: "+232 77 345 678",
      },
      {
        vendorUserId: "demo-vendor",
        businessName: "Isata's Natural Soaps & Skincare",
        businessLocation: "Makeni, Sierra Leone",
        category: "MICRO",
        description: "Handmade natural soaps, shea butter creams, and herbal skincare products crafted for all skin types in Sierra Leone's climate.",
        imageUrls: ["https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80"],
        contactEmail: "isata.naturals@gmail.com",
        contactPhone: "+232 76 456 789",
      },
      {
        vendorUserId: "demo-vendor",
        businessName: "Adama's Beads & Crafts",
        businessLocation: "Port Loko, Sierra Leone",
        category: "MICRO",
        description: "Handcrafted beaded jewellery, woven baskets, and cultural artwork celebrating Sierra Leonean heritage and artisanship.",
        imageUrls: ["https://images.unsplash.com/photo-1573408301185-9519f94815b6?w=800&q=80"],
        contactEmail: "adama.beads@gmail.com",
        contactPhone: "+232 78 567 890",
      },
      // ── SOHO ────────────────────────────────────────────────────────────────
      {
        vendorUserId: "demo-vendor",
        businessName: "Bintu Fashion Studio",
        businessLocation: "Freetown, Sierra Leone",
        category: "SOHO",
        description: "Contemporary African fashion design combining wax print fabrics with modern silhouettes — custom orders and ready-to-wear.",
        imageUrls: ["https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80"],
        contactEmail: "bintufashion@gmail.com",
        contactPhone: "+232 79 678 901",
        website: "https://bintufashion.com",
      },
      {
        vendorUserId: "demo-vendor",
        businessName: "Hawa Digital Solutions",
        businessLocation: "Freetown, Sierra Leone",
        category: "SOHO",
        description: "Web design, mobile money consulting, social media management, and digital literacy training for women-led businesses.",
        imageUrls: ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"],
        contactEmail: "hawa.digital@gmail.com",
        contactPhone: "+232 76 789 012",
      },
      {
        vendorUserId: "demo-vendor",
        businessName: "Kadiatu's Tailoring House",
        businessLocation: "Bo, Sierra Leone",
        category: "SOHO",
        description: "Bespoke tailoring services for men, women, and children — school uniforms, formal wear, and traditional outfits.",
        imageUrls: ["https://images.unsplash.com/photo-1558171813-0c5a99a9b6e0?w=800&q=80"],
        contactEmail: "kadiatu.tailoring@gmail.com",
        contactPhone: "+232 78 890 123",
      },
      {
        vendorUserId: "demo-vendor",
        businessName: "Memunatu Office Supplies",
        businessLocation: "Makeni, Sierra Leone",
        category: "SOHO",
        description: "School stationery, office supplies, and printing services catering to students, teachers, and small businesses in Makeni.",
        imageUrls: ["https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800&q=80"],
        contactEmail: "memunatu.office@gmail.com",
        contactPhone: "+232 77 901 234",
      },
      {
        vendorUserId: "demo-vendor",
        businessName: "Sata Wellness & Herbal Centre",
        businessLocation: "Freetown, Sierra Leone",
        category: "SOHO",
        description: "Traditional herbal remedies, wellness consultations, and natural health products rooted in Sierra Leonean medicinal knowledge.",
        imageUrls: ["https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80"],
        contactEmail: "sata.wellness@gmail.com",
        contactPhone: "+232 79 012 345",
      },
      // ── SME ─────────────────────────────────────────────────────────────────
      {
        vendorUserId: "demo-vendor",
        businessName: "Sierra Shea Butter Collective",
        businessLocation: "Freetown, Sierra Leone",
        category: "SME",
        description: "A women's cooperative producing and exporting premium raw and refined shea butter, shea oil, and body care products nationally.",
        imageUrls: ["https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&q=80"],
        contactEmail: "sierrashea@gmail.com",
        contactPhone: "+232 76 111 222",
        website: "https://sierrashea.sl",
      },
      {
        vendorUserId: "demo-vendor",
        businessName: "Womenpreneur Foods Ltd",
        businessLocation: "Freetown, Sierra Leone",
        category: "SME",
        description: "Processing and packaging of local food staples — palm oil, dried pepper, bissap juice, and cassava flour for retail distribution.",
        imageUrls: ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"],
        contactEmail: "wpfoods@gmail.com",
        contactPhone: "+232 78 222 333",
      },
      {
        vendorUserId: "demo-vendor",
        businessName: "Kailahun Women Weavers",
        businessLocation: "Kailahun, Sierra Leone",
        category: "SME",
        description: "Community weaving enterprise producing handwoven country cloth, hammocks, and decorative textiles for local and export markets.",
        imageUrls: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80"],
        contactEmail: "kwweavers@gmail.com",
        contactPhone: "+232 77 333 444",
      },
      {
        vendorUserId: "demo-vendor",
        businessName: "Freetown Farm Market Co-op",
        businessLocation: "Freetown, Sierra Leone",
        category: "SME",
        description: "Women-run agricultural cooperative supplying fresh vegetables, fruits, and grains to markets, hotels, and restaurants in Freetown.",
        imageUrls: ["https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80"],
        contactEmail: "freemarket@gmail.com",
        contactPhone: "+232 76 444 555",
      },
      {
        vendorUserId: "demo-vendor",
        businessName: "SL Kids Boutique",
        businessLocation: "Freetown, Sierra Leone",
        category: "SME",
        description: "Children's clothing, toys, school bags, and accessories — stocking both local designs and quality imported items for Sierra Leonean families.",
        imageUrls: ["https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80"],
        contactEmail: "slkids@gmail.com",
        contactPhone: "+232 79 555 666",
      },
      // ── MACRO ───────────────────────────────────────────────────────────────
      {
        vendorUserId: "demo-vendor",
        businessName: "West Africa Women Trade Co.",
        businessLocation: "Freetown, Sierra Leone",
        category: "MACRO",
        description: "Regional trading company led by women importing and distributing clothing, textiles, and fashion goods across West Africa.",
        imageUrls: ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80"],
        contactEmail: "watrade@sierraleone.sl",
        contactPhone: "+232 76 666 777",
        website: "https://watrade.sl",
      },
      {
        vendorUserId: "demo-vendor",
        businessName: "SL Women's Agricultural Export",
        businessLocation: "Freetown, Sierra Leone",
        category: "MACRO",
        description: "Large-scale export of Sierra Leonean agricultural products — cocoa, coffee, and palm produce — connecting women farmers to global markets.",
        imageUrls: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80"],
        contactEmail: "slwae@sierraleone.sl",
        contactPhone: "+232 78 777 888",
        website: "https://slwae.sl",
      },
      {
        vendorUserId: "demo-vendor",
        businessName: "Sierra Craft Exports Ltd",
        businessLocation: "Freetown, Sierra Leone",
        category: "MACRO",
        description: "National craft export company sourcing handmade goods from over 500 women artisans across Sierra Leone for international buyers.",
        imageUrls: ["https://images.unsplash.com/photo-1556760544-74068565f05c?w=800&q=80"],
        contactEmail: "sierracraft@sierraleone.sl",
        contactPhone: "+232 77 888 999",
        website: "https://sierracraft.sl",
      },
    ];

    for (const b of businesses) {
      await ctx.db.insert("businesses", b);
    }
    return { inserted: businesses.length, message: "Businesses seeded successfully." };
  },
});
