# RC2.40 Installation Guide

## Quick Start

### 1. Copy Media Folder
The dashboard needs badge and rank images to display properly.

**Option A: If you have RC2.39 already:**
```bash
cp -r /path/to/RC2.39-media/ RC2.40-modular/media/
```

**Option B: Download media folder:**
The media folder should contain all badge and rank images (.webp and .png files).
Place it inside the RC2.40-modular/ directory.

### 2. Open Dashboard
1. Navigate to RC2.40-modular/ folder
2. Double-click `index.html`
3. Dashboard will open in your default browser

### 3. Upload Data
1. Click through the video tutorial
2. Upload Westminster CSV files:
   - Unit Personnel Report
   - Cadet Qualifications Report

### 4. Use Dashboard
All features now available:
- Home
- Cadet Focus
- Junior Focus (if cadets aged 9-11)
- Junior Progress Chart
- SCC CTP Progress
- RMC CTS Progress (if RMC cadets)
- Waterborne
- Awards
- Training Plan
- Data/Utilities

## File Structure

```
RC2.40-modular/
├── index.html              (Main application shell)
├── media/                  (Badge & rank images - ADD THIS)
│   ├── scc_*.webp
│   ├── rmc_*.webp
│   └── *.png
└── js/
    ├── constants.js        (12KB - Data constants)
    ├── syllabus-data.js    (70KB - All syllabuses)
    ├── helpers.js          (8KB - Utility functions)
    ├── components-core.js  (34KB - Base UI components)
    ├── home.js             (4KB - Home view)
    ├── waterborne.js       (9KB - Waterborne view)
    ├── awards.js           (38KB - Awards & PDF generation)
    ├── cadet-focus.js      (54KB - Individual cadet detail)
    ├── training-planner.js (10KB - CTP/CTS progress)
    ├── training-plan.js    (4KB - Training suggestions)
    ├── juniors.js          (58KB - JSC system)
    ├── data-utilities.js   (44KB - Data management)
    └── main.js             (13KB - Main app & navigation)
```

## Troubleshooting

### Images Not Showing
- Ensure media/ folder exists in RC2.40-modular/
- Check browser console for 404 errors
- Verify image files are .webp or .png format

### Modules Not Loading
- Open browser console (F12)
- Check for JavaScript errors
- Verify all .js files present in js/ folder
- Check file paths are correct

### Data Not Saving
- Check browser localStorage is enabled
- Try different browser (Chrome/Firefox/Edge)
- Clear cache and reload

### CSVs Won't Upload
- Verify CSV format (Westminster export)
- Check file size (max 10MB for personnel, 200MB for quals)
- Ensure columns include: PNumber, Rank, Surname, Module, Date

## Browser Support

✅ Chrome 90+
✅ Firefox 88+
✅ Edge 90+
✅ Safari 14+

## Offline Use

✅ Works completely offline once loaded
✅ No internet connection needed after initial load
✅ All data stored locally in browser
✅ CDN libraries cached by browser

## Security

✅ No data sent to servers
✅ All processing in browser
✅ localStorage only (not cookies)
✅ No tracking or analytics

## Performance

Expected load times:
- Initial load: 1-2 seconds
- Module loading: < 1 second
- View switching: < 100ms
- CSV processing: 2-5 seconds

## Getting Help

Issues? Check:
1. Browser console (F12) for errors
2. README.md for architecture details
3. INSTALLATION.md (this file) for setup
4. Contact: jharbidge@mhseacadets.org
