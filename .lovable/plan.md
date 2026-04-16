

# ReAdmit Guard — LAU Post-Discharge Monitoring System

## Overview
A fully interactive, demo-ready clinical web application that predicts and prevents 30-day hospital readmissions. LAU-branded, visually polished, with a transparent AI risk engine and complete patient + doctor workflows.

## Brand & Design System
- **Colors**: Primary LAU Green #006751, Anthracite #3A3E3F, White #FFFFFF, Light BG #F7FAF9, Borders #D9E3DF
- **Risk colors**: Low #16A34A, Moderate #F59E0B, High #DC2626
- **Fonts**: Raleway (headings) + PT Sans (body) via Google Fonts
- **Style**: Rounded-xl cards, thin borders, soft shadows, generous whitespace, academic-medical feel
- **Animations**: Framer Motion page transitions, count-up KPIs, hover effects

## Routes & Pages

### Landing Page (`/`)
- LAU green header with "ReAdmit Guard | LAU Health" wordmark
- Hero with animated stat counter ("1 in 5 patients...")
- "The Real Cost" 3-column section
- "Meet Sarah" narrative card with CTA
- Role selection: Patient / Doctor cards
- LAU footer

### Login (`/login`)
- Two-card role selector (Patient/Doctor)
- Mock auth — any credentials work, role determines routing

### Patient Experience (mobile-first)
- **Dashboard** (`/patient`): Greeting, profile card, recovery progress stepper (Day 3/7/14), next check-in countdown, notifications
- **Survey Flow** (`/patient/checkin/:day`): One question per screen with large touch targets. Day 3 (symptoms), Day 7 (medication), Day 14 (overall status). Submission triggers risk recalculation with confirmation animation
- **History** (`/patient/history`): Timeline of past check-ins with trend mini-charts

### Doctor Experience
- **Risk Dashboard** (`/doctor`): KPI row (4 animated cards), filter bar, patient table/card grid with risk scores + trend arrows, action queue sidebar, risk distribution donut chart. "🎬 Start Demo Tour" floating button
- **Patient Detail** (`/doctor/patient/:id`): Radial risk gauge, explainability panel (top 5 factors as bar chart with plain-language labels), tabs (Overview / Timeline / Surveys / Care Plan), action buttons
- **Schedule** (`/doctor/schedule`): Kanban board (Today/This Week/Upcoming/Completed) with drag-and-drop, clinician filters
- **Alerts** (`/doctor/alerts`): Chronological feed with anti-alert-fatigue indicator ("3 alerts today, not 47"), acknowledge/action buttons

## Risk Engine (`/src/lib/riskEngine.ts`)
- Transparent weighted formula: age, comorbidities, prior admissions, polypharmacy, social isolation, weekend discharge
- Survey adjustments: weight gain, symptom worsening, SOB, missed meds, self-rating, attention requests
- Capped at 100, recomputed per check-in, full history stored for trends
- Every score explainable with contributing factors + point values

## Smart Routing Logic
- Symptom escalation → Doctor/Nurse
- Medication issues → Pharmacist/Nurse
- General decline → Doctor follow-up
- Social/access issues → Social Worker
- Displayed as "Suggested assignee" + "Suggested action"

## Anti-Alert-Fatigue System
- Alerts only on: first 50% crossing, 15+ point increase, serious self-reported deterioration
- "Quiet Mode" indicator showing the system is filtering noise
- Dashboard updates silently for non-critical changes

## Mock Data
- 12-15 patients with 4 demo heroes (Sarah Chen 87%, John Mansour 42%, Maya Khoury 18%, Karim Saade 71%)
- Varied diagnoses: heart failure, diabetes, pneumonia, hypertension, COPD, sepsis, hip replacement, stroke, kidney disease
- 8 clinicians: 3 nurses, 2 pharmacists, 1 social worker, 2 physicians with avatar initials

## Demo Polish
- Guided demo tour on doctor dashboard
- Count-up animations on all KPIs
- Loading skeletons with simulated delays
- "DEMO MODE" pill in top-right
- Keyboard shortcut "/" for search
- Reassuring empty states
- Framer Motion page transitions

## Key Components
RiskBadge, RiskGauge (radial), PatientCard, CheckInCard, KPICard, ProgressStepper, ClinicianAvatar, LAUHeader, SurveyQuestion, ActionQueue, RiskExplainer

## State Management
Zustand store for current user/role, patients, check-in responses, alerts, follow-ups, and risk history

