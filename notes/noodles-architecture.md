# Noodles Admin — Architecture Map

## 1. Apps (monorepo)
- `apps/admin` → Next.js admin / vendor dashboard (App Router, next-intl, Apollo)
- `apps/api` → Express + GraphQL backend
- `apps/customer` → customer app
- `apps/rider` → rider app
- `apps/store` → store/vendor app
- `apps/web` → marketing

Shared: `apps/admin/lib/{context,ui,hooks,api,utils}`

## 2. Data flow (admin)
**Page (app/.../page.tsx)** ➜ **screen** (`lib/ui/screens/...`) ➜ **screen-components** (`lib/ui/screen-components/...`) ➜
**context** (`lib/context/...`) ➜ **GraphQL** (`lib/api/graphql/...`)

## 3. GraphQL
Defined in: `apps/admin/lib/api/graphql/...`
- queries: see `gql_summary.txt`
- mutations: see `gql_summary.txt`
- TODAY: `GET_RESTAURANT_PROFILE` now returns `openingTimes ✅`

## 4. Contexts
Defined in: `apps/admin/lib/context/...`
- `RestaurantLayoutContext` → holds `restaurantId`, `shopType`
- `ToastContext` → global toasts
- `ProfileContext` → restaurant profile
All admin/store routes that live under  
`apps/admin/app/(localized)/(protected)/(other-users)/admin/store/...`  
are wrapped with:
- `RESTAURANT_GUARD`
- `RestaurantLayoutProvider`
- `ProfileProvider`

## 5. Important rule
Some pages **break on refresh** if context is empty → we fixed that for timing by:
- reading from `localStorage` (`SELECTED_RESTAURANT`)
- rehydrating context in `useEffect`
- updating GraphQL query to actually fetch the field

## 6. Debugging flow (use this every time)
1. Find page in `component_map.txt`
2. See which screen-component it renders
3. Check which context it needs (from `context_map.txt`)
4. Check which GraphQL query it calls (`gql_summary.txt`)
5. If UI is empty → 90% it’s because query didn’t request the field