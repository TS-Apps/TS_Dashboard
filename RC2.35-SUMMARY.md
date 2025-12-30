# RC2.35 - Junior Proficiencies + Other Awards

## Changes

### 1. Renamed Section
**"Waterborne Proficiencies" → "Junior Proficiencies"**
- Changed section title on Junior page
- Changed icon from Anchor to Award (purple)
- More accurate name for section showing all junior proficiencies

### 2. Added STEM Award Badge
**STEM Award now displays in Junior Proficiencies section**
- Badge image: `scc_junior_stem.webp`
- Shows if "JSC STEM Unit Activities Badge" found in qualifications CSV
- Displays with date completed
- Name: "JSC STEM Award"

### 3. New "Other Awards" Section
**Added section below Completed Modules showing awards from CSV**
- Displays all JSC section badges if awarded:
  - JSC Red - Unit Activities
  - JSC Blue - Waterborne
  - JSC Green - Outdoor
  - JSC Yellow - Community
  - JSC STEM Award
  - JSC Commodores Broad Pennant
- Shows badge images with dates
- Similar format to Cadet Focus page awards
- Empty state message if no awards found

## Technical Details

### Code Changes
1. **Line 5393**: Section title updated
2. **Line 5069**: Added STEM Award logic to juniorWaterborne useMemo
3. **Line 5505**: Added new Other Awards section with inline logic

### Badge Keys Used
- `SCC - JSC Red Unit Activities Badge`
- `SCC - JSC Blue Waterborne Activities Badge`
- `SCC - JSC Green Outdoor & Recreation Activities Badge`
- `SCC - JSC Yellow Community & Citizenship Activities Badge`
- `SCC - JSC STEM Unit Activities Badge`
- `SCC - JSC Commodores Broad Pennant`

## Version
**1.0-RC2.35**

## Testing Required
- Load Junior Focus page
- Verify section title changed to "Junior Proficiencies"
- Check STEM Award displays if awarded
- Verify "Other Awards" section shows section badges
- Confirm dates display correctly
- Test with juniors who have/don't have awards
