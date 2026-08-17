# BTB Store App Revamp — Status

Source of truth: `BTB Store App.dc.html` mockup exported from Claude Design
(zip: `Food delivery Store app design.zip`, 7 screens — New orders, Processing,
Delivered, New order/walk-in, Customize, Cart, Store drawer). Same brand as
the customer app (`apps/app`) — see `apps/app/BTB_APP_REVAMP_STATUS.md` and
`apps/app/src/utils/themeColors.js` for the canonical palette; keep both in
sync if the brand changes.

## Palette (identical to customer app)

- Red `#FF1D02` (primary/accent), Black `#0A0A0A` (chrome/text), Cream
  `#F4F2EF` (screen bg), Border `#E4E1DD`, White `#FFF`.
- Fonts: **Anton** (headlines, buttons, prices — always uppercase) and
  **Archivo** 400–900 (body/labels). Files copied into
  `lib/assets/fonts/Anton/` and `lib/assets/fonts/Archivo/`, wired into
  `app/_layout.tsx`'s `useFonts` call as `Anton`, `Archivo400`...`Archivo900`.
- Visual language: square corners everywhere (no `rounded-*`), 2px borders,
  uppercase micro-labels with wide letter-spacing.

## Done this session (2026-08-13)

**Foundation** (cascades app-wide via `appTheme`):
- `lib/utils/constants/colors.ts` — full BTB light/dark palette, same key
  names as before so every screen using `appTheme.xxx` picked it up for free.
- `lib/utils/constants/font-styles.ts` — new, mirrors the customer app's
  `fontStyles` constant.
- `app/_layout.tsx` — Anton + Archivo font loading added.

**Rebuilt to match the mockup:**
- Bottom tab bar (`app/(protected)/(tabs)/_layout.tsx`) — flat black bar,
  red active tint, uppercase Archivo800 labels, no floating/rounded card.
- Drawer chrome (`lib/ui/layouts/home-drawer/drawer-main/DrawerMain.tsx`) —
  black header bar, red square hamburger button, Anton white title.
- Drawer header (`lib/ui/screen-components/home/drawer/drawer-header`) — red
  block, black "BTB" badge (or logo), Anton store name, availability toggle.
- Drawer content rows (`.../drawer/drawer-content`) — square icon chips,
  Archivo800 labels, 2px row dividers (was rounded-full icons + thin borders).
- Availability switch (`lib/ui/useable-components/switch-button`) — plain
  black track + square white knob, no rounded pill/check-icon (was a
  rounded indigo switch).
- Orders sub-tab bar (`app/(protected)/(tabs)/home/orders/_layout.tsx`) —
  uppercase Archivo, thick red underline on the active tab.
- Delivery/Pickup segmented control (`lib/ui/useable-components/custom-tab`)
  — two square buttons, red/white active state, black count-badge chip
  (was rounded pills with a red circle badge).
- **Order card** (`lib/ui/useable-components/order`) — the single component
  driving all of New/Processing/Delivered: squared card, black "ORDER/PRICE"
  header bar, Anton order id + total, black/red/white status badge
  (pending/accepted/delivered), Accept/Decline in Anton, kitchen-timer strip,
  "Hand order to customer" button. All existing GraphQL hooks/handlers
  (`useCancelOrder`, `useOrderPickedUp`, `useMarkOrderReady`, accept-time
  modal trigger) preserved untouched — only JSX/styling changed.
- "New Order" quick-action button on the New Orders tab — square red button,
  Anton label (was a rounded pill).
- POS `_layout.tsx` stack header — black bg, white Anton title.
- POS menu screen — square category chips (black when active), square "＋"
  add button per item, full-width red "View Cart" bar (was pill-shaped).
- POS item-detail/Customize screen — Anton item title, squared variation
  radio rows, squared ingredient checkboxes, squared textarea.
- POS cart screen — line items restyled, Anton total, "Send to Kitchen"
  button (was "Place Order").
- Shared: `menu-item-card`, `cart-line-item`, `quantity-stepper`,
  `custom-continue-button` all squared off and moved to Anton/Archivo.

**Verified:** `npx tsc --noEmit` — 80 errors after vs. 86 on `main` before
(all 86 are pre-existing/unrelated; confirmed via `git stash` diff). No new
type errors introduced. **Not yet verified on-device/simulator** — per prior
session preference, device builds are left to the user to run.

## Also done (2nd pass, same session) — screens outside the 7-screen mockup

These weren't in the Claude Design export but were visually stale after the
first pass (inheriting new colors via the `colors.ts` cascade but not the
Anton/blocky treatment), so extended the same visual language to them:

- `SetTimeScreenAndAcceptOrder` (accept-time bottom sheet) — Anton title,
  black square close button, squared time chips.
