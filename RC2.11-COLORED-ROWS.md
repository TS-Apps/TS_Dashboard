# RC2.11 - Module Names & Colored Rows

**File:** RC2-ProgressChart.html  
**Version:** 1.0-RC2.11  
**Date:** 28 December 2025  

---

## ✅ Changes in RC2.11

### 1. Module Names in First Column

**Before:** Just "RED 1"  
**After:** "RED 1: Unit Induction"

**Format:** `SECTION CODE: Name`

**Examples:**
- RED 1: Unit Induction: Tour of Unit
- BLUE T1: Dinghy Sailing Taster
- GREEN 5: Captain's Coming
- YELLOW 22: Mental Health
- STEM 10: 3D Printing

---

### 2. Colored Module Cells

**Module column now has colored backgrounds:**

- **RED modules:** Light red background (bg-red-100) with dark red text
- **BLUE modules:** Light blue background (bg-blue-100) with dark blue text
- **GREEN modules:** Light green background (bg-green-100) with dark green text
- **YELLOW modules:** Light yellow background (bg-yellow-100) with dark yellow text
- **STEM modules:** Light purple background (bg-purple-100) with dark purple text

**Matches Section Progress cards in Individual Juniors view!**

---

### 3. Colored Row Backgrounds

**Entire rows colored by section:**

- **RED rows:** Very light red (bg-red-50)
- **BLUE rows:** Very light blue (bg-blue-50)
- **GREEN rows:** Very light green (bg-green-50)
- **YELLOW rows:** Very light yellow (bg-yellow-50)
- **STEM rows:** Very light purple (bg-purple-50)

**Makes it easy to see which section you're looking at while scrolling!**

---

### 4. Optimized Column Width

**Module column:** 180-200px (fixed)

**Before:** Could get very wide, squashing cadets to the right  
**After:** Reasonable width, cadets spread out evenly

**Text truncates with "..." if too long, hover shows full name**

---

## Visual Example

```
Module / Cadet              | S  J  B  T
                            | M  O  R  U
---------------------------------------------------
RED 1: Unit Induction...    |[█]       [█]    ← Light red row
RED 1.1: Unit Fire Drill    |          [█]    ← Light red row
RED 2: Two Questions...     |[█][█]          ← Light red row
...
BLUE T1: Dinghy Sailing...  |[█][█][█][█]    ← Light blue row
BLUE 1: Safety by Water...  |[█]    [█]       ← Light blue row
...
GREEN 1: 50 Things          |    [█]          ← Light green row
...
YELLOW 1: Local Heroes      |[█]              ← Light yellow row
...
STEM 1: Coding Basics       |[█][█]          ← Light purple row
```

**Legend:**
- Light colored row = Section background
- Colored module cell = Module name background
- [█] = Dark colored cell = Completed module

---

## Benefits

### 1. Instant Recognition
✅ **See section colors** - no need to read "RED" every time  
✅ **Visual scanning** - colors guide your eyes  
✅ **Section grouping** - easy to see where RED ends, BLUE begins  

### 2. Better Context
✅ **Module names** - know what the module is without looking it up  
✅ **Quick reference** - see "Unit Induction" not just "1"  
✅ **Hover tooltip** - full name if truncated  

### 3. Professional Look
✅ **Matches CTP/CTS** - consistent design across dashboard  
✅ **Matches Section Progress** - same color scheme  
✅ **Clean layout** - organized and readable  

### 4. Optimized Space
✅ **Module column sized right** - not too wide  
✅ **More cadet columns visible** - not squashed right  
✅ **Balanced layout** - good use of screen  

---

## Color Scheme

### Row Backgrounds (Very Light)
- RED: `bg-red-50` (very pale red)
- BLUE: `bg-blue-50` (very pale blue)
- GREEN: `bg-green-50` (very pale green)
- YELLOW: `bg-yellow-50` (very pale yellow)
- STEM: `bg-purple-50` (very pale purple)

### Module Cell Backgrounds (Light)
- RED: `bg-red-100 text-red-900`
- BLUE: `bg-blue-100 text-blue-900`
- GREEN: `bg-green-100 text-green-900`
- YELLOW: `bg-yellow-100 text-yellow-900`
- STEM: `bg-purple-100 text-purple-900`

### Completion Cell Backgrounds (Dark)
- RED: `bg-red-600` (solid red)
- BLUE: `bg-blue-600` (solid blue)
- GREEN: `bg-green-600` (solid green)
- YELLOW: `bg-yellow-600` (solid yellow)
- STEM: `bg-purple-600` (solid purple)

**Three levels of color intensity:**
1. Row: Very light (barely tinted)
2. Module cell: Light (clearly colored)
3. Completion: Dark (strongly colored)

---

## Reading the Chart

### By Color Intensity

**Pale row color** → Section group (RED/BLUE/GREEN/YELLOW/STEM)  
**Light module cell** → Module name  
**Dark completion cell** → Module completed by this cadet  

### Scanning Tips

