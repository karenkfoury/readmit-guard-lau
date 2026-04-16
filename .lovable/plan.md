

# Fix Patient Tab Errors

## Root Cause

Two issues are crashing the patient tabs:

1. **Duplicate realtime channel**: `usePatientData(user?.id)` is called in both the parent layout (`patient.tsx`) AND the child route (`patient.index.tsx`). Both instances create a Supabase realtime channel with the same name (`patient-{id}`), causing the error: *"cannot add postgres_changes callbacks after subscribe()"*.

2. **`.single()` without data**: `medical_records` and `ehr_intake_responses` queries use `.single()` which throws when no row exists.

## Fix

### 1. `src/hooks/usePatientData.ts` — Fix realtime and queries

- Replace `.single()` with `.maybeSingle()` on `medical_records` and `ehr_intake_responses` queries to handle missing data gracefully.
- Add a unique suffix to the channel name using a `useRef` counter (e.g., `patient-${patientId}-${instanceId}`) so multiple hook instances don't collide. Alternatively, merge the two `useEffect` hooks into one so the channel is built and subscribed atomically.

### 2. `src/routes/patient.tsx` — Remove duplicate data fetch

- The layout only needs `ehrIntake` (for the intake redirect) and `notifications` (for the badge count).
- Replace the full `usePatientData` call with two lightweight, targeted queries (one for `ehr_intake_responses`, one for `notifications`) that do NOT create realtime channels. This eliminates the duplicate channel entirely.
- This is the cleanest fix: keep `usePatientData` with realtime only in child routes that actually need the full dataset.

### 3. `src/routes/patient.index.tsx` — No changes needed

The child route's `usePatientData` call is fine on its own once the parent stops creating a competing channel.

## Files Changed

| File | Change |
|------|--------|
| `src/routes/patient.tsx` | Replace `usePatientData` with two simple queries for `ehrIntake` and `notifications` |
| `src/hooks/usePatientData.ts` | Change `.single()` → `.maybeSingle()` on two queries |

