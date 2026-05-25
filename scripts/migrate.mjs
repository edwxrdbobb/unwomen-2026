/**
 * One-time migration: db_un.sql → Convex
 * Run: node scripts/migrate.mjs
 *
 * What it does:
 *  1. Seeds 8 product categories
 *  2. Imports 599 users  (password set to Welcome123!)
 *  3. Imports 244 products (image filenames only, no base URL)
 *  4. Imports 112 businesses (image filename only, businessSize prepended to description)
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Load .env.local ─────────────────────────────────────────────────────────
const envFile = path.join(__dirname, "../.env.local");
const envVars = fs.readFileSync(envFile, "utf-8")
  .split("\n")
  .reduce((acc, line) => {
    const eq = line.indexOf("=");
    if (eq > 0) acc[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
    return acc;
  }, {});

const CONVEX_URL = envVars["NEXT_PUBLIC_CONVEX_URL"];
if (!CONVEX_URL) throw new Error("NEXT_PUBLIC_CONVEX_URL not found in .env.local");

const client = new ConvexHttpClient(CONVEX_URL);
const sql = fs.readFileSync(path.join(__dirname, "../db_un.sql"), "utf-8");

// ── SQL parser ───────────────────────────────────────────────────────────────
function extractInsertBlock(tableName) {
  const re = new RegExp(
    `INSERT INTO \`${tableName}\` VALUES ([\\s\\S]+?);\\s*\n(?:UNLOCK|/\\*)`,
    "m"
  );
  const m = sql.match(re);
  return m ? m[1] : null;
}

function parseSqlRows(text) {
  const rows = [];
  let i = 0;
  const n = text.length;

  function skipWs() { while (i < n && /\s/.test(text[i])) i++; }

  function readString() {
    i++; // skip opening '
    let s = "";
    while (i < n) {
      if (text[i] === "\\") {
        i++;
        const e = text[i++];
        s += e === "n" ? "\n" : e === "r" ? "\r" : e === "0" ? "\0" : e;
      } else if (text[i] === "'") {
        if (text[i + 1] === "'") { s += "'"; i += 2; }
        else { i++; break; }
      } else {
        s += text[i++];
      }
    }
    return s;
  }

  function readValue() {
    skipWs();
    if (i >= n) return null;
    if (text[i] === "'") return readString();
    if (text.slice(i, i + 4) === "NULL") { i += 4; return null; }
    let num = "";
    while (i < n && /[0-9.\-+eE]/.test(text[i])) num += text[i++];
    return num === "" ? null : (num.includes(".") ? parseFloat(num) : parseInt(num, 10));
  }

  while (i < n) {
    skipWs();
    if (text[i] !== "(") { i++; continue; }
    i++; // skip (
    const row = [];
    while (i < n) {
      skipWs();
      if (text[i] === ")") { i++; break; }
      if (text[i] === ",") { i++; continue; }
      row.push(readValue());
    }
    if (row.length) rows.push(row);
    skipWs();
    if (text[i] === ",") i++;
  }
  return rows;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const ROLE_MAP = {
  Admin: "super_admin",
  Vendor: "vendor",
  Mentor: "mentor",
  Customer: "buyer",
  undefined: "buyer",
  user: "buyer",
};

const CAT_MAP = {
  "Food": "Food & Agriculture",
  "Household": "Household",
  "Beauty": "Beauty & Cosmetics",
  "Apparel": "Apparel & Fashion",
  "Electronics": "Electronics",
  "Stationary": "Stationery & Office",
  "Services": "Services",
  "Others": "General & Others",
  "Select Category": "General & Others",
};

function filename(url) {
  if (!url) return null;
  return url.split("/").pop() || null;
}

function log(msg) { process.stdout.write(msg + "\n"); }
function progress(label, done, total) {
  process.stdout.write(`\r  ${label}: ${done}/${total}`);
  if (done === total) process.stdout.write("\n");
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  log("\n🚀 UN Women Market Square — SQL → Convex Migration\n");

  // 1. Seed categories
  log("📂 Seeding categories...");
  const catResult = await client.mutation(api.migration.seedCategories, {});
  log(`   ✓ ${catResult.seeded} seeded, ${catResult.skipped} already existed\n`);

  // 2. Parse users
  log("👥 Parsing users...");
  const userBlock = extractInsertBlock("users");
  if (!userBlock) throw new Error("No users INSERT found in SQL");
  const userRows = parseSqlRows(userBlock);
  log(`   Found ${userRows.length} users\n`);

  // users columns: id(0), uuid(1), name(2), email(3), phoneNo(4), homeAddress(5),
  //                role(6), password(7), url(8), Active(9), Deleted(10), ...
  const oldIdToConvexId = {};
  let uImported = 0, uSkipped = 0, uFailed = 0;

  for (let idx = 0; idx < userRows.length; idx++) {
    const row = userRows[idx];
    const [oldId, , name, email, phoneNo, homeAddress, roleRaw, , url, active, deleted] = row;

    // Skip soft-deleted or inactive
    if (deleted === 1 || active === 0) { uSkipped++; continue; }
    if (!email || !name) { uSkipped++; continue; }

    const role = ROLE_MAP[roleRaw] ?? "buyer";
    const profileImageUrl = filename(url) ?? undefined;

    try {
      const result = await client.mutation(api.migration.importUser, {
        name: String(name),
        email: String(email),
        phoneNo: phoneNo ? String(phoneNo) : undefined,
        location: homeAddress ? String(homeAddress) : undefined,
        profileImageUrl,
        role,
      });
      oldIdToConvexId[oldId] = result.id;
      if (result.skipped) uSkipped++; else uImported++;
    } catch (err) {
      log(`\n   ⚠ User ${email}: ${err.message}`);
      uFailed++;
    }
    progress("Users", idx + 1, userRows.length);
  }
  log(`   ✓ ${uImported} imported, ${uSkipped} skipped, ${uFailed} failed\n`);

  // 3. Parse product images (productId → string[])
  log("🖼  Parsing product images...");
  const imgBlock = extractInsertBlock("ProductImage");
  const productImages = {};
  if (imgBlock) {
    // columns: id(0), uuid(1), userId(2), productId(3),
    //          productImageOne(4), Two(5), Three(6), Four(7), Five(8), Six(9), ...
    const imgRows = parseSqlRows(imgBlock);
    for (const row of imgRows) {
      const productId = row[3];
      const slots = [row[4], row[5], row[6], row[7], row[8], row[9]];
      const names = slots.map(filename).filter(Boolean);
      if (names.length) productImages[productId] = names;
    }
    log(`   ✓ Images mapped for ${Object.keys(productImages).length} products\n`);
  } else {
    log("   ⚠ No ProductImage INSERT found, all imageUrls will be []\n");
  }

  // 4. Parse & import products
  log("📦 Parsing products...");
  const productBlock = extractInsertBlock("product");
  if (!productBlock) throw new Error("No product INSERT found in SQL");
  const productRows = parseSqlRows(productBlock);
  log(`   Found ${productRows.length} products\n`);

  // product columns: id(0), uuid(1), productName(2), productLocation(3), userId(4),
  //                  discription(5), previousPrice(6), currentPrice(7), category(8),
  //                  Active(9), Deleted(10), ...
  let pImported = 0, pSkipped = 0, pFailed = 0;

  for (let idx = 0; idx < productRows.length; idx++) {
    const row = productRows[idx];
    const [oldId, , productName, productLocation, userId, discription,
           previousPrice, currentPrice, categoryRaw, active, deleted] = row;

    if (deleted === 1 || active === 0) { pSkipped++; continue; }
    if (!productName || currentPrice == null) { pSkipped++; continue; }

    const vendorUserId = oldIdToConvexId[userId];
    if (!vendorUserId) { pSkipped++; continue; } // user wasn't migrated

    const category = CAT_MAP[categoryRaw] ?? "General & Others";
    const imageUrls = productImages[oldId] ?? [];

    try {
      await client.mutation(api.migration.importProduct, {
        vendorUserId,
        productName: String(productName),
        productLocation: String(productLocation ?? ""),
        category,
        discription: String(discription ?? ""),
        currentPrice: Number(currentPrice),
        previousPrice: Number(previousPrice ?? 0),
        imageUrls,
      });
      pImported++;
    } catch (err) {
      log(`\n   ⚠ Product "${productName}": ${err.message}`);
      pFailed++;
    }
    progress("Products", idx + 1, productRows.length);
  }
  log(`   ✓ ${pImported} imported, ${pSkipped} skipped, ${pFailed} failed\n`);

  // 5. Parse & import businesses
  log("🏢 Parsing businesses...");
  const bizBlock = extractInsertBlock("businessProfile");
  if (!bizBlock) throw new Error("No businessProfile INSERT found in SQL");
  const bizRows = parseSqlRows(bizBlock);
  log(`   Found ${bizRows.length} businesses\n`);

  // businessProfile columns:
  //  id(0), uuid(1), userId(2), businessName(3), tagLine(4), businessSize(5),
  //  businessAddress(6), businessBiography(7), businessLogo(8),
  //  registredCertificate(9), businessCategory(10),
  //  Active(11), Deleted(12), ...(audit fields)...,
  //  businessEmail(last-2), businessPhoneNo(last-1) [appended columns]
  let bImported = 0, bSkipped = 0, bFailed = 0;

  for (let idx = 0; idx < bizRows.length; idx++) {
    const row = bizRows[idx];
    const [, , userId, businessName, , businessSize,
           businessAddress, businessBiography, businessLogo, ,
           businessCategory, active, deleted] = row;

    // businessEmail and businessPhoneNo are the last two columns
    const businessEmail = row[row.length - 2];
    const businessPhone = row[row.length - 1];

    if (deleted === 1 || active === 0) { bSkipped++; continue; }
    if (!businessName) { bSkipped++; continue; }

    const vendorUserId = oldIdToConvexId[userId];
    if (!vendorUserId) { bSkipped++; continue; }

    // Valid Convex category values: SME, MACRO, MICRO, SOHO
    const VALID_BIZ_CATS = ["SME", "MACRO", "MICRO", "SOHO"];
    const category = VALID_BIZ_CATS.includes(businessCategory) ? businessCategory : "SME";

    // Prepend businessSize to description
    const sizeNote = businessSize ? `Business size: ${businessSize} employees.\n\n` : "";
    const description = `${sizeNote}${businessBiography ?? ""}`.trim();

    const logoFilename = filename(businessLogo);
    const imageUrls = logoFilename ? [logoFilename] : [];

    try {
      await client.mutation(api.migration.importBusiness, {
        vendorUserId,
        businessName: String(businessName),
        businessLocation: String(businessAddress ?? ""),
        category,
        description,
        imageUrls,
        contactEmail: businessEmail ? String(businessEmail) : undefined,
        contactPhone: businessPhone ? String(businessPhone) : undefined,
      });
      bImported++;
    } catch (err) {
      log(`\n   ⚠ Business "${businessName}": ${err.message}`);
      bFailed++;
    }
    progress("Businesses", idx + 1, bizRows.length);
  }
  log(`   ✓ ${bImported} imported, ${bSkipped} skipped, ${bFailed} failed\n`);

  log("✅ Migration complete!\n");
  log("⚠  All imported users have password: Welcome123!");
  log("   Advise users to change their password after first login.\n");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
