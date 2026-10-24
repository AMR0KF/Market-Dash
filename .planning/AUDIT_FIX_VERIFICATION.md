# MarketDash — Audit Fix Verification

**Date:** 2026-07-28
**Purpose:** Re-verify every finding from the initial full-app audit and the follow-up "add-to-cart → checkout" fix plan against the current code, file by file. This is a status snapshot, not a living spec — re-run the checks below before trusting it if significant time has passed.

## Legend
✅ Fixed and verified against current code · ⚠️ Partially fixed / new gap introduced · ❌ Still open (as expected or not yet addressed)

---

## Critical (original audit)

| # | Finding | Status | Notes |
|---|---|---|---|
| 1 | JWT secret hardcoded fallback, `dotenv` never loaded | ✅ Fixed | [server.ts](server.ts) now has `import 'dotenv/config'`. [authController.ts](server/src/controllers/authController.ts) throws a fatal error at boot if `JWT_SECRET`/`JWT_REFRESH_SECRET` are unset in production, only falling back in dev. Residual: [middleware/auth.ts:20](server/src/middleware/auth.ts#L20) still does `process.env.JWT_SECRET \|\| 'dev-secret...'` with no production check — low severity since `authController.ts` would already crash the process at boot first if the secret were missing in a real `NODE_ENV=production` run. |
| 2 | Unauthenticated `/api/dev/*` + footer buttons on every page | ✅ Fixed | [server.ts](server.ts) gates the route behind `NODE_ENV !== 'production'`; [Footer.tsx](src/components/layout/Footer.tsx) hides the Dev Tools block the same way. |
| 3 | Public `/api/admin/customers` | ✅ Fixed | `authenticate` + `adminOnly` added in [routes/admin.ts](server/src/routes/admin.ts). |
| 4 | Fake admin auth (guard commented out, fake login) | ✅ Fixed | Real guard restored in [AdminApp.tsx](src/admin/AdminApp.tsx); [AdminLogin.tsx](src/admin/pages/AdminLogin.tsx) now calls the real `/api/auth/admin/login` endpoint. |

## High (original audit)

| # | Finding | Status | Notes |
|---|---|---|---|
| 5 | Docker deployment broken (no `server/package.json`, no `start` script) | ⚠️ Still broken, different reason | `server/package.json` was added with `start`/`dev` scripts pointing to `tsx ../server.ts` — but the real `server.ts` lives at the **repo root**, outside `./server`. `docker-compose.yml`'s server build context is `./server` only, so Docker cannot copy `../server.ts` into the image. Also `server/Dockerfile` runs `npm run build`, but the new `server/package.json` has no `build` script and no `vite` dependency to produce the `dist/` it then tries to copy. **The Docker server image still cannot build.** |
| 6 | Prisma hardcoded to SQLite, ignoring `DATABASE_URL` | ⚠️ Partially fixed | [schema.prisma](prisma/schema.prisma) now reads `url = env("DATABASE_URL")`. `provider = "sqlite"` is unchanged, while `docker-compose.yml` passes a `postgresql://...` URL — Prisma will fail at generate/runtime against that provider mismatch. Fine for local dev with a `file:` URL; still broken for the Postgres/Docker path. |
| 7 | Stock TOCTOU race | ✅ Fixed | Atomic `tx.product.updateMany` with a `stock: { gte }` guard in [orderController.ts](server/src/controllers/orderController.ts). |
| 8 | Currency/delivery-fee unit bug | ✅ Fixed | Backend thresholds and [CartPage.tsx](src/pages/CartPage.tsx) copy all consistently say $50 / $5. |
| 9 | Admin order UI called wrong endpoints | ⚠️ Mostly fixed, one gap | [OrderList.tsx](src/admin/pages/OrderList.tsx) / [Dashboard.tsx](src/admin/pages/Dashboard.tsx) now hit real `/orders/admin/all` and `/orders/admin/stats`. A new `GET /orders/admin/:orderId` route was added in [routes/orders.ts](server/src/routes/orders.ts) but wired to the **customer-scoped** `getOrderById` handler, which filters by `userId: req.user!.id` — an admin's JWT id is never a customer's, so this always 404s (masked by [OrderDetail.tsx](src/admin/pages/OrderDetail.tsx)'s mock-data fallback). Needs a separate `getAdminOrderById` with no `userId` filter. Separately, `OrderDetail.tsx`'s status-update button still calls `PUT /orders/${id}/status` (missing the `/admin` prefix) — fails visibly with an alert. |
| 10 | Image upload not wired (blob URLs) | ✅ Fixed | [ImageUploader.tsx](src/admin/components/ImageUploader.tsx) calls the real `POST /products/upload`, only falling back to a local blob URL if the network call itself fails. |
| 11 | Raw `error.message` leaked to clients | ❌ Still open | Explicitly out of scope of the fix plan; present in every controller. |
| 12 | Dependency vulnerabilities | ❌ Still open | `npm audit` still reports 16 vulnerabilities (1 critical, 8 high). No version bumps applied. |

## Medium

| Finding | Status | Notes |
|---|---|---|
| Admin cancel (`updateOrderStatus`) didn't restore stock | ✅ Fixed | Now transactional, restores stock on transition to `CANCELLED`. Not part of the original fix plan — a bonus fix. |
| Multer: no file-type/size filter | ❌ Still open | [routes/products.ts](server/src/routes/products.ts) upload middleware unchanged. |
| No rate limiting on auth endpoints | ❌ Still open | No `express-rate-limit` dependency anywhere. |
| No pagination cap | ❌ Still open | `parseInt(limit)` unbounded in `orderController.ts` / `productController.ts`. |
| No input validation on product/category create/update | ❌ Still open | `productController.ts` / `categoryController.ts` unchanged, raw passthrough to Prisma. |
| Cart quantity race (frontend) | ✅ Fixed | [cartStore.ts](src/store/cartStore.ts) has `pendingItemIds` / `isPending()`, wired into disabled states in `ProductCard.tsx`, `ProductDetail.tsx`, `CartPage.tsx`, `CartDrawer.tsx`. |
| `CartDrawer.tsx` swallowed errors | ✅ Fixed | Now uses `useCart()`'s wrapped handlers, shows toasts. |
| Checkout navigation race | ✅ Fixed | `isOrderPlacedRef` guard + non-blocking `fetchCart()` before navigating in [CheckoutPage.tsx](src/pages/CheckoutPage.tsx). |
| IDOR on `addressId` / unvalidated `paymentMethod` | ✅ Fixed | Both added to `placeOrder` in `orderController.ts`. |

## New issue introduced by the fixes (not in the original report)

**The real admin JWT is never sent anywhere.** [AdminLogin.tsx](src/admin/pages/AdminLogin.tsx) / [adminStore.ts](src/admin/store/adminStore.ts) now correctly obtain and store a real token — but under the key `admin_token`, in a store [src/api/index.ts](src/api/index.ts)'s axios client has never heard of. That client's request interceptor only ever reads `marketdash_token` (the customer key). Every admin page (`Dashboard`, `OrderList`, `OrderDetail`, `ProductForm`, `CategoryForm`, `CustomerList`, etc.) imports this same shared `api` instance, so **every admin-authenticated request now goes out with no Authorization header at all** and 401s against the (correctly) newly-protected endpoints. `Dashboard.tsx` / `OrderList.tsx` mask this with a try/catch → mock-data fallback, so the admin panel *looks* like it works while silently showing fake data; writes (status updates, product/category saves) fail with a visible error instead.

**Fix needed:** `src/api/index.ts`'s interceptor should also check `admin_token` (e.g. when the request path starts with `/admin` or the app is under `/admin/*`), or the admin app needs its own axios instance that reads from `adminStore`.

## Low (spot-checked, unchanged — none of these were in scope)
- `client/` dead folder still present
- No rate limiting
- CORS still wide open (`cors()` with no options)
- `@google/genai` still an unused dependency
- `npm audit` unchanged (16 vulnerabilities)

---

## Bottom line

All 5 items from the cart/checkout fix plan passed verification. Independently, nearly every Critical and most High findings from the original full-app audit were also fixed. Three things still need attention before this is production-ready:

1. **Admin token isn't attached to any request** — admin panel is silently non-functional against real data (see "New issue" above).
2. **New admin order-detail route reuses the wrong handler** — always 404s, masked by mock fallback.
3. **Docker server build is still broken** — different root cause than before (build context can't reach the real `server.ts`, and the new `server/package.json` has no `build` script).
