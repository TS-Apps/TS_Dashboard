# TS Dashboard: URL Routing and Sidebar Grouping

Implementation document for an autonomous Claude Code session.
Target file: `dashboard.js` (compiled React.createElement style; match it, do not write JSX).
Two phases. Complete, deploy, and verify Phase 1 before starting Phase 2.

---

## Decisions already made (do not revisit)

- Hash-based routing (`#/view_id`). No router library.
- Browser back button MUST navigate between views.
- Cadet P numbers MUST NOT appear in the URL. Routes identify views only. Selected-cadet state stays in React memory.
- Sidebar grouped by section in this order: Juniors (JSC), Sea Cadets (SCC), Royal Marines (RMC), All Sections, Admin.
- All menu labels and group headers use Title Case (Capitalise Each Word).
- Staff Quals remains a plain `<a href="./staff/">` link, outside the routing system.

---

## Phase 1: Hash Routing

### Step 1.1: Add route constants and parser

Add immediately above `const App = ({ user }) => {`:

```js
// ── Hash routing ──────────────────────────────────────────────────────────
const VALID_VIEWS = ['home', 'juniors', 'junior_progress', 'cadet_focus', 'planner', 'rmc_planner', 'waterborne', 'awards', 'suggestions', 'attendance', 'retention', 'data_utilities'];
const parseHash = () => {
  const h = window.location.hash.replace(/^#\/?/, '');
  return VALID_VIEWS.includes(h) ? h : null;
};
```

Note `upload` is deliberately NOT in `VALID_VIEWS`. It is an internal state, never a shareable route.

### Step 1.2: Initialise view from hash

BEFORE:
```js
const App = ({
  user
}) => {
  const [view, setView] = useState('upload');
```

AFTER:
```js
const App = ({
  user
}) => {
  const [view, setView] = useState(parseHash() || 'upload');
```

### Step 1.3: Add navigate() and the hashchange listener

Add inside `App`, directly after the block of `useState` declarations and BEFORE any conditional early return (the loading-spinner return and the upload-page return). This placement is mandatory: a hook after an early return previously caused a re-render crash in this codebase (rules of hooks).

```js
const navigate = id => {
  if (VALID_VIEWS.includes(id)) {
    if (window.location.hash === '#/' + id) {
      window.scrollTo(0, 0);
      return;
    }
    window.location.hash = '/' + id;
  } else {
    setView(id);
  }
};
useEffect(() => {
  const onHash = () => {
    const v = parseHash();
    if (v) {
      setView(v);
      window.scrollTo(0, 0);
    }
  };
  window.addEventListener('hashchange', onHash);
  return () => window.removeEventListener('hashchange', onHash);
}, []);
```

How back/forward works: every `window.location.hash = ...` assignment pushes a history entry. Back fires `hashchange`, which calls `setView`. No pushState code needed.

### Step 1.4: Route NavItem clicks through navigate()

BEFORE:
```js
  const NavItem = ({
    id,
    icon,
    label
  }) => /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setView(id);
      window.scrollTo(0, 0);
    },
```

AFTER:
```js
  const NavItem = ({
    id,
    icon,
    label
  }) => /*#__PURE__*/React.createElement("button", {
    onClick: () => navigate(id),
```

### Step 1.5: Audit every other setView call

Grep `dashboard.js` for `setView(`. For each call site:

- If the target is a value in `VALID_VIEWS` (e.g. `setView('home')` after a successful upload), replace with `navigate('home')` so the URL stays in sync.
- If the target is `'upload'` or the call passes through the `setView` prop into `DataUtilitiesView`, decide per site: targets in `VALID_VIEWS` become `navigate`; `'upload'` stays as `setView('upload')`.
- Where `setView` is passed as a prop (e.g. `setView: setView` into `DataUtilitiesView`), pass `navigate` instead ONLY if every value that component sets is in `VALID_VIEWS`. If it ever sets `'upload'`, pass a wrapper: `setView: id => VALID_VIEWS.includes(id) ? navigate(id) : setView(id)`. Simplest safe option: always pass that wrapper.

### Step 1.6: Empty-database fallback

Locate the initial data-loading effect (the one that fetches `personnel` and sets `setLoading(false)`). After loading completes, if no personnel rows were found AND the current view is not `'upload'`, call `setView('upload')` (not `navigate`; upload must not enter the URL). This covers a user opening `#/attendance` against an empty database.

Also clear the hash in that case so a subsequent refresh behaves cleanly:
```js
if (window.location.hash) history.replaceState(null, '', window.location.pathname + window.location.search);
```

### Step 1.7: Things that must NOT change

- Auth: `LoginForm` renders on the same URL, so a deep link held in the hash survives sign-in with no extra code. Do not add redirect handling.
- Sign-out: `window.location.reload()` keeps the hash; the user returns to the login form and, after sign-in, lands back on the same view. Acceptable; leave as is.
- No cadet identifiers, P numbers, or query parameters in any hash. Ever.

### Phase 1 success criteria

