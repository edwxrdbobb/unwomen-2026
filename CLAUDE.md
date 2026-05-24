# UN Women Market Square — Project Guide

A Next.js + Convex marketplace for women-led businesses in Sierra Leone. Vendors sell products, businesses can request mentors, mentors track their mentees, and a super admin oversees everything.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database / realtime | Convex (`convex/` folder) |
| Auth | Legacy REST API (`unwomenmarketsquare.online`) |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Toasts | react-hot-toast |

---

## Auth Pattern

Authentication is **not** in Convex. The legacy backend at `https://unwomenmarketsquare.online` handles login/signup and issues a JWT stored in `localStorage` as `"token"`. The `AuthContext` (`src/context/AuthContext.tsx`) loads the current user by calling `/me` with that token.

The `user` object from `useAuth()` has shape:
```ts
{ id: number; name: string; email: string; phoneNo: string; role: string; profileImage?: string }
```

**Convex user references** use `String(user.id)` — always a string even though the legacy ID is a number.

**Feature flag:** `USE_CONVEX_PRODUCTS` (`src/config/features.ts`) is `true` when `NEXT_PUBLIC_CONVEX_URL` is set in `.env.local`. All Convex-aware components check this flag and fall back to the legacy REST API when it's false.

After login, call `api.profiles.upsert` to sync the user's data into Convex so their public profile is browseable.

---

## User Roles

| Role | String value | Capabilities |
|---|---|---|
| Buyer | `"buyer"` | Browse products, wishlist products, view vendor/business profiles |
| Vendor | `"vendor"` | All buyer capabilities + create/manage products + create/manage businesses + request a mentor |
| Mentor | `"mentor"` | View assigned mentees, track progress, send messages to mentees |
| Super Admin | `"super_admin"` | Full control: manage all users, approve mentorship requests, connect vendors to mentors, end mentorships |

---

## Convex Data Model

All tables live in `convex/schema.ts`. User references are **string** (the legacy user ID via `String(user.id)`).

### `products`
Vendor products for the shop.
```
vendorUserId  string          — owner (legacy user ID as string)
productName   string
productLocation string
category      string
discription   string          — note: intentional typo kept for schema consistency
currentPrice  number
previousPrice number
imageUrls     string[]
```
Indexes: `by_vendor`

### `profiles`
Public-facing profile for any user. Synced from the legacy auth data on login.
```
userId        string          — legacy user ID as string
name          string
email         string
role          "buyer" | "vendor" | "mentor" | "super_admin"
bio           string?
profileImageUrl string?
phoneNo       string?
location      string?
expertise     string?         — for mentors
isVerified    boolean
```
Indexes: `by_userId`, `by_role`

### `businesses`
A vendor's business entity (separate from their personal product listings).
```
vendorUserId     string
businessName     string
businessLocation string
category         string       — "SME" | "MACRO" | "MICRO" | "SOHO" (see BUSINESS_CATEGORIES)
description      string
imageUrls        string[]
contactEmail     string?
contactPhone     string?
website          string?
```
Indexes: `by_vendor`, `by_category`

### `wishlists`
Many-to-many between users and products. Replaces cart — there is no cart.
```
userId     string
productId  Id<"products">
```
Indexes: `by_user`, `by_product`, `by_user_product`

### `mentorshipRequests`
A vendor requests a mentor connection for one of their businesses.
```
vendorUserId     string
businessId       Id<"businesses">
mentorId         string?      — specific mentor requested, or omit for "any"
message          string?
status           "pending" | "accepted" | "rejected"
createdAt        number
reviewedAt       number?
reviewedBy       string?      — admin userId
assignedMentorId string?      — mentor assigned by admin
```
Indexes: `by_vendor`, `by_status`, `by_mentor`

### `mentorships`
Active mentoring relationship between a mentor and a vendor/business.
```
mentorId      string
menteeUserId  string          — the vendor being mentored
businessId    Id<"businesses">
requestId     Id<"mentorshipRequests">
startedAt     number
isActive      boolean
progressNotes string?
```
Indexes: `by_mentor`, `by_mentee`, `by_mentor_active`

### `messages`
One-to-one messages within a mentorship thread (mentor ↔ mentee only).
```
mentorshipId  Id<"mentorships">
fromUserId    string
toUserId      string
content       string
createdAt     number
read          boolean
```
Indexes: `by_mentorship`, `by_recipient_read`

---

## Convex Functions

Import path alias: `@cvx` → `./convex/` (configured in `tsconfig.json`)

```ts
import { api } from "@cvx/_generated/api"
```

### `api.products`
| Function | Type | Description |
|---|---|---|
| `list` | query | All products, newest first |
| `listByVendor({ vendorUserId })` | query | Vendor's own products |
| `getById({ id })` | query | Single product by Convex ID string |
| `create({ vendorUserId, ...fields })` | mutation | Create product |
| `update({ id, vendorUserId, ...fields })` | mutation | Update product (owner only) |
| `remove({ id, vendorUserId })` | mutation | Delete product (owner only) |
| `seedIfEmpty()` | mutation | Insert sample data if table is empty |

### `api.profiles`
| Function | Type | Description |
|---|---|---|
| `upsert({ userId, name, email, role, ... })` | mutation | Sync profile from legacy auth — call on login |
| `get({ userId })` | query | Get profile by legacy user ID |
| `getById({ id })` | query | Get profile by Convex doc ID |
| `listByRole({ role })` | query | Browse all vendors, mentors, etc. |
| `update({ userId, bio, location, expertise, ... })` | mutation | Update own profile |
| `setVerified({ targetUserId, adminUserId, isVerified })` | mutation | Admin verifies a profile |

