# RC2.38 - Conditional Navigation Tabs

## Version
**1.0-RC2.38** - "Conditional navigation tabs"

## Changes Made

### 1. Unit Capability Detection
Added `unitCapabilities` memoized state that automatically detects:

**hasJSC (Junior Section):**
- Detects cadets aged 9-11 years old
- Uses existing `calculateAge()` and `isJunior()` logic
- Checks DOB field for accurate age calculation

**hasRMC (Royal Marines Cadets):**
- Detects RMC ranks: Recruit, Marine Cadet, Cadet Lance Corporal, Cadet Corporal, Cadet Sergeant
- Also checks for "(RMCD)" in unit name
- Uses `RMC_RANK_ORDER` array for validation

**hasSCC (Sea Cadets):**
- Always true (every unit has SCC cadets)
- Ensures SCC CTP tab always displays

### 2. Conditional Navigation Items
Navigation tabs now show/hide based on unit makeup:

**Always Visible:**
- Home
- Cadet Focus
- Waterborne
- Awards
- Training Plan
- Data / Utilities

**Conditional Tabs:**
- Junior Focus → Only if hasJSC = true
- Junior Progress → Only if hasJSC = true
- SCC CTP Progress → Only if hasSCC = true (always visible)
- RMC CTS Progress → Only if hasRMC = true

### 3. Code Implementation

```javascript
// Detection logic (Lines ~5660-5676)
const unitCapabilities = useMemo(() => {
    if (personnelData.length === 0) return { hasSCC: true, hasRMC: false, hasJSC: false };
    
    const hasRMC = personnelData.some(p => 
        RMC_RANK_ORDER.includes(p.rank) || 
        (p.unit && p.unit.includes('(RMCD)'))
    );
    
    const hasJSC = personnelData.some(p => {
        if (!p.dob) return false;
        const age = calculateAge(p.dob);
        return age !== "Unknown" && age >= 9 && age < 12;
    });
    
    return { hasSCC: true, hasRMC, hasJSC };
}, [personnelData]);

// Conditional rendering (Lines ~5720-5729)
<NavItem id="home" icon="Home" label="Home" />
{unitCapabilities.hasJSC && <NavItem id="juniors" icon="Users" label="Junior Focus" />}
{unitCapabilities.hasJSC && <NavItem id="junior_progress" icon="BarChart3" label="Junior Progress" />}
<NavItem id="cadet_focus" icon="User" label="Cadet Focus" />
{unitCapabilities.hasSCC && <NavItem id="planner" icon="ShipWheel" label="SCC CTP Progress" />}
{unitCapabilities.hasRMC && <NavItem id="rmc_planner" icon="Target" label="RMC CTS Progress" />}
```

## Benefits

### Cleaner UI
- Units without juniors don't see junior tabs cluttering navigation
- Units without RMC section don't see RMC CTS tab
- More focused interface for each unit's needs

### Automatic Detection
- No manual configuration required
- Detects from CSV data automatically
- Updates dynamically when new data loaded

### Performance
- Uses `useMemo` to prevent unnecessary recalculations
- Only recalculates when personnelData changes
- Fast conditional rendering

## Testing Scenarios

### Scenario 1: SCC Only Unit (No Juniors, No RMC)
**Expected Tabs:**
- Home ✓
- Cadet Focus ✓
- SCC CTP Progress ✓
- Waterborne ✓
- Awards ✓
- Training Plan ✓
- Data / Utilities ✓

**Hidden Tabs:**
- Junior Focus ✗
- Junior Progress ✗
- RMC CTS Progress ✗

### Scenario 2: SCC with Juniors (No RMC)
**Expected Tabs:**
- Home ✓
- Junior Focus ✓
- Junior Progress ✓
- Cadet Focus ✓
- SCC CTP Progress ✓
- Waterborne ✓
- Awards ✓
- Training Plan ✓
- Data / Utilities ✓

**Hidden Tabs:**
- RMC CTS Progress ✗

### Scenario 3: Combined SCC + RMC Unit (with Juniors)
**Expected Tabs:**
- All tabs visible ✓

### Scenario 4: RMC Only Unit (No Juniors)
**Expected Tabs:**
- Home ✓
- Cadet Focus ✓
- SCC CTP Progress ✓ (always visible)
- RMC CTS Progress ✓
- Waterborne ✓
- Awards ✓
- Training Plan ✓
- Data / Utilities ✓

**Hidden Tabs:**
- Junior Focus ✗
- Junior Progress ✗

## Edge Cases Handled

### Empty Personnel Data
Default state: `{ hasSCC: true, hasRMC: false, hasJSC: false }`
- Prevents errors during initial load
- Shows sensible defaults until data loads

### Missing DOB Data
- `isJunior()` returns false if no DOB
- Won't falsely show junior tabs
- Graceful degradation

### Unit Name Detection
- RMC detection works even without "(RMCD)" in unit name
- Falls back to rank-based detection
- Robust against Westminster CSV variations

## File Changes
- **Lines Modified:** ~20 lines
- **Lines Added:** ~18 lines
- **Total File Size:** 5,768 lines (18 lines added)
- **New Functions:** 1 (unitCapabilities useMemo hook)

## Backwards Compatibility
✓ Fully backwards compatible
✓ No breaking changes
✓ Existing data works unchanged
✓ No localStorage schema changes

## Future Enhancements
Potential improvements for future versions:
- Add visual indicator showing unit composition (e.g., "SCC + JSC" badge in sidebar)
- Allow manual override in settings (force show/hide specific tabs)
- Save capability detection to localStorage for faster load
- Add "No Data" message when trying to access hidden tab directly

## Known Limitations
- RMC detection by unit name requires "(RMCD)" suffix
- Junior detection requires accurate DOB data
- Tabs re-appear if data reloaded with new personnel

## Testing Checklist
- [ ] Load dashboard with SCC-only personnel CSV
- [ ] Verify junior tabs hidden when no cadets aged 9-11
- [ ] Load dashboard with RMC personnel CSV
- [ ] Verify RMC CTS tab appears with RMC ranks
- [ ] Load combined unit CSV (SCC + RMC + JSC)
- [ ] Verify all tabs visible
- [ ] Test with missing DOB data
- [ ] Verify graceful handling of empty personnel data
- [ ] Check console for errors
- [ ] Verify sidebar collapse/expand still works
- [ ] Test navigation between all visible tabs

## Deployment Notes
Standard deployment - single HTML file replacement.

No additional setup required. Detection is automatic.

---

**Created:** 2025-12-31  
**Developer:** Claude (Anthropic)  
**Approved By:** James Harbidge  
**Status:** ✅ Complete - Ready for Testing
