# Security — Noodle Platform

Living security document for the Noodle platform (`apps/admin`, `apps/app`, `apps/rider`, `apps/store`, and the shared `apps/api` backend they all depend on). Update this file every time security work is done — new findings, fixes, or accepted risks — instead of starting a fresh document. Keep the **Findings Log** as the source of truth; the **Status** column is what's current, the **Findings** section below has the detail.

Last full assessment: **2026-08-18**.

## How to use this file

- New finding → add a row to the log with status `Open`, plus a detail entry below.
- Fixed → update status to `Fixed`, note the commit/PR, keep the row (don't delete history).
- Investigated and not a real risk → status `Accepted` or `False positive`, with a one-line reason.
- Re-assessing an app → add a dated entry under **Assessment History** even if nothing changed.

## Findings Log

| # | Severity | Area | Summary | Status |
|---|----------|------|---------|--------|
| 1 | **Critical** | api | `rider(id)` query has no auth check; `Rider` GraphQL type exposes `password` hash + phone + bank account + wallet + ID docs | **Fixed** (2026-08-18) |
| 2 | **High** | api | `order(id)` / `orderPaypal(id)` / `orderStripe(id)` queries check login but not ownership (IDOR) — any authenticated user can read any order/payment record | **Fixed** (2026-08-18) |
| 3 | **High** | rider, store | Sentry auth tokens committed in plaintext in `eas.json` | **Partially fixed** (2026-08-18) — removed from repo, not yet purged from git history |
| 4 | **High** | admin, web, api | `.env.dev` / `.env.prod` / `.env.stage` / `.env.test` files committed to git | **Partially fixed** (2026-08-18) — untracked + `.gitignore` hardened, not yet purged from git history |
| 5 | **Medium** | api | `JWT_SECRET` prefix (first 10 chars) printed to console/pm2 logs on every boot | Open |
| 6 | **Medium** | rider, app | Auth token stored in plain `AsyncStorage` instead of Keychain/Keystore-backed `expo-secure-store` (store app already does this correctly) | Open |
| 7 | **Medium** | app | Checkout WebView (`HypCheckout.js`) sets `originWhitelist={['*']}`, allowing navigation to any origin during a payment flow | Open |
| 8 | **Medium** | api | No rate limiting on login / password-change / OTP endpoints | Open |
| 9 | **Low** | api | CORS is `Access-Control-Allow-Origin: *` for all routes, including `Authorization` | Open |
| 10 | **Low** | api | `formatError` returns the raw error object to clients — verify it doesn't leak stack traces in production | Open |
| 11 | **Low** | app | Google Maps API keys embedded directly in `app.json` — confirm they're restricted by bundle ID / SHA-1 in Google Cloud Console | Open |
| 12 | **Info** | api | Several resolvers `console.log` full order/rider/payment objects and PII — noise + log-exposure risk, not directly exploitable | Open |

## Findings

### 1. [Critical] Unauthenticated rider profile disclosure (IDOR + broken auth)
**Where:** `apps/api/graphql/resolvers/rider.js:67-81`, schema at `apps/api/graphql/schema/index.js:215-240`

```js
rider: async(_, args, { req }) => {
  const userId = args.id || req.userId
  if (!userId) { throw new Error('Unauthenticated!') }
  const rider = await Rider.findById(userId)
  return transformRider(rider)
}
```

This resolver never checks `req.isAuth`. Passing any `id` argument satisfies the only guard (`!userId`), so a completely unauthenticated GraphQL request can fetch a full `Rider` object for any MongoDB ID. The `Rider` type schema includes:
```
password: String!        # bcrypt hash
phone: String!
accountNumber: String    # bank account
currentWalletAmount / totalWalletAmount / withdrawnWalletAmount: Float
licenseDetails / vehicleDetails         # ID document images
```
IDs are 24-hex-char ObjectIds and are routinely visible in app traffic (order assignment, dispatch), so enumeration is practical, not theoretical.

**Fix (applied 2026-08-18):** `rider(id)` now calls `requireAuth(req)` and only proceeds if the caller is an admin role (`ADMIN`/`SUPER_ADMIN`) or `String(userId) === String(req.userId)` (self). `password` was removed from the `Rider` GraphQL type entirely, and the now-dead `password` field selection was removed from the two client queries that were requesting it (`apps/rider/lib/apollo/queries/rider.query.ts`, `apps/admin/lib/api/graphql/queries/riders/index.ts` — neither actually used the value, it was a blanket "select all fields" leftover). Verbose PII debug logging (`console.log('rider1111', ...)`) removed from the same resolver as part of the same edit.

### 2. [High] Order/payment IDOR — Fixed
**Where:** `apps/api/graphql/resolvers/order.js:87-124` (`order`, `orderPaypal`, `orderStripe`)

These check `req.isAuth` (any valid JWT, any role) but not that the caller is the order's customer, assigned rider, or owning restaurant. Contrast with the `orders` (plural) query a few lines below, which correctly scopes with `Order.find({ user: req.userId })`. Any logged-in user — customer, rider, or store — can read any other user's order: delivery address, phone, items, and payment details.

**Fix (applied 2026-08-18):** all three resolvers now call the existing `requireOrderAccess(req, order)` guard (from `apps/api/helpers/guards.js` — it already existed, checking admin role, or `order.user === req.userId`, or `order.rider === req.userId`, but simply wasn't wired into these three resolvers) after loading the record and before returning it. Note `requireOrderAccess` doesn't grant restaurant-owner access to their own orders via this path — if that's needed, it's a follow-up, not covered here. `restaurant(id)` and other single-entity queries in `restaurant.js` still weren't individually audited for the same pattern — worth a follow-up pass.

### 3. [High] Sentry tokens committed to git — Partially fixed
**Where:** `apps/rider/eas.json:20`, `apps/store/eas.json:22`

Both contained a live-looking `SENTRY_AUTH_TOKEN` (`sntrys_...`) under org `ninjas-code-w7` — the original template vendor's org, not this project's. Committed in plaintext.

**Fix applied 2026-08-18:** the `env.SENTRY_AUTH_TOKEN` block was removed from both `eas.json` files, so future builds no longer read or transmit it. **Not done, and needing a decision:** the token still isn't rotatable by us — it belongs to a Sentry org (`ninjas-code-w7`) that isn't this project's, so there's no login to revoke it from. Two options going forward: (a) leave Sentry source-map upload disabled for EAS builds (current state — harmless, no functionality was actually working under our control anyway), or (b) set up a Sentry project under the project's own account and wire a new token in as an EAS secret (`eas secret:create`), never in `eas.json` directly. Also **still open**: the old token strings remain in git history (old commits) — removing them from history requires a `git filter-repo`/BFG rewrite + force-push, which wasn't done here since it's a disruptive, hard-to-reverse operation on shared history that needs explicit sign-off before running.

### 4. [High] `.env` files committed to git — Partially fixed
**Where:** `apps/admin/.env.dev`, `.env.prod`, `.env.stage`; `apps/api/.env.test`; `apps/web/.env.dev`, `.env.prod`, `.env.stage`

`apps/admin`'s and `apps/web`'s committed files only contained `NEXT_PUBLIC_*` vars (server/WS URLs) — not real secrets, since Next.js ships anything prefixed `NEXT_PUBLIC_` into the client bundle by design regardless of where it's defined. `apps/api/.env.test` is the one that mattered: it lists keys for `CONNECTION_STRING` (Mongo URI), `TWILIO_ACCOUNT_SID`/`TWILIO_AUTH_TOKEN`, `STRIPE_WEBHOOK_ENDPOINT_SECRET`, `SENDGRID_API_KEY`, `REDIS_PASSWORD`.

**Fix applied 2026-08-18:** all seven files were untracked (`git rm --cached`, files remain on disk locally — nothing deleted), and `.gitignore` was hardened in `apps/admin`, `apps/web`, `apps/api`, and `apps/rider` (which had no `.env` pattern at all before this) to `.env` + `.env.*` with `!.env.example` kept trackable, so this class of accident can't silently recur. **Still open:** whether any key in `apps/api/.env.test` was ever a live credential wasn't confirmed as part of this pass — worth a manual check by whoever has visibility into those services (Twilio/Stripe/SendGrid/Redis/Mongo consoles), rotating anything that turns out real. And same as #3: the file contents remain in git history until a history rewrite is explicitly approved and run.

### 5. [Medium] JWT secret partially logged on boot
**Where:** `apps/api/app.js:18`
```js
console.log('[boot] JWT_SECRET present?', !!process.env.JWT_SECRET, 'value:', process.env.JWT_SECRET?.slice(0, 10) + '...');
```
Leaks the first 10 characters of the JWT signing secret into pm2 logs on every restart. Reduces brute-force search space and is an unnecessary exposure — the `!!process.env.JWT_SECRET` boolean check alone is enough to confirm it's set.

**Fix:** drop the `.slice(0, 10)` part; log only presence, not any portion of the value.

### 6. [Medium] Inconsistent token storage across mobile apps
**Where:** `apps/rider/lib/apollo/index.ts:107`, `apps/app/src/apollo/index.js:90` use `AsyncStorage.getItem`; `apps/store/lib/apollo/index.ts:36` correctly uses `SecureStore.getItemAsync`.

`AsyncStorage` is unencrypted on-disk (sandboxed by the OS, but readable on rooted/jailbroken devices or via backup extraction). `expo-secure-store` backs onto iOS Keychain / Android Keystore. The store app already does this right; rider and customer app auth tokens should move to the same mechanism.

### 7. [Medium] Wide-open WebView origin in checkout flow
**Where:** `apps/app/src/screens/Hyp/HypCheckout.js:159` — `originWhitelist={['*']}`

Allows the WebView to navigate to any origin during a payment checkout. If the initial URL or a redirect is ever tampered with (compromised network, malicious response), the WebView will happily load it. Should be restricted to the actual Hyperpay domain(s) in use.

### 8. [Medium] No rate limiting on auth endpoints
No `express-rate-limit` or equivalent found anywhere in `apps/api`. Login, password-change, and OTP-related resolvers have no throttling, making credential-stuffing and OTP brute-force attempts cheap.

**Fix:** add per-IP + per-account rate limiting on `login`, `changePassword`, `resetPassword`/OTP verification.

### 9. [Low] CORS wildcard
**Where:** `apps/api/app.js:96-98` — `Access-Control-Allow-Origin: *`, with `Authorization` in the allowed headers list.

Lower risk than usual since auth is bearer-token (not cookie-based), so this doesn't enable classic CSRF — but it does mean any website's JS can call the API directly if it ever gets hold of a token via another vector (e.g. an XSS elsewhere). Worth tightening to the known origins (`foodapp-admin.alaaeallam.com`, the web app's domain) as defense-in-depth.

### 10. [Low] Apollo `formatError` returns raw errors
**Where:** `apps/api/app.js:48-51` — logs then returns `err` unmodified to the client. Apollo Server's default production error-masking may be bypassed by this override. Not confirmed exploitable, but worth checking whether `err.extensions` ever carries a stack trace back to API responses in production.

### 11. [Low] Embedded Google Maps API keys
**Where:** `apps/app/app.json` — `ios.config.googleMapsApiKey` and `android.config.googleMaps.apiKey` are plaintext in a committed file. Normal for Expo/mobile (keys are meant to ship in the binary), but only safe if they're restricted in Google Cloud Console to this app's bundle ID (iOS) / SHA-1 + package name (Android) and to the specific Maps APIs needed. Not verified from the repo alone — needs checking in the Google Cloud Console.

### 12. [Info] Verbose PII logging in resolvers
`console.log(order)`, `console.log('PAYPAL: ', paypal)`, `console.log('rider1111', args.id, req.userId, req.isAuth)` and similar appear throughout `order.js`/`rider.js`. Not directly exploitable, but it means full order/payment/rider PII ends up in pm2 logs on every request — worth cleaning up as part of fixing #1/#2, since those fixes will touch the same resolvers anyway.

## What's already solid

- Passwords are hashed with `bcryptjs` at cost factor 12 (`apps/api/graphql/resolvers/auth.js`, `user.js`) — correct.
- GraphQL introspection is disabled in production (`introspection: config.NODE_ENV !== 'production'`) — correct.
- Apollo persisted-queries cache is explicitly disabled with a comment explaining the unbounded-memory DoS risk — good, deliberate call.
- `apps/store` uses `expo-secure-store` for its auth token — the right pattern; rider/app should match it (#6).

## Scope note

This pass covered `apps/admin`, `apps/app`, `apps/rider`, `apps/store`, and touched `apps/api` where client-side findings led directly back to a backend resolver (which is most of the high-severity items — client security in these apps is largely a function of what the shared backend allows). It was a manual, targeted audit (grep for secrets/insecure patterns + reading of auth/token/authorization code paths), not an automated SAST/dependency-CVE scan and not a penetration test. Not yet covered: full `npm audit`/dependency CVE sweep across all 5 apps, `apps/web`, exhaustive resolver-by-resolver authorization audit (only `order`/`rider`/`restaurant` single-entity queries were sampled), push notification token handling, and the Cloudinary unsigned upload preset's upload restrictions.

## Assessment History

- **2026-08-18** — Initial assessment across admin/app/rider/store (+ api where findings led there). 12 findings logged (1 critical, 2 high×2, 4 medium, 4 low/info). PDF report generated and shared.
- **2026-08-18** — Fixed #1 (unauthenticated rider IDOR + password hash exposure) and #2 (order/payment IDOR), reusing an existing `requireOrderAccess` guard helper that was already in the codebase but not wired up. Remaining open: #3–#12.
- **2026-08-18** — Partially fixed #3 (Sentry tokens) and #4 (`.env` files): removed from the repo going forward and `.gitignore` hardened across admin/web/api/rider. Neither is fully closed — both still have their old values sitting in git history, which needs a separate, explicitly-approved `git filter-repo`/BFG history rewrite + force-push to actually purge. #3 also can't be "rotated" in the usual sense since the leaked token belongs to a third-party Sentry org we don't control — decision needed on whether to set up our own Sentry project. Remaining fully open: #5–#12.