### `api.businesses`
| Function | Type | Description |
|---|---|---|
| `create({ vendorUserId, ...fields })` | mutation | Vendor creates a business |
| `update({ id, vendorUserId, ...fields })` | mutation | Update business (owner only) |
| `remove({ id, vendorUserId })` | mutation | Delete business (owner only) |
| `list()` | query | All businesses (public browse) |
| `getById({ id })` | query | Single business |
| `listByVendor({ vendorUserId })` | query | Vendor's businesses |
| `listByCategory({ category })` | query | Filter by SME/MACRO/MICRO/SOHO |

### `api.wishlists`
| Function | Type | Description |
|---|---|---|
| `add({ userId, productId })` | mutation | Add to wishlist (idempotent) |
| `remove({ userId, productId })` | mutation | Remove from wishlist |
| `toggle({ userId, productId })` | mutation | Toggle — returns `true` if added, `false` if removed |
| `listByUser({ userId })` | query | User's full wishlist with product docs |
| `isWishlisted({ userId, productId })` | query | Boolean check |
| `countByProduct({ productId })` | query | How many users wishlisted this product |

### `api.mentorship`
| Function | Type | Description |
|---|---|---|
| `createRequest({ vendorUserId, businessId, mentorId?, message? })` | mutation | Vendor requests a mentor |
| `listRequests({ status? })` | query | Admin: all requests, optional status filter |
| `listRequestsByVendor({ vendorUserId })` | query | Vendor's own requests |
| `reviewRequest({ id, adminUserId, status, assignedMentorId? })` | mutation | Admin accepts/rejects without activating |
| `createMentorship({ requestId, adminUserId, mentorId })` | mutation | Admin accepts request + activates mentorship |
| `connectDirectly({ adminUserId, mentorId, menteeUserId, businessId })` | mutation | Admin bypasses request flow |
| `listByMentor({ mentorId })` | query | Mentor's mentees |
| `listByMentee({ menteeUserId })` | query | Vendor's mentors |
| `listAll()` | query | Admin: all mentorships |
| `updateProgress({ id, mentorId, progressNotes })` | mutation | Mentor updates notes |
| `endMentorship({ id, adminUserId })` | mutation | Admin deactivates mentorship |

### `api.messages`
| Function | Type | Description |
|---|---|---|
| `send({ mentorshipId, fromUserId, toUserId, content })` | mutation | Send a message |
| `listByMentorship({ mentorshipId })` | query | Full thread, oldest first |
| `markRead({ mentorshipId, userId })` | mutation | Mark all incoming as read |
| `unreadCount({ userId })` | query | Total unread across all threads |

---

## Route Structure

```
/                                    → home / landing
/auth/login                          → login
/auth/signup                         → signup
/products/shop                       → browse all products
/products/shop/category/[id]         → products filtered by category
/products/shop/category/business/[id] → products by business
/products/[id]                       → product detail page
/business/[id]                       → vendor/business public profile
/mentors                             → browse all mentors
/wishlist                            → user's saved products
/user/[id]                           → public user profile
/user/profile                        → own profile page

/user/dashboard/vendor               → vendor dashboard (product count from Convex)
/user/dashboard/vendor/products      → manage products list
/user/dashboard/vendor/products/create → create product
/user/dashboard/vendor/products/edit/[id] → edit product
/user/dashboard/vendor/profile       → vendor profile editor
/user/dashboard/vendor/business      → (to build) manage businesses

/user/dashboard/mentor               → mentor dashboard
/user/dashboard/mentor/profile       → mentor profile
/user/dashboard/mentor/mentees       → (to build) mentee list + progress
/user/dashboard/mentor/messages      → (to build) messaging

/user/dashboard/admin                → (to build) super admin dashboard
```

Pages that still need to be built are marked `(to build)`.

---

## What's Built vs What Needs Building

### Done (Convex-backed)
- Product CRUD for vendors
- Product browse / detail page with Convex fallback
- Vendor dashboard product stats
- Wishlist schema + functions (UI still uses localStorage — needs migration)

### Needs UI implementation
- `profiles` sync on login (call `api.profiles.upsert` in `AuthContext` after successful `/me` fetch)
- Business create / manage pages (`/user/dashboard/vendor/business`)
- Business public browse page (`/business/[id]` currently uses legacy API)
- Mentor browse page (`/mentors`)
- Wishlist page — migrate from localStorage to `api.wishlists`
- Mentor dashboard: mentee list, progress notes, messaging
- Vendor mentorship request flow
- Super admin dashboard: user list, request queue, mentorship management

---

## Development Commands

```bash
npm run dev           # Next.js dev server
npm run convex:dev    # Convex dev server (run alongside Next)
npm run convex:seed   # Seed sample products (skips if data already exists)
npm run build         # Production build
```

Run both `npm run dev` and `npm run convex:dev` simultaneously during local development.

---

## Conventions

- **Convex user IDs** are always `String(user.id)` (converting the numeric legacy ID).
- **Schema typo** `discription` is intentional — it matches the existing Convex table and must not be changed without a migration.
- **`USE_CONVEX_PRODUCTS`** gates all Convex reads/writes. Components render a legacy REST fallback when it's false.
- **`@cvx/*`** is the tsconfig path alias for `./convex/*`.
- **`@/*`** is the tsconfig path alias for `./src/*`.
- No cart — wishlist only. Cart-related pages (`/cart`, `/checkout`) are legacy and should be removed or left unused.
- Business categories are fixed: `"SME"`, `"MACRO"`, `"MICRO"`, `"SOHO"` (see `src/types/businesses.ts`).