- `NoRecordFound` — Anton uppercase message, icon above instead of inline.
- Login screen — black "BTB" square brand mark (was a generic envelope
  icon), Anton headline, squared 2px-bordered inputs (was rounded).
- Profile header — square black logo badge (was a rounded avatar + text
  shadow trick), Anton store name.
- Wallet screen — Anton balance figure and section headers ("Current
  Balance", "Pending Request", "Recent Transactions"), full-width button.
- Earnings screen — Anton "Recent Activity" header, red "See More" link,
  Anton empty-state text.
- `RecentTransaction` row and `EarningStack` row — uppercase Archivo800
  labels, Anton amounts, red accent (was blue/`linkColor`).
- Profile "Documents" section (`docs/documents`) — Archivo800 uppercase
  section labels, squared "Submitted/Missing Data" badge, Anton "Theme"
  label.
- Bank Management form — Archivo800 uppercase field labels, squared 2px
  input borders (was rounded gray).
- Language screen — squared row dividers, Archivo800 language labels.
- Help screen — squared WhatsApp CTA (kept WhatsApp's own green — that's
  the platform's brand, not BTB's), squared/Anton FAQ accordion
  (`HelpAccordian`).
- Work Schedule — Anton day labels and "Select Time Slot" dropdown title,
  squared time-slot buttons and add/remove buttons (was rounded-full),
  squared dropdown panel.

## Also done (3rd pass) — earnings-detail / earnings-order-details / withdraw-success

- `earning-details/header` ("Summary" panel) — Anton totals, Archivo800
  uppercase labels.
- `earning-details/date-filter` — uppercase Archivo800 "Date Filter"/"Clear
  Filters" labels, calendar itself untouched (third-party
  `react-native-calendars`, already keyed to `Colors.light.primary`).
- `earning-order-details/order-stack` — squared row, Anton amount, red
  "Completed" chip (was rounded green).
- `withdrawrequest-success/success-modal` — squared card (was rounded with
  a heavy shadow hack), Anton confirmation headline.

## Not yet touched (intentionally — broken/unreachable, not a styling gap)

- Order-details / item-details subpages under
  `lib/ui/screen-components/home/orders/main/` — `order-details/index.tsx`
  is an unused stub (not wired to any route); `item-details/index.tsx` is
  dead code (not imported anywhere).
- Chat screen (`lib/ui/screen-components/chat`, routed via
  `app/(protected)/chat`) — nothing in the app navigates to `/chat` (no
  `router.push` calls found), and its data hook `useChat.tsx` already has
  pre-existing broken imports (`CHAT` query and `SUBSCRIPTION_NEW_MESSAGE`
  don't exist) per the baseline `tsc` errors — it doesn't currently render
  real data even if reached. Restyling it would be cosmetic work on a
  feature that doesn't function; fix the underlying wiring first if this
  screen needs to ship.

## Bugs found from on-device screenshots (2026-08-13, fixed)

- **Invisible text in system Dark Mode.** `colors.ts`'s `dark` palette had
  `fontMainColor: "#FFF"` while several restyled components hardcode
  `backgroundColor: appTheme.white` for card surfaces (matching the mockup,
  which is white-card-on-cream regardless of theme) — so on a phone with iOS
  Dark Mode on, text rendered white-on-white and vanished (order IDs, totals,
  item names, headline text on the Customize screen, etc). The BTB mockup
  has no designed dark mode — it's a single light identity with black used
  only for chrome. Fix: `dark` in `lib/utils/constants/colors.ts` now
  mirrors `light` exactly, so the app always renders the intended look
  regardless of system theme. If a real dark mode is ever designed, split
  them again — but do it by re-theming every white-card surface
  consistently, not just flipping `fontMainColor`.
- **Kitchen-timer pie icon was still green.** `TimeLeftIcon`
  (`lib/ui/useable-components/svg/time-left.tsx`) is a static two-tone SVG
  (white circle + a pie-wedge `Path`) — the wedge was hardcoded
  `fill="#90E36D"` (old Enatega green), never touched by the color cascade
  since it's baked into the SVG, not `appTheme`-driven. Changed to
  `#FF1D02`. Note: it's a **static** wedge shape, not an actual
  progress-driven pie chart like the mockup's `conic-gradient` — it doesn't
  animate with the countdown. Revisit if an actually-progressing pie matters.

## How to continue

Pick up from "Not yet touched" above, same pattern as `apps/app`'s revamp:
read the relevant file(s), match the BTB visual language (square, 2px
borders, Anton headlines, Archivo800 uppercase labels, red/black/white/cream
only), preserve all existing hooks/handlers/GraphQL wiring exactly — only
change JSX/styling.
