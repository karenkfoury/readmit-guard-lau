

# Redesign Patient Home Tab — Daily Recovery Dashboard

## Overview
Replace the current patient home tab (`src/routes/patient.index.tsx`) with a day-centric recovery dashboard featuring a 3-day vertical timeline with task checklists, and add a "Log Symptoms" flow via a new modal/sheet component.

## What Changes

### 1. Rewrite `src/routes/patient.index.tsx`
The entire component gets replaced. New structure:

**Top section**: Current date displayed prominently (e.g., "Wednesday, April 16") in Raleway heading style.

**Recovery Timeline section**: A vertical layout with 3 day rows (previous day, current day, next day). Each row has:
- **Left**: A circular day bubble showing "Day X" (post-discharge day number computed from `medicalRecord.discharge_date`)
- **Right**: A checklist card with that day's tasks

Current-day bubble: larger (h-16 w-16), LAU green bg with white text, ring accent. Previous/next bubbles: smaller (h-10 w-10), soft border, muted. Connected by a vertical line in `--lau-border`.

**Checklist items per day** (dynamically generated):
- "Take medication" — every day. Links to `/patient/medications`. Checked if all today's medication_logs are taken.
- "Complete Day X check-up" — only on days 3, 7, 14. Links to `/patient/checkin/$day`. Checked if that check_in status is 'completed'. Shows sub-label (Day 3: "Check weight · Review symptoms", Day 7: "Medication adherence · Side effects", Day 14: "Overall status · Schedule follow-up").
- "Follow-up appointment" — only if there's a notification of type matching that day (stretch — for now, skip unless data supports it).

Task completion state: read from existing Supabase data (check_ins status, medication_logs). Checking the medication checkbox navigates to `/patient/medications`. Checking the check-up form navigates to the check-in flow.

**Bottom area**: "Log Symptoms" button — rounded-full, LAU green outline style, positioned at the bottom-right of the timeline section.

### 2. Create `src/components/patient/SymptomLogSheet.tsx`
A sheet/dialog that opens when "Log Symptoms" is tapped. Contains a lightweight symptom form:
- "How are you feeling today?" — card buttons: Great / Good / Okay / Not great / Bad
- "Any pain or discomfort?" — Yes/No cards
- "Any shortness of breath?" — None / Mild / Moderate / Severe cards  
- "Any swelling or fatigue?" — multi-select chips
- "Did anything feel worse today?" — Yes/No
- "Optional notes" — textarea

On submit: inserts a row into `vitals` table (source: 'patient_self_report') with relevant fields mapped, then calls `recalculateRiskForPatient`. Shows a toast confirmation.

### 3. Create `src/components/patient/DayBubble.tsx`
Reusable component for the timeline day circles. Props: `dayNumber`, `isCurrentDay`, `isCompleted`.

### 4. Create `src/components/patient/DayChecklist.tsx`  
Reusable component for the task list next to each bubble. Props: `dayNumber`, `currentDay`, `checkIns`, `medications`, `medicationLogs`, `onLogSymptoms`.

### Files to create
- `src/components/patient/DayBubble.tsx`
- `src/components/patient/DayChecklist.tsx`
- `src/components/patient/SymptomLogSheet.tsx`

### Files to update
- `src/routes/patient.index.tsx` — full rewrite

### Files NOT touched
- All other routes, Supabase schema, edge functions, styles.css, store, hooks

## Technical Details
- Day calculation: `Math.ceil((Date.now() - new Date(discharge_date).getTime()) / 86400000)`
- Check-in completion: look up `checkIns.find(c => c.day_number === X)?.status === 'completed'`
- Medication completion: compare today's `medication_logs` (taken=true) count vs `medications` count
- Symptom log writes to `vitals` table with `source: 'patient_self_report'` and structured pain/SOB/swelling data in the `notes` field
- Uses existing Sheet component from shadcn/ui for the symptom form
- All Framer Motion animations kept subtle (fade + slide, consistent with rest of app)

