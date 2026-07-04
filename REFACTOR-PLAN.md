# Refactor Plan — Hooks & Business Logic Duplication

Analysis of hooks, API routes, stores, and lib for code duplication and efficiency improvements.

---

## HIGH PRIORITY — Do These

| # | Finding | Files | Impact |
|---|---------|-------|--------|
| **1** | **Pricing logic exists as `calculateOrderPricing()` in `utils/pricing.ts` but is never imported.** The same 3 lines are copy-pasted in 4 other files. | `utils/pricing.ts` (unused), `hooks/useCheckoutForm.ts`, `api/checkout/session/route.ts`, `api/orders/route.ts`, `api/webhooks/lemonsqueezy/route.ts` | Magic numbers (`500`, `25`, `0.08`) in 5 places. Tax rate change = hunt 5 files. |
| **2** | ~~**`useOrderProcessing.ts` is dead code.** Never imported anywhere. Contains the same filtering logic as `useOrdersManagement.ts`.~~ | ~~`hooks/useOrderProcessing.ts`~~ | ~~39 lines of dead code. Confusing for future agents.~~ ✅ Resolved in Phase 6 |
| **3** | **Auth init logic (role fetch + user object build) duplicated 3 times.** | `stores/useAuthStore.ts` (signIn + signUp), `hooks/useInitializeAuth.ts` | Same pattern with slight variations. Adding a user field = edit 3 places. |
| **4** | **`sanitize()` function duplicated 3 times.** Identical 1-line function. | `api/webhooks/lemonsqueezy/route.ts`, `api/orders/route.ts`, `api/checkout/session/route.ts` | 3 copies, no shared source of truth. |
| **5** | **`sanitizeShippingAddress()` duplicated 3 times with null-safety inconsistency.** The webhook handler defensively wraps `\|\| ""`, the other two don't — meaning `null` values would crash them. | `api/webhooks/lemonsqueezy/route.ts`, `api/orders/route.ts`, `api/checkout/session/route.ts` | Bug + duplication. |

---

## MEDIUM PRIORITY — Worth Doing

| # | Finding | Files | Impact |
|---|---------|-------|--------|
| **6** | **Order confirmation email duplicated in 2 files** (~40 lines each). | `api/webhooks/lemonsqueezy/route.ts`, `api/orders/route.ts` | Email content drift risk between the two fulfillment paths. |
| **7** | **`withTransaction()` boilerplate (BEGIN/COMMIT/ROLLBACK/release) repeated 6 times.** | webhook, orders, checkout, admin/products x3 | ~30 lines of identical scaffolding. Easy to forget `release()`. |
| **8** | **`requireEnv()` duplicated 3 times.** | `lib/auth.ts`, `lib/insforge.server.ts`, `api/insforge-token/route.ts` | Trivial extraction. |
| **9** | **Shipping address validation inconsistent.** Orders route returns field-specific errors; checkout route returns a generic blob. Same validation, different UX. | `api/orders/route.ts`, `api/checkout/session/route.ts` | Users get worse error messages in checkout. |
| **10** | **`VerifiedItem` interface duplicated 2 times.** | `api/webhooks/lemonsqueezy/route.ts`, `api/orders/route.ts` | Same cart item shape, 2 definitions. |

---

## LOW PRIORITY — Skip Unless Bothering You

| # | Finding | Recommendation |
|---|---------|----------------|
| Admin hooks use manual fetch vs React Query | Leave as-is. Converting admin hooks to React Query is a larger refactor with mixed ROI. |
| `useProductFilter` URL param manipulation (4x `params.set("page","1")`) | Minor. Could merge `handleCategoryChange` + `applyFilters` but ~15 lines saved. |
| `useProductForm` snapshot built 3 times | Minor. Extractable but small payoff. |
| Two separate DB pools (`utils/db.ts` + `lib/auth.ts`) | Leave as-is. `lib/auth.ts` pool sets `search_path` for Better Auth — different concerns. |
| InsForge client factory in 4 files | Likely a migration in progress. Don't touch. |
| `useAdminDashboard` pass-through hook | Works, adds indirection but keeps patterns consistent. Leave it. |
| `loading`/`error` boilerplate in Zustand stores (13 occurrences) | Natural Zustand pattern. Not worth abstracting. |

---

## Implementation Plan

### Step 1: Create `src/utils/sanitize.ts`

New file. Exports:

