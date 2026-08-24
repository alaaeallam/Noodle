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
| 3 | **High** | rider, store | Sentry auth tokens committed in plaintext in `eas.json` and `package.json` | **Fixed** (2026-08-20) — removed from repo, purged from git history. Still needs a real Sentry project (see below) |
| 4 | **High** | admin, web, api | `.env.dev` / `.env.prod` / `.env.stage` / `.env.test` files committed to git | **Fixed** (2026-08-20) — untracked, `.gitignore` hardened, purged from git history |
| 5 | **Medium** | api | `JWT_SECRET` prefix (first 10 chars) printed to console/pm2 logs on every boot | **Fixed** (2026-08-24) |
| 6 | **Medium** | rider, app | Auth token stored in plain `AsyncStorage` instead of Keychain/Keystore-backed `expo-secure-store` (store app already does this correctly) | **Fixed** (2026-08-24) — both rider and customer app migrated, rebuilt, and verified working on-device |
| 7 | **Medium** | app | Checkout WebView (`HypCheckout.js`) sets `originWhitelist={['*']}`, allowing navigation to any origin during a payment flow | **Fixed** (2026-08-24) — also discovered the screen is dead code, unreachable from the app |
| 8 | **Medium** | api | No rate limiting on login / password-change / OTP endpoints | **Fixed** (2026-08-24) |
| 9 | **Low** | api | CORS is `Access-Control-Allow-Origin: *` for all routes, including `Authorization` | **Fixed** (2026-08-24) |
| 10 | **Low** | api | `formatError` returns the raw error object to clients — verify it doesn't leak stack traces in production | **Fixed** (2026-08-24) |
| 11 | **Low** | app | Google Maps API keys embedded directly in `app.json` — confirm they're restricted by bundle ID / SHA-1 in Google Cloud Console | Open — needs checking in Google Cloud Console, not a code fix |
| 12 | **Info** | api | Several resolvers `console.log` full order/rider/payment objects and PII — noise + log-exposure risk, not directly exploitable | **Fixed** (2026-08-24) |
| 13 | **Critical** | api | Rider passwords are stored and compared in **plaintext**, not bcrypt-hashed like every other account type — found while fixing #12 | **Fixed** (2026-08-24) — migration run against production, all 3 riders confirmed bcrypt-hashed |
| 14 | **Medium** | api | `lastOrderCreds` query is unauthenticated and returns the most-recently-active rider's/restaurant's username + password (hash) — found while testing #6 | **Fixed** (2026-08-24) |

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

### 3. [High] Sentry tokens committed to git — Fixed
**Where:** `apps/rider/eas.json:20`, `apps/store/eas.json:22`, and (found in a follow-up pass) duplicated into `apps/rider/package.json` and `apps/store/package.json`'s `upload-sourcemaps` script

Both contained a live-looking `SENTRY_AUTH_TOKEN` (`sntrys_...`) under org `ninjas-code-w7` — the original template vendor's org, not this project's. Committed in plaintext. The app.json Sentry plugin config (`organization: "ninjas-code"` / `"ninjas-code-w7"`) and the runtime DSNs in `apps/{rider,store}/lib/utils/service/sentry.ts` also point at the vendor's Sentry org (`o4507787652694016`) — meaning crash reports from real users were being sent to a Sentry project this project doesn't control. Not a secret leak by itself (DSNs are meant to be embedded client-side), but a real functionality/privacy gap.

**Fix applied 2026-08-18/20:** hardcoded tokens removed from both `eas.json` files and both `package.json` scripts (scripts now expect `SENTRY_AUTH_TOKEN` from the environment). Both known token strings purged from **all of git history** via `git filter-repo --replace-text` (verified: zero remaining matches for either exact token anywhere in history) + a force-push of the rewritten `main`, confirmed landed on GitHub. A full mirror backup was taken before the rewrite in case of any issue.

