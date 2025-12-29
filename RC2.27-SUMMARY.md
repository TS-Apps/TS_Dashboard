# RC2.27 Release Summary

## Version: 1.0-RC2.27
**Date:** 29 December 2024  
**Focus:** Unit Name Cleaning + Bulk Award Relocation

---

## Key Changes

### 1. Unit Name Cleaning (Primary Fix)
**Problem:** Unit names were displaying with unwanted suffixes:
- "MARKET HARBOROUGH (JUNIOR SECTION 1)"
- "UNIT NAME (RMCD)"

**Solution:** Created `cleanUnitName()` helper function that:
- Removes everything in parentheses: `(JUNIOR SECTION 1)`, `(RMCD)`, etc.
- Converts to proper case: `MARKET HARBOROUGH` → `Market Harborough`
- Returns clean, professional unit names

**Applied to:**
- ✓ Home view header
- ✓ Sidebar unit display
- ✓ Certificate generation (PDF exports)
- ✓ Upcoming awards report (PDF exports)

### 2. Bulk Award Feature Relocation (from RC2.26)
**Moved:** Bulk module award section from Junior Focus page to Data/Utilities tab

**New Location:** Data/Utilities → Between "Upload Westminster Data" and "Junior Sea Cadet Data"

**Benefits:**
- Cleaner Junior Focus page (individual cadet focus only)
- Logical grouping with other data management tools
- Easier to find for bulk data entry tasks

---

## Technical Implementation

### Helper Function
```javascript
const cleanUnitName = (rawUnit) => {
    if (!rawUnit) return "Unit";
    
    // Remove everything in parentheses
    let cleaned = rawUnit.split('(')[0].trim();
    
    if (!cleaned) return "Unit";
    
    // Convert to proper case
    cleaned = cleaned.toLowerCase().split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    return cleaned;
};
```

### Usage Examples
**Before:**
```javascript
const unitName = personnel[0].unit; 
// "MARKET HARBOROUGH (JUNIOR SECTION 1)"
```

**After:**
```javascript
const unitName = cleanUnitName(personnel[0].unit);
// "Market Harborough"
```

---

## Testing Checklist

- [ ] Home page displays clean unit name
- [ ] Sidebar shows clean unit name
- [ ] Certificate PDFs show clean unit name
- [ ] Upcoming awards report shows clean unit name
- [ ] Bulk award feature works in Data/Utilities tab
- [ ] Junior Focus page shows individual cadet selection only

---

## Files Modified
- `RC2-ProgressChart.html` (lines 1210-1226: cleanUnitName function)
- Version updated: `1.0-RC2.26` → `1.0-RC2.27`

---

## Known Handling
Handles all Westminster unit name formats:
- `UNIT NAME (JUNIOR SECTION 1)` → `Unit Name`
- `UNIT NAME (JUNIOR SECTION 2)` → `Unit Name`
- `UNIT NAME (RMCD)` → `Unit Name`
- `UNIT NAME (ROYAL MARINES CADETS DETACHMENT)` → `Unit Name`
- `UNIT NAME` → `Unit Name` (no change needed)

---

## Version History Context
- **RC2.26:** Added bulk module award feature to Junior Focus page
- **RC2.27:** Cleaned unit names + moved bulk award to Data/Utilities tab

---

**Status:** ✅ Complete and ready for testing
