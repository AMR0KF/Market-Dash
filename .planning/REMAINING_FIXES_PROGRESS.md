# MarketDash — Remaining Fixes Progress Tracker

**Started:** 2026-07-28
**Source:** Findings still open (❌) or partially fixed (⚠️) in [AUDIT_FIX_VERIFICATION.md](AUDIT_FIX_VERIFICATION.md).
This is a living checklist — update status/notes as items get fixed. Don't re-derive from scratch; append to it.

Legend: `[ ]` not started · `[~]` in progress · `[x]` done and verified

---

## Blocker (breaks the admin panel / deployment right now)

- [ ] **Admin token never attached to requests.** [src/api/index.ts](src/api/index.ts)'s axios interceptor only reads `marketdash_token`; the real admin JWT is stored under `admin_token` by [adminStore.ts](src/admin/store/adminStore.ts) and never sent. Every admin-protected endpoint 401s; some pages mask it with a mock-data fallback. Fix: interceptor should also check `admin_token` (e.g. when on an `/admin` path), or give the admin app its own axios instance.
- [ ] **`GET /orders/admin/:orderId` always 404s.** [routes/orders.ts](server/src/routes/orders.ts) wires it to the customer-scoped `getOrderById` (filters by `userId: req.user!.id`), but an admin's JWT id is never a customer's. Needs a separate `getAdminOrderById` handler with no `userId` filter.
- [ ] **`OrderDetail.tsx` status-update calls the wrong path.** Calls `PUT /orders/${id}/status`; the real route is `PUT /orders/admin/:orderId/status`. Fails visibly with an alert today — fix the frontend call.
- [ ] **Docker server build cannot complete.** `server/package.json`'s `start`/`dev` scripts point to `tsx ../server.ts`, but the real `server.ts` lives at the repo root, outside the `./server` build context `docker-compose.yml` uses — that path can never be copied into the image. Also `server/Dockerfile` runs `npm run build`, but `server/package.json` has no `build` script and no `vite` dependency. Needs either: build from repo root instead of `./server`, or make `./server` genuinely self-contained.

## High

- [ ] **Prisma provider/URL mismatch.** [schema.prisma](prisma/schema.prisma) now reads `url = env("DATABASE_URL")` (good) but `provider` is still `"sqlite"` while `docker-compose.yml` passes a `postgresql://` URL. Pick one: switch provider to `"postgresql"` for the Docker path, or keep sqlite and fix compose to pass a `file:` URL (drop the Postgres service if sqlite is the real target).
- [ ] **Raw `error.message` leaked to clients** in every controller (`res.status(500).json({ message: error.message })`). Needs a shared error-response helper; touches all 8 controllers (~42 call sites) — do as one dedicated pass, not piecemeal.
- [ ] **16 npm audit vulnerabilities** (1 critical, 8 high) — axios, react-router, multer, vite/esbuild, postcss, form-data, ws, etc. Run `npm audit fix`, re-test the app, commit lockfile separately from other changes.

## Medium

- [ ] **Multer upload has no file-type/size filter** — [routes/products.ts](server/src/routes/products.ts). Add `fileFilter` (image mimetypes only) and `limits.fileSize`.
- [ ] **No rate limiting on `/api/auth/*`** — add `express-rate-limit` on login/register/admin-login.
- [ ] **No pagination cap** — `parseInt(limit)` unbounded in `orderController.ts` / `productController.ts`; clamp to a sane max (e.g. 100).
- [ ] **No input validation on product/category create/update** — `productController.ts` / `categoryController.ts` pass `req.body` straight to Prisma. Add express-validator or zod checks.
- [ ] **`middleware/auth.ts` JWT fallback doesn't match `authController.ts`'s production guard** (low-severity residual — see audit doc for why it's not currently exploitable, but worth aligning for defense-in-depth).

## Low (cosmetic / cleanup, no urgency)

- [ ] Delete dead `client/` folder at repo root.
- [ ] Lock down CORS (`cors()` currently accepts any origin) — restrict to the known frontend origin before production.
- [ ] Remove unused `@google/genai` dependency and its `vite.config.ts` `define` wiring (leftover from the AI Studio template).
- [ ] Harden Docker secrets further: `POSTGRES_PASSWORD: postgres` and pgadmin default creds (`admin@admin.com` / `admin`) are still hardcoded plaintext in `docker-compose.yml`.

---

## Already fixed (for reference — don't re-touch)
JWT secret fail-fast in prod, dev-route gating, `/api/admin/customers` auth, real admin login + route guard, stock TOCTOU race, currency/delivery-fee units, admin order list/stats endpoints, image upload wiring, admin cancel stock restoration, cart quantity race lock, `CartDrawer` error handling, checkout navigation race, order-placement IDOR + payment-method validation. Full detail in [AUDIT_FIX_VERIFICATION.md](AUDIT_FIX_VERIFICATION.md).