1. Open the app, click Attendance, press F5: Attendance reloads, not Home.
2. Click through 4 views, press back 3 times: views step backwards in order; one more back leaves the app.
3. Open `#/retention` in a new tab while logged out: login form shows; after sign-in, Retention Risk renders.
4. Open `#/nonsense`: app falls back to default behaviour (home with data, upload page without), no console errors.
5. Open any `#/view` route against an empty database: upload page shows.
6. No URL at any point contains a P number.
7. No "Rendered more hooks" or "too many re-renders" errors (hooks placed before early returns).

Deploy to Cloudflare Pages and confirm all 7 before Phase 2.

---

## Phase 2: Sidebar Grouping (Option B, Title Case)

### Step 2.1: Add NavGroup component

Add inside `App` directly after the `NavItem` definition:

```js
  const NavGroup = ({
    label
  }) => sidebarCollapsed ? /*#__PURE__*/React.createElement("div", {
    className: "border-t border-blue-800 my-2 mx-1"
  }) : /*#__PURE__*/React.createElement("p", {
    className: "px-2 pt-3 pb-1 text-[10px] font-bold tracking-wider text-blue-400"
  }, label);
```

Collapsed sidebar renders each group as a thin divider line; expanded renders the Title Case header.

### Step 2.2: Reorder the nav block

BEFORE (current order inside the `<nav>` element):
```
Home, Junior Focus, Junior Progress, Cadet Focus, SCC CTP Progress,
RMC CTS Progress, Waterborne, Awards, Training Plan, Attendance,
Retention Risk, Data / Utilities, [Staff Quals link]
```

AFTER (replace the sequence of NavItem children; keep each NavItem's existing id and icon exactly):

```js
/*#__PURE__*/React.createElement(NavItem, { id: "home", icon: "Home", label: "Home" }),
/*#__PURE__*/React.createElement(NavGroup, { label: "Juniors (JSC)" }),
/*#__PURE__*/React.createElement(NavItem, { id: "juniors", icon: "Users", label: "Junior Focus" }),
/*#__PURE__*/React.createElement(NavItem, { id: "junior_progress", icon: "BarChart3", label: "Junior Progress" }),
/*#__PURE__*/React.createElement(NavGroup, { label: "Sea Cadets (SCC)" }),
/*#__PURE__*/React.createElement(NavItem, { id: "planner", icon: "ShipWheel", label: "SCC CTP Progress" }),
/*#__PURE__*/React.createElement(NavGroup, { label: "Royal Marines (RMC)" }),
/*#__PURE__*/React.createElement(NavItem, { id: "rmc_planner", icon: "Target", label: "RMC CTS Progress" }),
/*#__PURE__*/React.createElement(NavGroup, { label: "All Sections" }),
/*#__PURE__*/React.createElement(NavItem, { id: "cadet_focus", icon: "User", label: "Cadet Focus" }),
/*#__PURE__*/React.createElement(NavItem, { id: "waterborne", icon: "Anchor", label: "Waterborne" }),
/*#__PURE__*/React.createElement(NavItem, { id: "awards", icon: "Award", label: "Awards" }),
/*#__PURE__*/React.createElement(NavItem, { id: "suggestions", icon: "ClipboardList", label: "Training Plan" }),
/*#__PURE__*/React.createElement(NavItem, { id: "attendance", icon: "CalendarCheck", label: "Attendance" }),
/*#__PURE__*/React.createElement(NavItem, { id: "retention", icon: "UserX", label: "Retention Risk" }),
/*#__PURE__*/React.createElement(NavGroup, { label: "Admin" }),
/*#__PURE__*/React.createElement(NavItem, { id: "data_utilities", icon: "Database", label: "Data / Utilities" }),
```

The Staff Quals `<a href="./staff/">` link stays exactly where it is, immediately after Data / Utilities, inside the Admin group.

### Step 2.3: Fix nav overflow

The group headers add roughly 110px of height. The `<nav>` element currently has `overflow-hidden`, which would clip the bottom items on short laptop screens.

BEFORE:
```js
className: "flex-1 p-3 space-y-0.5 overflow-hidden"
```

AFTER:
```js
className: "flex-1 p-3 space-y-0.5 overflow-y-auto"
```

### Step 2.4: Update the Home page orientation text

The `HomeView` bullet list references views by name ("Use Cadet Focus to...", "Use SCC CTP / RMC CTS Progress to..."). Review that copy and adjust if any wording now reads oddly against the grouped sidebar. Content changes only; no structural edits.

### Phase 2 success criteria

1. Expanded sidebar shows 5 group headers in Title Case, in order: Juniors (JSC), Sea Cadets (SCC), Royal Marines (RMC), All Sections, Admin.
2. Every NavItem still navigates correctly and `window.location.hash` updates (Phase 1 behaviour intact).
3. Collapsed sidebar shows divider lines in place of headers; all icons remain clickable with their tooltips.
4. On a 1366x768 laptop window, the full nav including Staff Quals is reachable (scrolls if needed, nothing clipped).
5. No layout shift in the main content area; `w-64` / `w-20` widths unchanged.

---

## Version and release

- Bump `DATA_VERSION` once after both phases (single minor version, e.g. next in the V2.x sequence).
- Commit Phase 1 and Phase 2 as separate commits with clear messages, so either can be reverted independently.
