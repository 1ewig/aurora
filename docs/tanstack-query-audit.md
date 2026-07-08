# TanStack Query v5 — Implementation Audit

Audit date: 2026-07-08

---

## Table of Contents

1. [Provider Configuration](#1-provider-configuration)
2. [Query Hooks](#2-query-hooks)
3. [Mutations](#3-mutations)
4. [Usage in Components/Hooks](#4-usage-in-componentshooks)
5. [Issues by Severity](#5-issues-by-severity)
6. [Summary Table](#6-summary-table)

---

## 1. Provider Configuration

**File:** `src/app/providers.tsx`

```ts
const [queryClient] = useState(() => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,          // 5 minutes
      gcTime: 1000 * 60 * 10,            // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
}));
```

| Setting | Value | Notes |
|---------|-------|-------|
| `staleTime` | 5 min | Applies globally unless overridden |
| `gcTime` | 10 min | Longer than staleTime ✓ |
| `refetchOnWindowFocus` | `false` | Explicit opt-out; keeps stale data visible until manual refetch |
| `refetchOnMount` | not set → `true` | Built-in default |
| `refetchOnReconnect` | not set → `true` | Built-in default |
| `retry` | not set → 3 | Built-in default |

**Missing:** `ReactQueryDevtools` — not present in the provider tree.

---

## 2. Query Hooks

All defined in `src/hooks/queries.ts`.

### 2.1 Storefront Queries

#### `useProductsQuery(category?: string)`

| Property | Value |
|----------|-------|
| Query key | `['products', category \|\| 'All']` |
| staleTime | 5 min (inherited) |

---

#### `useFeaturedProductsQuery(count = 3)`

| Property | Value |
|----------|-------|
| Query key | `['products', 'All']` |
| `select` | Inline arrow function using `new Date().getDate()` for daily rotation |

**🔴 Issue:** Query key `['products', 'All']` collides with `useProductsQuery('All')` and `useRelatedProductsQuery()`. The `count` parameter is not part of the key, so `useFeaturedProductsQuery(3)` and `useFeaturedProductsQuery(6)` share the same cache entry.

**🟡 Issue:** Inline `select` is recreated on every render, causing re-execution even when data hasn't changed. `new Date().getDate()` inside `select` is an impure transform.

---

#### `useRelatedProductsQuery(currentProduct: Product)`

| Property | Value |
|----------|-------|
| Query key | `['products', 'All']` |
| `select` | Inline arrow filtering by `currentProduct.category` |

**🔴 Issue:** Same query key collision as above.

**🟡 Issue:** Inline `select` recreated every render. `currentProduct` is not in the key.

---

#### `usePaginatedProductsQuery(params: PaginatedProductsParams)`

| Property | Value |
|----------|-------|
| Query key | `['products', 'paginated', params]` |
| staleTime | 5 min (inherited) |
| placeholderData | Not set |

**🟡 Issue:** Missing `placeholderData: keepPreviousData`. Page transitions flash a loading state. Admin pagination hooks have this correct.

---

#### `useProductDetailsQuery(slug: string)`

| Property | Value |
|----------|-------|
| Query key | `['product', slug]` |
| staleTime | **0** (always fetches fresh) |
| enabled | `!!slug` |
| `initialData` | Searches `['products']` cache for matching product |

✅ Fetches fresh data on mount, shows cached product immediately.
✅ `enabled: !!slug` prevents falsy-slug fetch.

---

#### `useLookbookQuery()`

| Property | Value |
|----------|-------|
| Query key | `['lookbook']` |
| queryFn | Direct reference (no wrapper) |

✅ Clean.

---

#### `useEditorialQuery()`

| Property | Value |
|----------|-------|
| Query key | `['editorial']` |
| queryFn | Direct reference |

✅ Clean.

---

#### `useOrders(page = 0, limit = 50)`

| Property | Value |
|----------|-------|
| Query key | `["orders", user?.id, page]` |
| staleTime | **2 min** |
| enabled | `!!user?.id` |

**🔴 Issue:** `limit` is **not** in the query key. Different limits produce the same cache key, returning potentially wrong-sized data.

**🟡 Issue:** Missing `keepPreviousData` for page transitions.

**🟢 Minor:** `queryFn` has a redundant guard (`if (!user?.id) return...`) that is already prevented by `enabled`.

---

#### `useCategoriesQuery()`

| Property | Value |
|----------|-------|
| Query key | `["categories"]` |
| staleTime | **10 min** |

✅ Clean.

---

#### `useDailyCategoriesQuery()`

| Property | Value |
|----------|-------|
| Query key | `["categories", "daily"]` |
| staleTime | **30 min** |

✅ Distinct key from `useCategoriesQuery`.

---

### 2.2 Admin Queries

All inherit the 5-minute `staleTime` from the provider.

| Hook | Query Key | placeholderData | Notes |
|------|-----------|-----------------|-------|
| `useAdminDashboardQuery` | `['admin', 'dashboard']` | — | 🟡 5-min stale for dashboard stats |
| `useAdminProductsQuery` | `['admin', 'products', params]` | `keepPreviousData` ✅ | |
| `useAdminOrdersQuery` | `['admin', 'orders', params]` | `keepPreviousData` ✅ | |
| `useAdminUsersQuery` | `['admin', 'users', params]` | `keepPreviousData` ✅ | |
| `useAdminUserSessionsQuery` | `['admin', 'users', userId, 'sessions']` | — | 🟡 Swallows errors |

---

## 3. Mutations

All defined in `src/hooks/queries.ts`.

| Mutation | Endpoint | onSuccess Invalidations | Optimistic | Notes |
|----------|----------|------------------------|------------|-------|
| `useUpdateOrderStatusMutation` | PATCH `/api/admin/orders/:id` | `['admin','orders']`, `['admin','dashboard']` | ❌ | Broad invalidation |
| `useSaveProductMutation` | POST/PUT `/api/admin/products` | `['admin','products']` | ❌ | 🔴 Missing `['products']`, `['product', slug]`, `['products','paginated']` |
| `useDeleteProductMutation` | DELETE `/api/admin/products/:id` | `['admin','products']` | ❌ | 🔴 Same public cache gap |
| `useToggleUserVerifyMutation` | PATCH `/api/admin/users/:id` | `['admin','users']` | ❌ | |
| `useUpdateUserRoleMutation` | PATCH `/api/admin/users/:id` | `['admin','users']` | ❌ | |
| `useDeleteUserMutation` | DELETE `/api/admin/users/:id` | `['admin','users']` | ❌ | |

**Cross-cutting:** None of the 6 mutations use optimistic updates (`onMutate`/`onError`/`onSettled`). Every mutation waits for server response + cache invalidation before the UI reflects the change.

---

## 4. Usage in Components/Hooks

### `src/components/product/detail/ProductDetailClient.tsx`

Uses `useProductDetailsQuery(slug)` + `useProductsQuery()`.

- **🟡 Error gap:** `useProductsQuery` errors are ignored; `data` defaults to `[]`.
- **🟢 Duplication:** Related products filtering logic re-implemented in `useMemo` (lines 40–47) despite `useRelatedProductsQuery` existing.

### `src/components/admin/inventory/InventoryClient.tsx`

Uses `useAdminProductsQuery` + `useDeleteProductMutation`.

- ✅ Distinguishes `isLoading` (initial) vs `isFetching` (background refetch).
- ✅ Conditional rendering: skeleton only on initial load.

### `src/hooks/useOrdersManagement.ts`

Wraps `useAdminOrdersQuery` + `useUpdateOrderStatusMutation`.

- **🟡 Minor:** `loading: isLoading || isFetching` conflates states; `OrdersTable` loading prop is true during background refetches.

### `src/hooks/useUsersManagement.ts`

Uses `useAdminUsersQuery` + 3 mutations + `useAdminUserSessionsQuery`.

- **🟡 Issue:** After mutations, local `selectedUser` state is manually patched but query cache is not updated via `setQueryData`. Gap between mutation success and refetch completion.
- **🟢 Minor:** Error handlers use `alert()`.

### `src/hooks/useCheckoutForm.ts`

- **🟢 Minor:** `queryClient.invalidateQueries({ queryKey: ["orders"] })` — prefix match invalidates all user/order caches regardless of user ID.

---

## 5. Issues by Severity

### 🔴 High

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 1 | Query key collision: `['products', 'All']` shared by 3 hooks | `queries.ts` | `useFeaturedProductsQuery(3)` and `useFeaturedProductsQuery(6)` return same cache entry |
| 2 | `useOrders` missing `limit` in query key | `queries.ts` | Different limit values produce wrong-sized cached data |
| 3 | Save/Delete mutations don't invalidate public product caches | `queries.ts` | Public shop shows stale data for up to 5 min after admin edit |

### 🟡 Medium

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 4 | No `keepPreviousData` on `usePaginatedProductsQuery`, `useOrders` | `queries.ts` | Loading flash on page transitions |
| 5 | Admin queries inherit 5-min `staleTime` | `queries.ts` (hooks 11–15) | Slow visibility of other admin's changes |
| 6 | No optimistic updates on any mutation | All 6 mutations | Latency before UI reflects changes |
| 7 | `useAdminUserSessionsQuery` swallows API errors | `queries.ts` | Silent failures |
| 8 | Inline `select` functions recreated every render | `useFeaturedProductsQuery`, `useRelatedProductsQuery` | Unnecessary re-executions |
| 9 | Error gap in `ProductDetailClient` — `useProductsQuery` errors ignored | `ProductDetailClient.tsx` | Silent failure on related products load |

### 🟢 Low

| # | Issue | Location |
|---|-------|----------|
| 10 | Related products filtering logic duplicated (hook + inline `useMemo`) | `queries.ts` + `ProductDetailClient.tsx` |
| 11 | Redundant guard in `useOrders` `queryFn` | `queries.ts` |
| 12 | No React Query Devtools | `providers.tsx` |
| 13 | No query key factory pattern | Project-wide |
| 14 | Broad `["orders"]` invalidation in checkout | `useCheckoutForm.ts` |
| 15 | `alert()` for mutation errors in user management | `useUsersManagement.ts` |

---

## 6. Summary Table

### Queries

| Hook | Query Key | staleTime | enabled | placeholderData | initialData | select |
|------|-----------|-----------|---------|----------------|-------------|--------|
| `useProductsQuery` | `['products', category\|'All']` | 5m | — | — | — | — |
| `usePaginatedProductsQuery` | `['products','paginated',params]` | 5m | — | — | — | — |
| `useFeaturedProductsQuery` | `['products','All']` 🔴 | 5m | — | — | — | ❌ inline |
| `useRelatedProductsQuery` | `['products','All']` 🔴 | 5m | — | — | — | ❌ inline |
| `useProductDetailsQuery` | `['product',slug]` | **0** | `!!slug` ✅ | — | ✅ cache | — |
| `useLookbookQuery` | `['lookbook']` | 5m | — | — | — | — |
| `useEditorialQuery` | `['editorial']` | 5m | — | — | — | — |
| `useOrders` | `["orders",user?.id,page]` | **2m** | `!!user?.id` ✅ | — | — | — |
| `useCategoriesQuery` | `["categories"]` | **10m** | — | — | — | — |
| `useDailyCategoriesQuery` | `["categories","daily"]` | **30m** | — | — | — | — |
| `useAdminDashboardQuery` | `['admin','dashboard']` | 5m | — | — | — | — |
| `useAdminProductsQuery` | `['admin','products',params]` | 5m | — | ✅ keepPreviousData | — | — |
| `useAdminOrdersQuery` | `['admin','orders',params]` | 5m | — | ✅ keepPreviousData | — | — |
| `useAdminUsersQuery` | `['admin','users',params]` | 5m | — | ✅ keepPreviousData | — | — |
| `useAdminUserSessionsQuery` | `['admin','users',userId,'sessions']` | 5m | `!!userId` ✅ | — | — | — |

### Mutations

| Mutation | onSuccess Invalidations | Optimistic | onError |
|----------|------------------------|------------|---------|
| `useUpdateOrderStatusMutation` | `['admin','orders']`, `['admin','dashboard']` | ❌ | — |
| `useSaveProductMutation` | `['admin','products']` 🔴 missing public | ❌ | — |
| `useDeleteProductMutation` | `['admin','products']` 🔴 missing public | ❌ | — |
| `useToggleUserVerifyMutation` | `['admin','users']` | ❌ | — |
| `useUpdateUserRoleMutation` | `['admin','users']` | ❌ | — |
| `useDeleteUserMutation` | `['admin','users']` | ❌ | — |