**Horizontal scan (across row):**
- See which cadets completed this module
- Dark cells = completed

**Vertical scan (down column):**
- See which modules this cadet completed
- Color changes = new section

**Section scan:**
- All RED modules grouped with red tint
- Easy to focus on one section at a time

---

## Use Cases

### Weekly Planning (Even Faster!)

1. Navigate to Junior Progress
2. **Visually scan color blocks**
3. RED section has lots of empty cells → focus on RED this week
4. BLUE section very colorful → good progress there
5. **Plan:** More RED activities needed

**Color makes patterns obvious!**

### Monthly Review

1. Open Progress Chart
2. **Scroll through sections by color**
3. RED section (pale red rows)
4. BLUE section (pale blue rows)
5. **Compare:** Which section needs attention?

**Visual comparison beats counting!**

### Badge Tracking

1. Look at one section (e.g., YELLOW)
2. **Yellow-tinted rows** make it obvious
3. Scroll through YELLOW only
4. Count completions for each cadet
5. **Visual cues** help keep place while counting

---

## Module Column Features

### Text Display

**Format:** `SECTION CODE: Module Name`

**Examples:**
```
RED 1: Unit Induction: Tour of Unit
BLUE T1: Dinghy Sailing Taster
GREEN 9.1: Open Fires 101
YELLOW 22.5: Mindfulness
STEM 35: Navigation Tech
```

### Truncation

**Long names get "..." at end:**
```
RED 1: Unit Induction: Tour of...  ← Truncated
```

**Hover to see full name:**
```
Title attribute shows:
"RED 1: Unit Induction: Tour of Unit"
```

### Width

- **Min width:** 180px (prevents too narrow)
- **Max width:** 200px (prevents too wide)
- **Fixed:** Doesn't change based on content
- **Sticky:** Always visible when scrolling

---

## Comparison: RC2.10 vs RC2.11

| Feature | RC2.10 | RC2.11 |
|---------|--------|--------|
| **Module text** | "RED 1" | "RED 1: Unit Induction" |
| **Module cell** | Plain white | Colored background |
| **Row background** | White/gray | Section-colored |
| **Visual sections** | None | Clear color groups |
| **Module column** | Variable width | 180-200px fixed |
| **Cadet space** | Can get squashed | Well distributed |
| **Matches Section Progress** | No | Yes! |

---

## Testing RC2.11

### Visual Check

1. Navigate to "Junior Progress"
2. ✅ See module names (e.g., "RED 1: Unit Induction")
3. ✅ See colored module cells (light backgrounds)
4. ✅ See colored row backgrounds (very light)
5. ✅ See 333 modules all listed
6. ✅ See rotated cadet names
7. ✅ See dark colored cells for completions

### Color Check

**RED section:**
- Pale red row tint
- Light red module cells
- Dark red completion cells

**BLUE section:**
- Pale blue row tint
- Light blue module cells
- Dark blue completion cells

*(Same pattern for GREEN, YELLOW, STEM)*

### Width Check

- Module column about 200px wide
- Doesn't dominate the screen
- Cadets well spaced across remaining width
- 10-15 cadets visible at 1920px

---

## All RC2.11 Features

**Progress Chart:**
- ✅ ALL 333 modules listed
- ✅ Rotated vertical names (30px columns)
- ✅ Module names shown (with codes)
- ✅ Colored module cells
- ✅ Colored row backgrounds
- ✅ Color-coded completions
- ✅ Optimized column widths

**Individual Tracking:**
- ✅ Add single/multiple modules
- ✅ Section progress bars
- ✅ Rank tracking
- ✅ Grid bulk upload
- ✅ Import/Export

**All RC1 Features:**
- ✅ CTP Progress
- ✅ CTS Progress
- ✅ Waterborne
- ✅ Awards
- ✅ Training Plan

---

## Tips for Best View

### Color Recognition

**After a few uses, you'll instantly recognize:**
- Red tint = Unit activities
- Blue tint = Waterborne
- Green tint = Outdoor
- Yellow tint = Community
- Purple tint = STEM

**No need to read section names!**

### Module Names

**Hover over truncated names** to see full text

**Common truncations:**
- "RED 1: Unit Induction: Tour of..." → Hover shows "Tour of Unit"
- "YELLOW 22: Mental Health" → Full name visible

### Printing

**Color prints well:**
- Light backgrounds don't waste ink
- Dark completions stand out
- Section groups clear on paper

---

## Version History

**1.0-RC2.11** (Current)
- Added: Module names to first column
- Added: Colored module cell backgrounds
- Added: Colored row backgrounds (section-based)
- Changed: Module column 180-200px fixed width
- Improved: Matches Section Progress styling
- Improved: Better visual scanning

**1.0-RC2.10**
- Changed: ALL 333 modules shown
- Changed: Rotated names 90°

---

**RC2.11 - Professional colored progress tracking!** 🎨

**Perfect match to your Section Progress cards!**

**Now with:**
- Module names for context
- Color-coded sections for easy scanning
- Optimized layout for maximum visibility
