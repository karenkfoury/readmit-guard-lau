

# Fix Login & Signup Blocking Issue

## Problem
The `useAuth` hook has a race condition: both `onAuthStateChange` (INITIAL_SESSION event) and `getSession()` fire on mount, each calling `syncAuthState`. The second call increments `requestIdRef`, which invalidates the first call's profile fetch results. Then the second call starts its own profile fetch with retry delays (0 + 150 + 400 + 800ms). This causes the `loading` state to stay `true` for an extended period, blocking the login form from rendering and blocking post-login redirects.

## Fix — Rewrite `useAuth` hook

**File: `src/hooks/useAuth.ts`**

Replace the current dual-trigger pattern with a clean sequential approach:

1. **Call `getSession()` first** to restore any existing session, set user/profile, and mark `loading = false`
2. **Then subscribe to `onAuthStateChange`** only for subsequent events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED) — skip the INITIAL_SESSION event since `getSession()` already handled it
3. **Remove retry delays for profile fetch on login** — fetch profile once; if it fails, use the fallback profile immediately (the trigger creates the profile synchronously, so it should be available instantly)
4. **Keep one simple retry** (single 300ms wait + one retry) only for signup flows where the trigger might have a slight delay

### Simplified flow:
```
Mount → getSession() → if session exists, fetch profile (single attempt) → set state → loading = false
onAuthStateChange (SIGNED_IN) → fetch profile (single attempt + 1 retry) → set state
```

### Key changes:
- Remove `PROFILE_RETRY_DELAYS` array with 4 entries; replace with at most 1 retry after 300ms
- In `useEffect`, call `getSession()` first, then set up `onAuthStateChange` and skip `INITIAL_SESSION` event to avoid double-processing
- Keep the `requestIdRef` race-condition guard but eliminate the source of the double-fire
- Keep `buildFallbackProfile` as immediate fallback if profile fetch fails

**File: `src/routes/login.tsx`** — No changes needed; the current code is clean. The fix is entirely in the hook.

