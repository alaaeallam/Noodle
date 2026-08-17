# BTB Rider App Revamp — Status

Source of truth: `BTB Rider App.dc.html` mockup exported from Claude Design
(zip: `Food delivery rider app design.zip`, 7 screens — New orders,
Processing/the run, Delivered, Wallet, Earnings, Profile, Rider drawer).
Same brand as the customer app (`apps/app`) and store app (`apps/store`) —
see `apps/app/src/utils/themeColors.js` / `apps/store/lib/utils/constants/colors.ts`
for the canonical palette; keep all three in sync if the brand changes.
apps/rider had not been touched before this session — it was still on the
stock Enatega green theme.

## Palette (identical to customer/store apps)

- Red `#FF1D02` (primary/accent), Black `#0A0A0A` (chrome/text), Cream
  `#F4F2EF` (screen bg), Border `#E4E1DD`, White `#FFF`.
- Fonts: **Anton** (headlines, buttons, prices — always uppercase) and
  **Archivo** 400–900 (body/labels). Files copied from `apps/store`'s fonts
  into `lib/assets/fonts/Anton/` and `lib/assets/fonts/Archivo/`, wired into
  `app/_layout.tsx`'s `useFonts` call as `Anton`, `Archivo`, `Archivo500`,
  `Archivo600`, `Archivo700`, `Archivo800`, `Archivo900`.
- Visual language: square corners everywhere (no `rounded-*`), 2px borders,
  uppercase micro-labels with wide letter-spacing, Anton for numbers/prices.
- `Colors.dark` intentionally mirrors `Colors.light` exactly — the mockup is
  a single light identity, no designed dark mode. See
  `lib/utils/constants/colors.ts` comment.

## Done this session (2026-08-13)

**Foundation** (cascades app-wide via `appTheme`):
- `lib/utils/constants/colors.ts` — full BTB light/dark palette, same key
  names as before so every screen using `appTheme.xxx` picked it up for free.
- `app/_layout.tsx` — Anton + Archivo font loading added.

**Rebuilt to match the mockup:**
- Bottom tab bar (`app/(tabs)/_layout.tsx`) — flat black bar, red active
  tint, gray inactive, Archivo800 uppercase labels, no floating/rounded card
  (was a floating rounded `#1F2937` bar).
- Drawer chrome (`lib/ui/layouts/home-drawer/drawer-main/DrawerMain.tsx`) —
  black native header, red square hamburger button, Anton white uppercase
  title, white (not cream) drawer sheet background.
- Drawer header (`.../home/drawer/drawer-header`) — red block, square black
  avatar chip with initials, Anton rider name, availability switch + label.
- Drawer content rows (`.../home/drawer/drawer-content`) — square icon
  chips (was rounded-full), red active bg, Archivo800 labels, 2px row
  dividers (was rounded avatars + thin hairlines) — applies to the 6
  registered Drawer.Screens plus the 4 static rows (Profile/About/Privacy/
  Product Page/Logout).
- Availability switch (`lib/ui/useable-components/switch-button`) — copied
  the exact BTB pattern already built for `apps/store`: plain black track +
  square white knob sliding side to side, no rounded pill/check-icon.
- Orders top-tab bar (`app/(tabs)/home/orders/_layout.tsx`) — white bar,
  thick red underline on the active tab, Archivo900 uppercase labels (was
  Inter, thin border).
- **Order card** (`lib/ui/useable-components/order`) — the single component
  driving all of New/Processing/Delivered: squared 2px-bordered card, status
  badge (outlined for "new", red for "processing", black for "delivered"),
  Anton order ID, red-framed store logo tile, A/B pickup-dropoff rows,
  bordered time/distance strip, red "Assign me" button. All existing
  GraphQL hooks (`useOrder`, `mutateAssignOrder`) preserved untouched —
  JSX/styling only.
- **Order-detail run screen** (`.../home/orders/main/order-details`) — the
  BottomSheet card over the live map: squared border, Anton order id/store
  name, a new 3-step progress indicator (Assigned → Picked up → Drop off,
  derived from `localOrder.orderStatus`, mirroring mockup screen 02) shown
  only on the processing tab, restyled Pick up/Mark as Delivered buttons.
  Map/`MapViewDirections`/`BottomSheet` logic untouched.
- `AccordionItem` and `WelldoneComponent` (delivered-toast + order-details
  accordion) — Anton uppercase headers, black toast card with red subtext,
  matching the mockup's "Delivered at 9:52" pattern.
