# Implementation Plan: Backend Security Hardening

We will implement backend security fixes to address the vulnerabilities identified in the Aurora authentication and order flow.

---

## User Review Required

> [!IMPORTANT]
> **Authentication for GET & POST `/api/orders`**:
> 1. **GET `/api/orders`**: We will enforce strict authentication. The server will extract the access token from cookies or the `Authorization` header, verify the session using the InsForge SDK, and retrieve the logged-in user's ID. The route will *only* return orders belonging to that verified user ID, ignoring any user-controlled query parameters (preventing Insecure Direct Object Reference (IDOR)).
> 2. **POST `/api/orders`**: 
>    - If the user is authenticated, the order is associated with their verified `user_id`.
>    - If the user is checking out as a guest (unauthenticated), we will set `user_id = null` (a guest order). We will *no longer* lookup and link guest checkouts to registered accounts without authentication, preventing attackers from injecting arbitrary orders into other users' accounts.
> 
> **Rate Limiting `/api/auth/check-user`**:
> - We will add an in-memory IP-based rate limiter (sliding window/token bucket) to protect `/api/auth/check-user`.
> - Limits: 10 requests per minute per client IP. If exceeded, returns `429 Too Many Requests`.

---

## Proposed Changes

### Component: Orders API Security

#### [MODIFY] [route.ts](file:///c:/Users/moshu%20moshu/Desktop/aurora/src/app/api/orders/route.ts)
- Import `cookies` from `next/headers` and `createServerClient` from `@insforge/sdk/ssr`.
- In `GET`:
  - Initialize the server client: `createServerClient({ cookies: await cookies() })`.
  - Fetch the user using `await insforge.auth.getCurrentUser()`.
  - If no authenticated user is found, return a `401 Unauthorized` error response.
  - Query the database using the verified `user.id` directly, completely ignoring client-supplied `userId` or `email` parameters.
- In `POST`:
  - Verify the session token using `createServerClient`.
  - If authenticated, assign the verified `user.id` as the order's user ID.
  - If unauthenticated (guest checkout), assign `null` as the order's user ID. Do not look up registered accounts using the user-supplied email address.

---

### Component: Auth Security

#### [MODIFY] [route.ts](file:///c:/Users/moshu%20moshu/Desktop/aurora/src/app/api/auth/check-user/route.ts)
- Implement an in-memory IP rate limiter:
  - Key the client by IP (retrieved from `x-forwarded-for` or request fallback).
  - Clean up expired rate-limit entries periodically or on-the-fly.
  - Reject requests with status `429` if a client exceeds 10 attempts per minute.

---

## Verification Plan

### Automated Tests
- Run `npx tsc --noEmit` to verify type safety.
- Run `npm run lint` to verify ESLint compliance.

### Manual Verification
1. **Unauthenticated GET /api/orders**:
   - Access `/api/orders` directly in the browser or via curl without logging in.
   - Confirm it returns a `401 Unauthorized` response.
2. **Authenticated GET /api/orders (IDOR prevention)**:
   - Log in as User A.
   - Request `/api/orders?userId=USER_B_ID` or `/api/orders?email=user_b@example.com`.
   - Confirm the API ignores the query params and returns *only* User A's orders.
3. **Guest Checkout POST /api/orders**:
   - Complete checkout as a guest using User A's registered email address without logging in.
   - Confirm the order is created successfully as a guest order (`user_id = null`) and is *not* linked to User A's profile.
4. **Rate Limit /api/auth/check-user**:
   - Perform more than 10 requests to `/api/auth/check-user` within one minute.
   - Confirm it rejects subsequent requests with a `429 Too Many Requests` status code.