**Still open:** a real Sentry project under the project's own account hasn't been created yet — that's the next step (org/project setup on sentry.io, new DSNs wired into `sentry.ts` in both apps, new org/project slugs into both `app.json`s, new auth token added as an EAS secret via `eas secret:create` — never back into `eas.json`/`package.json`). Until then Sentry crash reporting and source-map upload are effectively non-functional for rider/store (harmless — no regression, just no crash visibility). **Also worth noting:** GitHub retains `refs/pull/1/head` and `refs/pull/2/head` on this repo independently of `main` — if either PR's history ever included these secrets, force-pushing `main` doesn't reach those refs; hasn't been checked.

### 4. [High] `.env` files committed to git — Fixed
**Where:** `apps/admin/.env.dev`, `.env.prod`, `.env.stage`; `apps/api/.env.test`; `apps/web/.env.dev`, `.env.prod`, `.env.stage`

`apps/admin`'s and `apps/web`'s committed files only contained `NEXT_PUBLIC_*` vars (server/WS URLs) — not real secrets, since Next.js ships anything prefixed `NEXT_PUBLIC_` into the client bundle by design regardless of where it's defined. `apps/api/.env.test` is the one that mattered: it lists keys for `CONNECTION_STRING` (Mongo URI), `TWILIO_ACCOUNT_SID`/`TWILIO_AUTH_TOKEN`, `STRIPE_WEBHOOK_ENDPOINT_SECRET`, `SENDGRID_API_KEY`, `REDIS_PASSWORD`.