- `sanitize(s: string): string` — strips HTML tags, trims, slices to 200 chars
- `ShippingAddress` interface — canonical shape for shipping address objects
- `sanitizeShippingAddress(raw: Record<string, any>): ShippingAddress` — defensive sanitization with `|| ""` fallback on every field
- `validateShippingAddress(address: Record<string, any>): string | null` — returns first missing field error message, or `null` if valid
- `VerifiedItem` interface — canonical cart item shape

### Step 2: Create `src/utils/env.ts`

New file. Exports:

- `requireEnv(name: string): string` — reads `process.env[name]`, throws if missing

### Step 3: Edit `src/utils/db.ts`

Add `withTransaction` helper:

```ts
import type { PoolClient } from 'pg';

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
```

### Step 4: Edit `src/lib/email.ts`

Add `sendOrderConfirmation` helper:

```ts
interface OrderConfirmationData {
  orderNumber: string;
  email: string;
  address: ShippingAddress;
  items: VerifiedItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export async function sendOrderConfirmation(data: OrderConfirmationData) {
  // builds customerName, itemRows, calls sendEmail with text + html templates
}
```

### Step 5: Edit `src/stores/useAuthStore.ts`

Add private helper inside the store module:

```ts
async function resolveUserRole(rawUser: { id: string; email: string; name?: string | null; emailVerified?: boolean | null; image?: string | null }) {
  const roleRes = await fetch("/api/auth/role").catch(() => null);
  const roleData = roleRes && roleRes.ok ? await roleRes.json() : { isAdmin: false, role: 'user' };
  const profile = normalizeProfile({ displayName: rawUser.name || "" });
  return {
    user: { ...rawUser, isAdmin: roleData.isAdmin, role: roleData.role },
    profile,
  };
}
```

Refactor `signIn` and `signUp` to call `resolveUserRole` instead of duplicating the role-fetch + user-build logic.

### Step 6: Edit `src/hooks/useInitializeAuth.ts`

Simplify to delegate to the store's own initialization rather than reimplementing role-fetch + user-build.

### Step 7: ✅ Resolved in Phase 6 — `src/hooks/useOrderProcessing.ts` deleted.

### Step 8: Update files that duplicate extracted utilities

- `api/webhooks/lemonsqueezy/route.ts` — import `sanitize`, `sanitizeShippingAddress`, `VerifiedItem` from `utils/sanitize`. Import `calculateOrderPricing` from `utils/pricing`. Use `sendOrderConfirmation` from `lib/email`. Use `withTransaction` from `utils/db`.
- `api/orders/route.ts` — same imports. Replace inline pricing, sanitize, email logic.
- `api/checkout/session/route.ts` — import `sanitize`, `sanitizeShippingAddress`, `validateShippingAddress`, `VerifiedItem` from `utils/sanitize`. Import `calculateOrderPricing` from `utils/pricing`. Use `withTransaction` from `utils/db`.
- `hooks/useCheckoutForm.ts` — import `calculateOrderPricing` from `utils/pricing`.
- `lib/auth.ts` — import `requireEnv` from `utils/env`.
- `lib/insforge.server.ts` — import `requireEnv` from `utils/env`.
- `api/insforge-token/route.ts` — import `requireEnv` from `utils/env`. Import JWT signing from `lib/insforge.server.ts` (or extract to a shared helper).

---

## Files Changed Summary

| Action | File |
|--------|------|
| **Create** | `src/utils/sanitize.ts` |
| **Create** | `src/utils/env.ts` |
| ~~**Delete**~~ | ~~`src/hooks/useOrderProcessing.ts`~~ ✅ Done |
| **Edit** | `src/utils/db.ts` — add `withTransaction` |
| **Edit** | `src/lib/email.ts` — add `sendOrderConfirmation` |
| **Edit** | `src/stores/useAuthStore.ts` — add `resolveUserRole` helper |
| **Edit** | `src/hooks/useInitializeAuth.ts` — simplify to delegate to store |
| **Edit** | `src/app/api/webhooks/lemonsqueezy/route.ts` — use shared utils |
| **Edit** | `src/app/api/orders/route.ts` — use shared utils |
| **Edit** | `src/app/api/checkout/session/route.ts` — use shared utils |
| **Edit** | `src/hooks/useCheckoutForm.ts` — import pricing utility |
| **Edit** | `src/lib/auth.ts` — import `requireEnv` |
| **Edit** | `src/lib/insforge.server.ts` — import `requireEnv` |
| **Edit** | `src/app/api/insforge-token/route.ts` — import `requireEnv` |
