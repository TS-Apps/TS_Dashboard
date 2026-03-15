# TS Dashboard — Proposed New Features

Analysed against the existing feature set (v2.8.9-Cloud-AI) to identify the highest-value additions.

---

## 1. Interactive Progress Charts & Visualisations

**Gap:** All data is presented in tables and grids; there are no trend charts.

**Proposed additions:**
- Attendance trend line per cadet or whole unit (monthly % over rolling 12 months)
- Rank progression bar chart showing cohort distribution across all ranks
- Qualification velocity chart — rate at which modules are being achieved
- Waterborne activity heatmap showing which activities are under/over-utilised

**Implementation notes:** Add Chart.js (already compatible with the CDN pattern used) or lightweight Recharts. No new Supabase tables needed — derives from existing `attendance` and `qualifications` data.

---

## 2. Training Night Planner / Session Builder

**Gap:** The Training Plan Suggestions view recommends modules per cadet but there is no tool to plan a whole training night.

**Proposed additions:**
- Input a date and available instructors
- System suggests a programme covering the most cadets' next required modules
- Drag-and-drop time slots (e.g. 19:00–21:00)
- Export session plan to PDF

**New Supabase table:** `training_sessions (id, date, programme_json, created_by, notes)`

---

## 3. Promotion Readiness Report

**Gap:** Staff must manually cross-reference a cadet's completed modules against rank requirements to decide who is ready to promote.

**Proposed additions:**
- Automated promotion eligibility calculation for every cadet
- Flag cadets who meet all mandatory modules and minimum time-in-rank
- "Ready to promote" badge on cadet cards in the existing views
- Bulk promotion action for admins (updates rank + rank_date in `personnel`)

**Implementation notes:** All required data (qualifications, rank, rank_date, TOS) already exists. Purely a new computed view.

---

## 4. Attendance QR Check-In

**Gap:** Attendance is currently entered via CSV upload, which is labour-intensive and introduces lag.

**Proposed additions:**
- Generate a unique QR code per training session (valid for configurable time window)
- Cadets scan the QR on arrival — logs attendance instantly to Supabase
- Staff see a real-time attendance register updating live on the dashboard
- Override/correction workflow for late additions

**New Supabase table:** `checkin_sessions (id, date, section, token, expires_at)` + extend `attendance` with `checkin_source` column.

---

## 5. Staff Qualifications Tracker

**Gap:** The dashboard tracks cadet qualifications in detail but staff certifications (First Aid, Safeguarding, RYA instructor ratings, etc.) are not tracked at all.

**Proposed additions:**
- Staff profile with expiry-dated qualifications
- Red/amber/green status for upcoming renewals (e.g. 30/60/90 day warnings)
- Unit compliance summary (e.g. "2 of 5 instructors have valid first aid")
- Export compliance report to PDF

**New Supabase table:** `staff_qualifications (id, p_number, qualification, achieved_date, expiry_date)`

---

## 6. Retention Risk Enhancements

**Gap:** The existing Retention Risk view flags cadets based on attendance and qualification gaps, but has limited actionability.

**Proposed additions:**
- Risk score (0–100) combining attendance rate, months since last qualification, and time since last rank progression
- "Action taken" log — staff can note interventions against flagged cadets
- Bulk email/contact export for parents of at-risk cadets
- Cohort comparison: how does this unit's retention rate compare to previous periods?

**New Supabase table:** `retention_actions (id, p_number, action_date, note, actioned_by)`

---

## 7. Parent/Guardian Progress Portal

**Gap:** There is no way for parents to check their child's progress without asking staff.

**Proposed additions:**
- Read-only portal (separate login) showing a single cadet's rank, recent achievements, and upcoming suggested modules
- Configurable privacy controls (admin enables/disables per unit)
- Optional push notification when a new qualification is recorded

**New Supabase table:** `guardian_links (id, p_number, guardian_email, token, enabled)`

---

## 8. Offline / Progressive Web App Mode

**Gap:** The app has a `site.webmanifest` but no service worker, so it is unusable without a network connection.

**Proposed additions:**
- Service worker caching of the compiled `dashboard.js`, `tailwind.css`, and media assets
- IndexedDB queue for attendance and qualification updates made offline
- Automatic background sync when connection is restored
- "Offline mode" banner indicating cached data age

**Implementation notes:** Adds a `sw.js` service worker; no backend changes needed.

---

## 9. Advanced Search & Cross-Module Filtering

**Gap:** Each view (Cadet Focus, CTP Progress, Waterborne, etc.) has its own independent search. There is no global search.

**Proposed additions:**
- Global search bar: type a cadet name and jump directly to their profile regardless of which view is active
- Cross-filter: show all cadets who hold a specific badge AND have >80% attendance
- Saved filter presets (stored in `localStorage` or a new `user_preferences` table)
- Search results export to CSV

---

## Priority Summary

| Feature | Effort | Impact | Priority |
|---|---|---|---|
| Promotion Readiness Report | Low | High | **P1** |
| Interactive Progress Charts | Medium | High | **P1** |
| Retention Risk Enhancements | Low | Medium | **P2** |
| Advanced Search | Medium | Medium | **P2** |
| Training Night Planner | Medium | High | **P2** |
| Staff Qualifications Tracker | Medium | Medium | **P2** |
| Attendance QR Check-In | High | High | **P3** |
| Offline PWA Mode | High | Medium | **P3** |
| Parent/Guardian Portal | High | Medium | **P3** |