**Fix applied 2026-08-18/20:** all seven files untracked (`git rm --cached`, kept on disk locally), `.gitignore` hardened in `apps/admin`, `apps/web`, `apps/api`, and `apps/rider` (which had no `.env` pattern at all before this) to `.env` + `.env.*` with `!.env.example` kept trackable. All seven files then fully removed from **every commit in git history** via `git filter-repo --path ... --invert-paths` (they're gone from history entirely, not just content-scrubbed), force-pushed and confirmed landed on GitHub.

**Still open:** whether any key in `apps/api/.env.test` was ever a live credential was never confirmed (deliberately didn't extract/print the values as part of this pass) — worth a manual check by whoever has visibility into those services (Twilio/Stripe/SendGrid/Redis/Mongo consoles), rotating anything that turns out real. Same PR-refs caveat as #3 applies here too.

### 5. [Medium] JWT secret partially logged on boot — Fixed
**Where:** `apps/api/app.js:18`

**Fix applied 2026-08-24:** dropped the `.slice(0, 10)` part; now logs only `!!process.env.JWT_SECRET` (presence), never any portion of the value.

### 6. [Medium] Inconsistent token storage across mobile apps — Fixed
**Where:** `apps/rider/lib/apollo/index.ts:107`, `apps/app/src/apollo/index.js:90` used `AsyncStorage.getItem`; `apps/store/lib/apollo/index.ts:36` already correctly uses `SecureStore.getItemAsync`.

`AsyncStorage` is unencrypted on-disk (sandboxed by the OS, but readable on rooted/jailbroken devices or via backup extraction). `expo-secure-store` backs onto iOS Keychain / Android Keystore.

**Fix applied 2026-08-24 — rider:** added `expo-secure-store` as a dependency and migrated every token read/write/delete across `apps/rider/lib/apollo/index.ts`, `lib/context/global/auth.context.tsx`, `lib/context/global/user.context.tsx`, and `app/index.tsx` (the initial-route check) from `AsyncStorage` to `SecureStore`. Since this adds a genuinely new native module, it couldn't ship via OTA alone — required a real rebuild (`expo prebuild` + `pod install` + `expo run:ios --device`), and `version`/`runtimeVersion` were bumped `1.1.63` → `1.1.64` so the OTA channel won't push this update to any older installed binary that doesn't have the module compiled in. Rebuilt, installed on a physical device, login verified working end-to-end.

**Fix applied 2026-08-24 — customer app (`apps/app`):** equivalent code change (`src/apollo/index.js`, `src/context/Auth.js`, `src/context/User.js`) plus the same `version`/`runtimeVersion` treatment (switched from the `{policy: "sdkVersion"}` object to a literal `"1.0.98"`, since other installs of this app exist beyond a test device and needed the same OTA-eligibility protection rider got). Rebuilt via the same `expo prebuild` + `pod install` + `expo run:ios --device` sequence, installed on a physical device, login verified working end-to-end.

**Unrelated things hit along the way while rebuilding, not code issues — both are Apple account-tier restrictions, not caused by this change:**
- Both apps' local builds initially failed on provisioning-profile errors — rider needed Push Notifications, the customer app needed Push Notifications *and* Sign In with Apple *and* Access Wi-Fi Information — none of which free/personal Apple Developer accounts can provision, even for pure local device testing. Since the user doesn't want to enroll in the paid program yet, the relevant entitlements were stripped from each app's `.entitlements` file as a workaround: for rider this is a **local-only, uncommitted** change (its `ios/` folder is git-tracked, so this was deliberately left out of any commit — will need redoing after the next `expo prebuild`, or properly resolved via paid enrollment); for the customer app it required no such care since its `ios/` folder isn't git-tracked at all.
- The customer app also hit "No profiles for 'com.enatega.multivendor' were found" — that bundle ID is already registered under the original template vendor's Apple Developer account (this app is a fork of their "Enatega Multi" template), and bundle IDs are globally unique across all Apple Developer accounts, so the personal team couldn't claim it. Worked around by temporarily changing the bundle identifier in Xcode's local (gitignored) project settings only — `app.json`'s real bundle ID was never touched.
- Free/personal Apple accounts also cap out at **3 apps installed via free provisioning per device at a time** — rider, store, and the customer app all competing for that same 3-slot quota meant the customer app couldn't install until the user deleted store and rider from the test device to free up slots. This is a hard platform limit with no code-side workaround; enrolling in the paid program removes it.

### 7. [Medium] Wide-open WebView origin in checkout flow — Fixed
**Where:** `apps/app/src/screens/Hyp/HypCheckout.js:159` — was `originWhitelist={['*']}`

Allowed the WebView to navigate to any origin during a payment checkout. **Also discovered while fixing this:** the entire `HypCheckout` screen is dead code — it's commented out of `apps/app/src/routes/index.js` (not registered as a navigable screen), and `apps/api` has no `/hyp` route at all (only `/paypal` and `/stripe` exist). So this was never actually reachable by a real user; the risk was already zero in practice.

**Fix applied 2026-08-24:** `originWhitelist` scoped to `[SERVER_URL]` (the app's own API origin) instead of `['*']`, as defense-in-depth in case this screen is ever revived. If Hyperpay support is actually built out later, whoever does that will need to add Hyperpay's real domain to the whitelist too.

### 8. [Medium] No rate limiting on auth endpoints — Fixed
No `express-rate-limit` or equivalent found anywhere in `apps/api`. Login, password-change, and OTP-related resolvers had no throttling, making credential-stuffing and OTP brute-force attempts cheap.

**Fix applied 2026-08-24:** added `apps/api/helpers/rateLimit.js` — a small in-memory, dependency-free rate limiter — and wired an IP-based check into the top of every sensitive resolver: `login`, `ownerLogin`, `adminLogin`, `riderLogin`, `restaurantLogin` (10 attempts / 15 min per IP), `forgotPassword`, `resetPassword`, `sendOtpToEmail`, `sendOtpToPhoneNumber` (5 / 15 min — these hit Twilio/SendGrid, so also guards against cost abuse), `changePassword` (10 / 15 min, on top of its existing auth check).

Deliberately implemented as a per-resolver check rather than Express middleware — the existing `app.js` has a specific bodyParser/CORS/Apollo `applyMiddleware` ordering that seemed risky to restructure just for this, and every resolver already receives `req` via context, so this was the lower-risk path to the same result.

**Known limitations, not fixed here:**
- IP-based only, not per-account — a distributed attack across many IPs against one username/email isn't caught. Would need a second bucket keyed by the target identifier for that.
- In-memory, so it resets on every server restart and isn't shared across processes — fine for the current single pm2 instance, but would need a Redis-backed store (the app already depends on Redis via `bull`) if this ever moves to pm2 cluster mode.
- While touching `auth.js`'s `login` resolver, found and removed one more instance of #12's pattern that the original sweep missed: a multi-line `console.log('login', { ..., password, ... })` that was logging the raw customer password on every login attempt (missed originally because the grep pattern only matched single-line `console.log` calls with `password` on the same line).

### 9. [Low] CORS wildcard — Fixed
**Where:** `apps/api/app.js:95-113`

Was `Access-Control-Allow-Origin: *` unconditionally. **Fix applied 2026-08-24:** now reflects `Access-Control-Allow-Origin` only for a known allowlist (`config.DASHBOARD_URL`, `config.WEB_URL` — both already-existing env vars — plus any `http://localhost:<port>` origin for local dev); everything else gets no CORS header at all, which browsers treat as a same-origin-only response. Non-browser clients (the mobile apps) are unaffected either way, since CORS only ever gates browser fetch/XHR and they don't send an `Origin` header. **Worth double-checking:** that `DASHBOARD_URL`/`WEB_URL` are actually set correctly in the server's `.env` — wasn't verified from here since that file isn't in git (by design).

### 10. [Low] Apollo `formatError` returns raw errors — Fixed
**Where:** `apps/api/app.js:47-55`

**Fix applied 2026-08-24:** `formatError` now explicitly deletes `err.extensions.exception` when `NODE_ENV === 'production'`, guaranteeing no stack trace reaches a client response regardless of Apollo Server's own default masking behavior. Dev/staging behavior unchanged (still full detail for debugging).

### 11. [Low] Embedded Google Maps API keys
**Where:** `apps/app/app.json` — `ios.config.googleMapsApiKey` and `android.config.googleMaps.apiKey` are plaintext in a committed file. Normal for Expo/mobile (keys are meant to ship in the binary), but only safe if they're restricted in Google Cloud Console to this app's bundle ID (iOS) / SHA-1 + package name (Android) and to the specific Maps APIs needed. Not verified from the repo alone — needs checking in the Google Cloud Console, not something fixable from code.

### 12. [Info] Verbose PII logging in resolvers — Fixed
`console.log(order)`, `console.log('PAYPAL: ', paypal)`, `console.log('rider1111', args.id, req.userId, req.isAuth)` were already removed as a side effect of fixing #1/#2 (same resolvers). **Fix applied 2026-08-24:** swept the rest of `auth.js`/`user.js`/`rider.js` for anything logging an actual secret value (not just noisy-but-harmless resolver-name markers, which were left alone) — removed `console.log` calls that printed raw passwords (`riderLogin`, `resetPassword`) and raw OTP codes (`forgotPassword`, `sendOtpToEmail`, `sendOtpToPhoneNumber`) in cleartext. This is what surfaced finding #13 below.

### 13. [Critical] Rider passwords stored and compared in plaintext
**Where:** `apps/api/graphql/resolvers/auth.js` (`riderLogin`), `apps/api/graphql/resolvers/rider.js` (`createRider`, `editRider`)

Found while cleaning up #12 — `riderLogin` does `if (rider.password !== args.password)`, a plain string comparison, not `bcrypt.compare`. `createRider` constructs `new Rider({ password: args.riderInput.password, ... })` directly from user input with no hashing step, and the `Rider` model (`apps/api/models/rider.js`) has no pre-save hook to hash it either. Confirmed via `grep -n bcrypt` across `rider.js`/`auth.js`/`models/rider.js`: `bcrypt` is used extensively for Owner/Admin/User passwords (`auth.js`'s other login paths) but **never once** for Rider. This directly contradicts what this doc previously said under "What's already solid" — password hashing is correct for every account type except riders.

Impact: anyone with read access to the `riders` collection (a DB compromise, an unrelated injection bug, an insider, a leaked backup) gets every rider's actual login password in cleartext — not a hash that would need cracking. Given password reuse across services, this is a credential-stuffing risk for riders' other accounts too, not just this app.

**Fix applied 2026-08-24 — user chose proactive migration:**
- `createRider` now hashes the incoming password with `bcrypt.hash(..., 12)` before saving, matching every other account type. `editRider` doesn't touch `password` at all, so it needed no change.
- `riderLogin` is dual-mode rather than a hard cutover, to remove any deploy/migration ordering risk: it checks whether `rider.password` already looks like a bcrypt hash (`/^\$2[aby]\$/`); if so, uses `bcrypt.compare`. If not (still legacy plaintext), it falls back to the old `===` comparison and — on a successful match — transparently re-hashes and saves the password as bcrypt right there. This means the code was safe to deploy *before* the migration script ran, and doubles as a permanent safety net for any rider the migration script might ever miss (e.g. one created in the gap between deploy and running the script).
- A one-time migration script was written at `apps/api/scripts/migrate-rider-passwords.js`: scans every `Rider`, skips any password already in bcrypt format (safe to re-run), hashes and `updateOne`s the rest. Supports `--dry-run` to preview counts with zero writes before running for real. Deliberately doesn't log the Mongo connection string (only the hostname), unlike the existing `seed-users.js` script it's modeled after, which does log the full URI including credentials — worth fixing separately, not done here.
- **Run against production 2026-08-24:** dry-run first (3 riders found, all plaintext), then the real run (3 migrated, 0 failed), then a second dry-run confirming idempotency (3 already-hashed, 0 would-migrate). Finding fully closed.

Side effect of this fix, discovered immediately after: it broke a "demo credentials" auto-fill feature in the rider app, which reads a rider's password straight from the database to pre-fill the login form for testing convenience — see #14, that's what led to finding it.

### 14. [Medium] Unauthenticated demo-credentials endpoint leaks account passwords
**Where:** `apps/api/graphql/resolvers/demo.js` (`lastOrderCreds` query)

```js
lastOrderCreds: async() => {
  const configuration = await Configuration.findOne()
  if (!configuration?.enableRestaurantDemo && !configuration?.enableRiderDemo) {
    return null
  }
  const order = await Order.findOne().sort({ createdAt: -1 })
  const restaurant = configuration?.enableRestaurantDemo ? await Restaurant.findById(order.restaurant) : null
  const rider = configuration?.enableRiderDemo ? await Rider.findOne({ zone: order.zone, isActive: true, available: true }) : null
  return {
    restaurantUsername: restaurant?.username ?? null,
    restaurantPassword: restaurant?.password ?? null,
    riderUsername: rider?.username ?? null,
    riderPassword: rider?.password ?? null
  }
}
```

This query has **no authentication check at all** and returns the most-recently-active rider's and restaurant's username plus password (well-commented in the code as an intentional demo-mode convenience, gated by `Configuration.enableRiderDemo`/`enableRestaurantDemo`, and explicitly warned in the code's own comment to "stay off... outside a demo deployment"). It's currently **on** in this database — confirmed by observing it actually return live data during #6's on-device testing.

Impact is now smaller than it would have been before #13 was fixed: `restaurant.password` was already a bcrypt hash (restaurants were never plaintext), and `rider.password` is a bcrypt hash too as of today's migration. So this no longer hands out plaintext credentials — but it still unauthenticated-leaks a real username + password hash for whichever account happens to be "most recently active," which is enough to mount an offline dictionary/brute-force attack against that specific account, and reveals which account is currently active as a minor info leak on its own.

**Fix applied 2026-08-24 — user confirmed demo mode isn't used anymore:**
- `apps/api/scripts/disable-demo-mode.js` (one-off, no admin panel UI actually calls the existing `saveDemoConfiguration` mutation, so there was no way to toggle this off except directly) sets `enableRiderDemo`/`enableRestaurantDemo` to `false` in the live `Configuration` document. Run against production, confirmed flipped.
- **Also hardened the resolver itself, independent of the flag:** `lastOrderCreds` now always returns `null` for `restaurantPassword`/`riderPassword`, regardless of demo-mode state. This means even if someone re-enables demo mode in the future without reading this finding, the endpoint can never leak a real account's password/hash again — only the (non-sensitive) username of whichever account is most recently active, which is all the convenience feature actually needs.

## What's already solid

- Passwords are hashed with `bcryptjs` at cost factor 12 for every account type, including Rider as of this fix (`apps/api/graphql/resolvers/auth.js`, `user.js`, `rider.js`).
- GraphQL introspection is disabled in production (`introspection: config.NODE_ENV !== 'production'`) — correct.
- Apollo persisted-queries cache is explicitly disabled with a comment explaining the unbounded-memory DoS risk — good, deliberate call.
- `apps/store` uses `expo-secure-store` for its auth token — the right pattern; rider/app should match it (#6).

## Scope note

This pass covered `apps/admin`, `apps/app`, `apps/rider`, `apps/store`, and touched `apps/api` where client-side findings led directly back to a backend resolver (which is most of the high-severity items — client security in these apps is largely a function of what the shared backend allows). It was a manual, targeted audit (grep for secrets/insecure patterns + reading of auth/token/authorization code paths), not an automated SAST/dependency-CVE scan and not a penetration test. Not yet covered: full `npm audit`/dependency CVE sweep across all 5 apps, `apps/web`, exhaustive resolver-by-resolver authorization audit (only `order`/`rider`/`restaurant` single-entity queries were sampled), push notification token handling, and the Cloudinary unsigned upload preset's upload restrictions.

## Assessment History

- **2026-08-18** — Initial assessment across admin/app/rider/store (+ api where findings led there). 12 findings logged (1 critical, 2 high×2, 4 medium, 4 low/info). PDF report generated and shared.
- **2026-08-18** — Fixed #1 (unauthenticated rider IDOR + password hash exposure) and #2 (order/payment IDOR), reusing an existing `requireOrderAccess` guard helper that was already in the codebase but not wired up. Remaining open: #3–#12.
- **2026-08-18** — Partially fixed #3 (Sentry tokens) and #4 (`.env` files): removed from the repo going forward and `.gitignore` hardened across admin/web/api/rider. Neither is fully closed — both still have their old values sitting in git history, which needs a separate, explicitly-approved `git filter-repo`/BFG history rewrite + force-push to actually purge. #3 also can't be "rotated" in the usual sense since the leaked token belongs to a third-party Sentry org we don't control — decision needed on whether to set up our own Sentry project. Remaining fully open: #5–#12.
- **2026-08-20** — Fully closed #3 and #4: found and removed a second copy of the leaked Sentry tokens (had been duplicated into `package.json` scripts, missed in the first pass); ran `git filter-repo` to purge both tokens and all seven `.env` files from every commit in git history; force-pushed the rewritten `main` (took two attempts — first force-push dropped mid-transfer on a broken pipe, retried successfully with a larger `http.postBuffer`); verified remote matches local post-push. A full mirror backup was taken before the rewrite (`/Users/alaaeallam/dev/enatega/Noodle-backup-mirror-20260819.git`, safe to delete once confident nothing needs recovering). User decided: yes to setting up a real Sentry project — not yet done, next up. Noted but not yet checked: `refs/pull/1/head`/`refs/pull/2/head` on GitHub are independent of `main`'s history and weren't covered by this purge. Remaining fully open: #5–#12.
- **2026-08-24** — Fixed #5, #7, #9, #10, #12 in one batch (all small, low-risk). #7 turned out to be dead code (screen unreachable, no backend route exists). While cleaning up #12's logging, discovered and logged a new **critical** finding, #13: rider passwords are stored and compared in plaintext (no bcrypt at all for the Rider account type, unlike every other account type in this system) — not fixed yet, needs a decision on migration approach (lazy vs. proactive) before touching production data. Remaining open: #6, #8, #11, #13.
- **2026-08-24** — User chose proactive migration for #13, run now. Deployed a dual-mode `riderLogin` (bcrypt-compare if already hashed, plaintext-compare-then-upgrade if not) so the code was safe to ship ahead of the actual data migration, plus hashing on `createRider`. Wrote `apps/api/scripts/migrate-rider-passwords.js` to bcrypt-hash every existing rider in place (idempotent, `--dry-run` supported).
- **2026-08-24** — Ran the migration against production via SSH: dry-run found 3 riders, all plaintext; real run migrated all 3, 0 failures; follow-up dry-run confirmed idempotency (3 already-hashed, 0 would-migrate). #13 fully closed. Remaining open: #6, #8, #11.
- **2026-08-24** — Fixed #8: added a dependency-free in-memory rate limiter, wired into all 9 sensitive resolvers (login, ownerLogin, adminLogin, riderLogin, restaurantLogin, forgotPassword, resetPassword, sendOtpToEmail, sendOtpToPhoneNumber, changePassword). IP-based only for now, not per-account, and in-memory so it won't survive a restart or work across pm2 cluster workers — documented as known limitations rather than solved. Also caught and fixed one more raw-password console.log in `login` that the original #12 sweep's single-line grep missed. Remaining open: #6, #11.
- **2026-08-24** — Partially fixed #6: migrated rider's auth token from AsyncStorage to expo-secure-store, rebuilt on-device (required a real native rebuild, not just OTA, since it's a new native module — bumped version/runtimeVersion 1.1.63→1.1.64 so the OTA channel protects older installed binaries), verified login works end-to-end. Customer app got the equivalent code change plus a switch from sdkVersion-policy to a literal runtimeVersion (other installs of that app exist beyond a test device), but hasn't been rebuilt/tested or pushed yet. Hit an unrelated provisioning-profile error along the way (Personal Team accounts can't provision Push Notifications) - worked around locally and uncommitted (stripped aps-environment from rider's entitlements file) since the user doesn't want to enroll in the paid Apple Developer Program yet. Testing #6 surfaced a new finding, #14: an unauthenticated `lastOrderCreds` query leaks the most-recently-active rider's/restaurant's username+password(hash) when demo mode is on (which it currently is) - open, waiting on user decision about whether demo mode is intentional. Remaining open: #6 (customer app half), #11, #14.
- **2026-08-24** — Fully closed #6: rebuilt and verified the customer app too. Hit two more Apple free-tier walls along the way - the customer app's bundle ID (`com.enatega.multivendor`) turned out to already be registered under the original template vendor's Apple Developer account (globally unique across all accounts, so the personal team couldn't claim it - worked around with a temporary local-only bundle ID change in Xcode, `app.json` untouched), and then a hard "3 apps max on free provisioning per device" cap meant the customer app couldn't install until store and rider were deleted from the test device to free up slots. Neither has a code-side fix; both point toward the paid Apple Developer Program being worth enrolling in if local multi-app testing continues. Remaining open: #11, #14.
- **2026-08-24** — Fixed #14: user confirmed demo mode isn't used anymore. Wrote and ran `apps/api/scripts/disable-demo-mode.js` to turn off `enableRiderDemo`/`enableRestaurantDemo` in production (no admin panel UI exists to do this - the mutation that changes these flags is never actually called from the panel) - confirmed both were `true` before the run, `false` after. Also hardened `lastOrderCreds` itself to always return `null` for the password fields regardless of the flag, so this can't leak a real credential again even if demo mode is re-enabled by someone later without reading this. Remaining open: #11 (needs manual Google Cloud Console check, not a code fix) - everything else code-fixable is done.
