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
| 1 | **Critical** | api | `rider(id)` query has no auth check; `Rider` GraphQL type exposes `password` hash + phone + bank account + wallet + ID docs | Open |
| 2 | **High** | api | `order(id)` / `orderPaypal(id)` / `orderStripe(id)` queries check login but not ownership (IDOR) — any authenticated user can read any order/payment record | Open |
| 3 | **High** | rider, store | Sentry auth tokens committed in plaintext in `eas.json` | Open |
| 4 | **High** | admin, web, api | `.env.dev` / `.env.prod` / `.env.stage` / `.env.test` files committed to git | Open |
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

**Fix:** require `req.isAuth`, and scope to `req.userId === userId` unless the caller is an admin/dispatcher role. Remove `password` from the GraphQL type entirely — nothing should ever query a password hash over the API; it doesn't belong in the schema at all, auth resolvers can read it straight off the Mongoose model.

### 2. [High] Order/payment IDOR
**Where:** `apps/api/graphql/resolvers/order.js:87-124` (`order`, `orderPaypal`, `orderStripe`)

These check `req.isAuth` (any valid JWT, any role) but not that the caller is the order's customer, assigned rider, or owning restaurant. Contrast with the `orders` (plural) query a few lines below, which correctly scopes with `Order.find({ user: req.userId })`. Any logged-in user — customer, rider, or store — can read any other user's order: delivery address, phone, items, and payment details.

**Fix:** after loading the order, check `order.user == req.userId || order.rider == req.userId || order.restaurant == req.restaurantId` (adjust to actual field names/roles) before returning it. Audit `restaurant(id)` and other single-entity queries in `restaurant.js` for the same pattern — they follow the same shape and weren't individually verified in this pass.

### 3. [High] Sentry tokens committed to git
**Where:** `apps/rider/eas.json:20`, `apps/store/eas.json:22`

Both contain a live-looking `SENTRY_AUTH_TOKEN` (`sntrys_...`) under org `ninjas-code-w7` — the original template vendor's org, not this project's. Committed in plaintext, visible in git history to anyone with repo access.

**Fix:** rotate both tokens (revoke in Sentry), move them to GitHub Actions secrets / EAS environment secrets instead of the checked-in `eas.json`, and scrub them from git history (`git filter-repo` or BFG) since rotation alone doesn't remove them from old commits.

### 4. [High] `.env` files committed to git
**Where:** `apps/admin/.env.dev`, `.env.prod`, `.env.stage`; `apps/api/.env.test`; `apps/web/.env.dev`, `.env.prod`, `.env.stage`

`apps/api/.env.test` in particular lists keys for `CONNECTION_STRING` (Mongo URI), `TWILIO_ACCOUNT_SID`/`TWILIO_AUTH_TOKEN`, `STRIPE_WEBHOOK_ENDPOINT_SECRET`, `SENDGRID_API_KEY`, `REDIS_PASSWORD`. Whether the current values are live or placeholder wasn't confirmed here (didn't want to print secret values into this doc), but regardless of current validity, anything ever real in these files is now permanently in git history for anyone who has cloned the repo.

**Fix:** audit every key in these files — if any value is/was a real credential, rotate it. Remove the files from git tracking (`git rm --cached`), add `.env*` to `.gitignore` (the repo's own `.gitignore` for `apps/admin` already ignores `.env*.local` but not `.env.dev`/`.env.prod`/`.env.stage` — tighten the pattern), and purge from history if any live secret was ever committed.

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

- **2026-08-18** — Initial assessment across admin/app/rider/store (+ api where findings led there). 12 findings logged (1 critical, 2 high×2, 4 medium, 4 low/info). PDF report generated and shared. No fixes applied yet in this pass.