- **Wallet** (`lib/ui/screens/wallet` + `wallet/view/*`) — red balance card
  (was a small cream box), black "Withdraw now" button, transaction rows
  with icon chips (red for credit/down, black for debit/up), square
  withdraw-amount modal. Native Stack header (`app/(tabs)/wallet/_layout.tsx`)
  restyled to black bg + Anton white title instead of adding a duplicate
  custom header.
- **Earnings** (`lib/ui/screen-components/earnings/view/main`) — rebuilt
  around a functional **Day/Week/Month range tab** (new — the
  `RIDER_EARNINGS_GRAPH` query already accepted `startDate`/`endDate`, just
  wasn't wired to a UI control before), big red total, a hand-rolled flat
  bar row (replacing the `react-native-gifted-charts` `BarChart` to match
  the mockup's plain red/black bars exactly), restyled recent-activity list
  and its "See More"/bottom-sheet breakdown modal. Native Stack header
  restyled to black/Anton to match.
- **Profile** (`profile/header`, `profile/view/docs/*`, `profile/forms/*`) —
  square black avatar chip, Anton name, document status chips (license/
  vehicle plate) with square Add/Update buttons, bordered field rows for
  email/password/phone, form modals (license upload, vehicle plate upload)
  restyled to square 2px borders/dashed upload zones. Native Stack header
  restyled to black/Anton.
- Shared components: `custom-continue-button` (full-width, Anton, red),
  `no-record-found` (Anton headline, red sad-icon), `custom-screen-header`
  (new reusable black chrome bar — built but ended up unused once the
  native Stack headers were restyled instead; left in place for future use),
  Login screen (BTB "BTB" brand mark, squared inputs, same pattern already
  built for `apps/store`).

**Second pass (screens outside the 7 mocked screens, same session):**
Language, Vehicle Type, Work Schedule (day cards, time-slot pickers,
add/remove-slot buttons), Bank Management (all 4 form fields), Help (FAQ
accordion + WhatsApp CTA — copied `apps/store`'s exact pattern), Earnings
Summary sub-screen header (`earning-details/header`), Earnings Order
Details row (`earning-order-details/order-stack`), Withdraw-request
success modal, Chat header (top bar only — `chat/main`'s body is dead/
commented-out pre-existing code, not wired to anything real, left alone
like `apps/store`'s equivalent), the app-launch location-permission modal,
and the "You are currently unavailable" status banner.

## Not touched (intentionally)

- `app/+not-found.tsx` — unreachable 404 fallback, uses generic
  `ThemedText`/`ThemedView`, not worth styling.
- `lib/ui/screen-components/chat/main` — its actual body is entirely
  commented out and replaced with a placeholder `<Text>index</Text>`;
  restyling dead code that renders nothing real would be wasted effort.
- Radio buttons (`custom-radio-button`) — left circular. The mockup never
  shows a radio control, and round selection indicators are a reasonable,
  conventional exception to the square-corner rule.
- Skeleton loaders (`lib/ui/skeletons/*`) — left as-is; they're neutral
  gray shimmer placeholders, not themed surfaces.
- Theme toggle switch in Profile → Other Information — kept functional
  even though `Colors.dark` now mirrors `Colors.light` (so toggling has no
  visible effect); removing it would be a functional change beyond restyle
  scope.

## Verification

`npx tsc --noEmit` does **not** run on this project — `tsconfig.json` sets
`"module": "commonjs"` while it extends `expo/tsconfig.base`, which sets
`moduleResolution: "bundler"`; those are incompatible and TS bails with
`TS5095` before checking any files. This is a **pre-existing** repo issue,
unrelated to this session (confirmed: the same error occurs on a clean
`git stash`). Verified instead via `npx eslint <every file touched this
session>` — zero new errors/warnings; the only 3 lint findings (2 unused
vars, 1 redundant double-negation) all pre-date this session's diff
(confirmed via `git diff` on each), left alone.

**Not yet verified on a physical device** — per the established workflow,
let the user run the device build themselves rather than building it in
this session.

## How to continue

If asked to continue this work: check the "Not touched" list above first.
Follow the same visual language (square corners, 2px `borderColor:
appTheme.borderLineColor`, Anton for headlines/prices/buttons, Archivo800
uppercase for micro-labels, red/black/white/cream only) and preserve
existing GraphQL hooks/handlers — restyle JSX only.
