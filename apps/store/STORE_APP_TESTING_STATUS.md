# Store App Testing Status

Session goal: get the `apps/store` (vendor) app running on a physical iPhone against the real production backend, verifying last session's BTB backend fixes actually work end-to-end.

## What we did

### Backend fixes (deployed to production — `foodapp-api.alaaeallam.com`)
- Fixed `restaurantLogin`: the username/email lookup query referenced a nonexistent `email` field on `Restaurant`, which silently matched *every* restaurant under Mongoose `strictQuery` — login was authenticating against a random restaurant, not the one you typed. Removed the dead `email` clause.
- Fixed the demo-mode `lastOrderCreds` query: it was unauthenticated and returned real restaurant/rider password hashes to anyone, and crashed with null errors when no demo order existed. Gated behind `Configuration.enableRestaurantDemo`/`enableRiderDemo` config flags, wrapped in try/catch.
- Removed the store app's own consumption of `lastOrderCreds` entirely — a real vendor app shouldn't auto-fill someone else's real password hash into the login form.
- Added `notificationToken` support to `restaurantLogin` (schema + resolver) — the app was already sending it but the backend rejected it.
- Added `storeCurrentWithdrawRequest` query, `updateRestaurantBussinessDetails` mutation, `storeEarningsGraph` query — all called by the frontend but never implemented server-side (bank details save, pending withdrawal display, earnings chart were all silently broken).
- Fixed `GET_ORDERS`: requested a nonexistent `id` field on `Order`/`Item`/`ItemVariation`/`ItemAddon`/`ItemOption` (only `_id` exists) — every orders fetch failed with HTTP 400, so the Orders tab always showed empty even with real pending orders in the DB.

### Native/build fixes (local, in this repo)
- **Root cause of the big crash-after-login bug**: this pnpm monorepo resolves multiple physical copies of `react-native` / `react-native-reanimated` (different peer-dependency variants). Metro bundled more than one copy into the same JS context, so React Native's own startup code (dev-tools bootstrap) ran twice and crashed the second time (`property is not writable`, `findHostInstance_DEPRECATED is not a function`, `Invariant Violation: "main" has not been registered`).
  - Fixed via `pnpm.patchedDependencies` patches on `react-native@0.79.4`, `react-native-reanimated@3.17.5`, and `react-native-css-interop@0.2.1` (see `patches/` at repo root) — makes the dev-tools bootstrap idempotent instead of crashing on re-evaluation.
  - `apps/app` (customer app) has its own separate npm/`patch-package`-managed copy of react-native that needed the same fix (`apps/app/patches/react-native+0.79.6.patch`).
  - **Tried `node-linker=hoisted` in `.npmrc` as a "proper" fix — made it much worse** (30+ duplicate copies instead of 1-2) and was reverted. Don't retry this.
- `ios/Podfile` needs a `post_install` patch (must be re-applied after every `expo prebuild`/`rm -rf ios`) that force-disables `fmt`'s `FMT_USE_CONSTEVAL` — Xcode 16+ breaks the `fmt` version bundled with this RN version otherwise.
- Rewrote the custom splash screen (`AnimatedSplashScreen.tsx`) so app content always renders immediately, with the video as a non-blocking fade overlay — it previously depended on an unreliable `expo-av` callback and could strand the app on a black screen forever.
- Fixed `app/_layout.tsx`'s font-loading gate to not hang forever on a font load error.

### Result
Login works end-to-end against production with a real BTB account (`mokattam@btb.com`). Orders tab now shows real pending orders matching the admin dashboard.

## What's still open
- A `useInsertionEffect must not schedule updates` React warning appears on the Profile screen (`DocumentsSection` component reading `useApptheme()`). Looks like a NativeWind/react-native-css-interop internal timing quirk. Non-fatal (dev-mode warning, not a crash), but shows as a full LogBox red screen — **not yet confirmed whether Profile content actually renders correctly underneath once dismissed.**
- Haven't yet clicked through Wallet, Earnings, Bank Management, or Work Schedule screens on-device to confirm the earlier-session backend additions (`storeEarningsGraph`, `storeCurrentWithdrawRequest`, `updateRestaurantBussinessDetails`) work correctly end-to-end from the UI (only verified via direct GraphQL calls).
- Haven't tested accepting/rejecting an order from the app.

## Next steps
1. Dismiss the Profile screen warning and confirm the screen renders.
2. Click through Wallet → try a withdraw request, confirm pending-request display.
3. Click through Earnings → confirm the bar chart loads.
4. Try Bank Management → save business details, confirm it persists (check via admin panel or a repeat GraphQL query).
5. Accept a pending order from the Orders tab, confirm status updates correctly.
