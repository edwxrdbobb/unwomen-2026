/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as blog from "../blog.js";
import type * as broadcasts from "../broadcasts.js";
import type * as businesses from "../businesses.js";
import type * as categories from "../categories.js";
import type * as mentorship from "../mentorship.js";
import type * as messages from "../messages.js";
import type * as products from "../products.js";
import type * as profiles from "../profiles.js";
import type * as search from "../search.js";
import type * as userMetadata from "../userMetadata.js";
import type * as wishlists from "../wishlists.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  blog: typeof blog;
  broadcasts: typeof broadcasts;
  businesses: typeof businesses;
  categories: typeof categories;
  mentorship: typeof mentorship;
  messages: typeof messages;
  products: typeof products;
  profiles: typeof profiles;
  search: typeof search;
  userMetadata: typeof userMetadata;
  wishlists: typeof wishlists;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
