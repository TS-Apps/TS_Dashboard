# Public Assets Directory

Place your static assets (images, logos, badges) in this folder.

These files will be copied to the root of `dist/` during build.

## Example Structure

```
public/
├── scc_logo.png
├── ts_logo.png
├── scc_award_commodores_pennant.webp
└── media/
    ├── ts_dashboard.webp
    └── other_images.webp
```

## Usage in Code

```jsx
// Reference from root
<img src="/scc_logo.png" alt="Logo" />
<img src="/media/ts_dashboard.webp" alt="Dashboard" />
```

## Important Notes

- Files in `public/` are served as-is
- Paths are relative to domain root
- No processing/optimization occurs
- Files must exist at build time
- Large files (>1MB) should be optimized before adding

## Badge Images

If using the dashboard's badge system, place badge images here with the correct filenames as referenced in the code (see BADGE_MAP in Dashboard.jsx).

Examples:
- scc_prof_drill_advanced.webp
- scc_cadet_sleeve_petty_officer.webp
- scc_junior_leading.webp
etc.
