# RC2.40 Testing Instructions

## If You See Grey Screen

### 1. Open Browser Console
Press **F12** (or right-click → Inspect → Console tab)

### 2. Look For Error Messages
Red text shows what went wrong. Common errors:

**"useState is not defined"**
- React hooks not loaded
- Fixed in latest version

**"Cannot read property of undefined"**
- Module didn't load
- Check all .js files present

**"window.App is not a function"**
- main.js didn't load
- Check file path

### 3. Check Module Loading
In console, you should see:
```
✓ Constants module loaded
✓ Syllabus data module loaded
✓ Helper functions module loaded
✓ Core components module loaded
✓ FileUploader and ModuleDrillDown loaded
✓ Home view module loaded
✓ Waterborne view module loaded
✓ Training planner module loaded
✓ Training plan module loaded
✓ Awards view module loaded
✓ Cadet focus module loaded
✓ Juniors module loaded
✓ Data utilities module loaded
✓ Main app module loaded
🚀 RC2.40 Dashboard ready!
```

### 4. Quick Fixes

**Missing React**
- Check CDN links in index.html
- Try different browser (Chrome/Firefox)

**Files Not Loading**
- Verify js/ folder exists
- Check all 14 .js files present
- Check file paths are correct

**Still Grey Screen**
- Clear browser cache (Ctrl+F5)
- Try incognito/private window
- Check console for specific error

### 5. Debug Steps

1. Open index.html in browser
2. Press F12 to open console
3. Check for red error messages
4. Look at Network tab - all files should load (green status)
5. Take screenshot of console errors
6. Contact with error details

### 6. Known Issues & Solutions

**Issue:** "lucide is not defined"
**Fix:** Ensure Lucide CDN loaded: `<script src="https://unpkg.com/lucide@latest"></script>`

**Issue:** "jsPDF is not defined"  
**Fix:** Ensure jsPDF CDN loaded: `<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>`

**Issue:** Module not found (404)
**Fix:** Check file path relative to index.html

### 7. Success Indicators

When working correctly:
- ✅ No console errors (red text)
- ✅ All module loaded messages
- ✅ "🚀 RC2.40 Dashboard ready!" message
- ✅ Either upload screen OR loaded dashboard visible
- ✅ No grey screen

### 8. Contact Support

If still not working:
1. Screenshot browser console (F12)
2. Screenshot Network tab showing file loads
3. Note browser version (Chrome 90+, Firefox 88+, etc.)
4. Email: jharbidge@mhseacadets.org

Include:
- Browser + version
- Operating system
- Console error messages
- Steps you tried
