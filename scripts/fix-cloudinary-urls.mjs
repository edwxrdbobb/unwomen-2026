/**
 * Fetches all images from the Cloudinary account, builds a map of
 * original filename → Cloudinary secure_url, then updates every product
 * and business in Convex whose imageUrls don't yet point to Cloudinary.
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   NEXT_PUBLIC_CLOUDINARY_API_SECRET   (or CLOUDINARY_API_SECRET)
 *   NEXT_PUBLIC_CONVEX_URL
 */

import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));

// ── Load .env.local ───────────────────────────────────────────────────────────
const envPath = join(__dir, "../.env.local");
const envText = await readFile(envPath, "utf8");
const env = Object.fromEntries(
  envText
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const CLOUD_NAME  = env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const API_KEY     = env.CLOUDINARY_API_KEY ?? env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_API;
const API_SECRET  = env.CLOUDINARY_API_SECRET ?? env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;
const CONVEX_URL  = env.NEXT_PUBLIC_CONVEX_URL;

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.error("Missing Cloudinary credentials in .env.local");
  console.error(`  CLOUD_NAME: ${CLOUD_NAME ?? "MISSING"}`);
  console.error(`  API_KEY:    ${API_KEY ?? "MISSING"}`);
  console.error(`  API_SECRET: ${API_SECRET ? "set" : "MISSING"}`);
  process.exit(1);
}

// ── Fetch all Cloudinary resources (paginates automatically) ──────────────────
async function fetchAllResources() {
  const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString("base64");
  const base = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image`;
  const resources = [];
  let nextCursor = null;

  do {
    const url = new URL(base);
    url.searchParams.set("max_results", "500");
    if (nextCursor) url.searchParams.set("next_cursor", nextCursor);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Basic ${auth}` },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Cloudinary API error ${res.status}: ${text}`);
    }
    const data = await res.json();
    resources.push(...data.resources);
    nextCursor = data.next_cursor ?? null;
    console.log(`  Fetched ${resources.length} resources so far...`);
  } while (nextCursor);

  return resources;
}

// ── Build filename → URL map ───────────────────────────────────────────────────
// Cloudinary public_id is like "f849e27ab8028643b2ca3421e620f0ba_j1zyil"
// Original filename (from /products/ path) is like "f849e27ab8028643b2ca3421e620f0ba"
// We match by checking if the public_id starts with (or equals) the original filename.
function buildMap(resources) {
  const map = new Map(); // originalFilenameBase → secure_url
  for (const r of resources) {
    // Strip folder prefix if any (e.g. "unwomen_unsigned/abc" → "abc")
    const publicId = r.public_id.split("/").pop();
    map.set(publicId, r.secure_url);
  }
  return map;
}

// Set of all known good Cloudinary secure_urls for fast lookup
function buildUrlSet(resources) {
  return new Set(resources.map((r) => r.secure_url));
}

function resolveUrl(raw, map, validUrls) {
  // Already an exact match in our fetched resource list — truly correct
  if (validUrls.has(raw)) return null;

  // Extract filename from whatever path we have
  const filename = raw.split("/").pop();
  if (!filename) return null;
  const base = filename.replace(/\.[^.]+$/, ""); // strip extension

  // Direct match on public_id base
  if (map.has(base)) return map.get(base);

  // Prefix match — Cloudinary may have appended a suffix (_xxxxxx)
  for (const [key, url] of map) {
    if (key.startsWith(base)) return url;
  }
  return null; // no match found
}

// ── Convex HTTP API helpers ────────────────────────────────────────────────────
async function convexQuery(name, args = {}) {
  const res = await fetch(`${CONVEX_URL}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: name, args }),
  });
  const data = await res.json();
  if (data.status === "error") throw new Error(data.errorMessage);
  return data.value;
}

async function convexMutation(name, args = {}) {
  const res = await fetch(`${CONVEX_URL}/api/mutation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: name, args }),
  });
  const data = await res.json();
  if (data.status === "error") throw new Error(data.errorMessage);
  return data.value;
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log("Fetching Cloudinary resources...");
const resources = await fetchAllResources();
console.log(`Total resources: ${resources.length}\n`);

const map = buildMap(resources);
const validUrls = buildUrlSet(resources);

console.log("Fetching products and businesses from Convex...");
const products   = await convexQuery("products:list");
const businesses = await convexQuery("businesses:list");
console.log(`Products: ${products.length}, Businesses: ${businesses.length}\n`);

let updatedProducts = 0, skippedProducts = 0, unmatchedProducts = 0;
let updatedBusinesses = 0, skippedBusinesses = 0, unmatchedBusinesses = 0;

for (const product of products) {
  const newUrls = product.imageUrls.map((url) => resolveUrl(url, map, validUrls) ?? url);
  const changed = newUrls.some((u, i) => u !== product.imageUrls[i]);
  const hasUnmatched = product.imageUrls.some((url) => !validUrls.has(url) && !resolveUrl(url, map, validUrls));

  if (!changed) { skippedProducts++; continue; }
  if (hasUnmatched) { unmatchedProducts++; console.warn(`  [PRODUCT UNMATCHED] ${product.productName} → ${product.imageUrls}`); }

  await convexMutation("migration:patchProductImages", { id: product._id, imageUrls: newUrls });
  updatedProducts++;
  console.log(`  [PRODUCT] ${product.productName}`);
}

for (const biz of businesses) {
  const newUrls = biz.imageUrls.map((url) => resolveUrl(url, map, validUrls) ?? url);
  const changed = newUrls.some((u, i) => u !== biz.imageUrls[i]);
  const hasUnmatched = biz.imageUrls.some((url) => !validUrls.has(url) && !resolveUrl(url, map, validUrls));

  if (!changed) { skippedBusinesses++; continue; }
  if (hasUnmatched) { unmatchedBusinesses++; console.warn(`  [BIZ UNMATCHED] ${biz.businessName} → ${biz.imageUrls}`); }

  await convexMutation("migration:patchBusinessImages", { id: biz._id, imageUrls: newUrls });
  updatedBusinesses++;
  console.log(`  [BIZ] ${biz.businessName}`);
}

console.log(`
Done!
  Products:   ${updatedProducts} updated, ${skippedProducts} already correct, ${unmatchedProducts} unmatched
  Businesses: ${updatedBusinesses} updated, ${skippedBusinesses} already correct, ${unmatchedBusinesses} unmatched
`);
