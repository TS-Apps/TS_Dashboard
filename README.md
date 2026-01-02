# Sea Cadet Training Dashboard - Bundled Version

**Version**: RC2.68e  
**Type**: Self-hosted, no CDN dependencies  
**Build Tool**: Vite + React  

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install:
- React 18.2.0
- React DOM 18.2.0
- jsPDF 2.5.1
- lucide-react 0.263.1
- Vite 5.0.8 (build tool)

**Note**: First run will download ~200MB of packages to `node_modules/`

### 2. Run Development Server

```bash
npm run dev
```

Opens at: http://localhost:5173/

**Features**:
- ✓ Hot Module Replacement (instant updates)
- ✓ Fast refresh
- ✓ Source maps for debugging
- ✓ Error overlay

### 3. Build for Production

```bash
npm run build
```

Creates optimized files in `dist/` folder:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js   (~167 KB gzipped)
│   └── index-[hash].css  (~1 KB gzipped)
└── (any images from public/)
```

### 4. Preview Production Build

```bash
npm run preview
```

Test the production build locally before deploying.

### 5. Deploy

Upload the entire `dist/` folder to your web server.

**Simple deployment**:
```bash
# Copy to web server
scp -r dist/* user@server:/var/www/dashboard/
```

---

## Project Structure

```
scc-dashboard-bundled/
├── index.html           # HTML entry point
├── package.json         # Dependencies
├── vite.config.js       # Build configuration
├── src/
│   ├── main.jsx        # React app entry
│   └── Dashboard.jsx   # Main dashboard component (6582 lines)
├── public/             # Static assets (images, etc.)
│   └── (add your images here)
├── dist/               # Production build (generated)
└── node_modules/       # Dependencies (generated)
```

---

## Adding Assets

### Images / Logos

Place images in the `public/` folder:

```
public/
├── scc_logo.png
├── ts_logo.png
├── scc_award_commodores_pennant.webp
└── media/
    └── ts_dashboard.webp
```

**Usage in code**:
```jsx
<img src="/scc_logo.png" alt="Logo" />
<img src="/media/ts_dashboard.webp" alt="Dashboard" />
```

Vite automatically copies `public/` files to `dist/` during build.

---

## Key Changes from Single HTML File

### Before (CDN version)
```html
<script src="https://unpkg.com/react@18"></script>
<script type="text/babel">
  const { useState } = React;
  <Icon name="Upload" />
</script>
```

### After (Bundled version)
```jsx
// Dashboard.jsx
import React, { useState } from 'react'
import { Upload } from 'lucide-react'

<Upload className="w-5 h-5" />
```

---

## Benefits Over Single HTML File

| Metric | Single HTML | Bundled | Improvement |
|--------|-------------|---------|-------------|
| File size (gzipped) | ~1 MB | 168 KB | **6x smaller** |
| Load time | ~3-4s | ~1s | **3x faster** |
| CDN dependencies | 5 | 0 | **Fully self-hosted** |
| Development workflow | Manual | Hot reload | **Much better DX** |
| Works offline | No | Yes | ✓ |

---

## Common Commands

```bash
# Install dependencies
npm install

# Development (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

---

## Deployment Options

### Option 1: Simple File Server
```bash
# Apache/Nginx
cp -r dist/* /var/www/dashboard/
```

### Option 2: GitHub Pages
```bash
# Push dist/ folder to gh-pages branch
npm run build
git subtree push --prefix dist origin gh-pages
```

### Option 3: Netlify
```bash
# Deploy dist/ folder
netlify deploy --prod --dir=dist
```

### Option 4: Docker
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
```

```bash
docker build -t scc-dashboard .
docker run -p 8080:80 scc-dashboard
```

---

## Troubleshooting

### Port 5173 already in use
```bash
# Kill existing process
lsof -ti:5173 | xargs kill -9

# Or use different port
vite --port 3000
```

### Module not found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Build errors
```bash
# Clear cache and rebuild
rm -rf dist .vite
npm run build
```

---

## Development

### Adding New Features

1. Edit `src/Dashboard.jsx`
2. Changes appear instantly (hot reload)
3. Test in browser
4. Build for production

### Debugging

- Use React DevTools browser extension
- Check browser console for errors
- Source maps enabled in development

---

## Features (All RC2.68e Features Included)

✓ Waterborne cadets-only filtering  
✓ Bulk upload from legacy system  
✓ Grid template format  
✓ All 335 official junior modules  
✓ Proper CSV formatting  
✓ Pre-filled template completions  
✓ Commodore's Broad Pennant tracking  
✓ Progress alerts (13-14 modules)  
✓ Individual PDF reports  
✓ Enhanced validation  
✓ Alert colours match sections  
✓ Side-by-side proficiencies layout  
✓ JSC STEM Award display  

---

## Version History

**RC2.68e** (Current): JSC STEM Award in proficiencies  
**RC2.68d**: Side-by-side layout  
**RC2.68c**: Alert colours + section reordering  
**RC2.68b**: Pennant improvements  
**RC2.68a**: Commodore's Pennant corrections  
**RC2.67-RC2.68**: Template fixes + Pennant feature  
**RC2.62-RC2.66**: Validation improvements  
**RC2.60-RC2.61**: Progress alerts + PDF reports  

---

## Support

For issues, feature requests, or questions:

**Contact**: James Harbidge  
**Email**: jharbidge@mhseacadets.org  

**Disclaimer**: Created independently of MSSC. No warranty offered or implied.

---

## License

Market Harborough Sea Cadets Training Dashboard  
Version: RC2.68e (Bundled)  
