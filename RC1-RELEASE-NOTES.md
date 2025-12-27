# Sea Cadet Training Dashboard - Release Candidate 1 (RC1)

**Version:** 1.0-RC1  
**Release Date:** 27 December 2025

---

## Overview

Release Candidate 1 represents the first feature-complete version of the Sea Cadet Training Dashboard, ready for testing in production environments. This release includes comprehensive training tracking, certificate generation, and data management capabilities.

---

## Key Features

### Data Management
- **CSV Import**: Upload Unit Personnel Report and Cadet Qualifications Report from Westminster
- **Individual File Updates**: Update personnel or qualifications files independently without re-uploading both
- **Data Validation**: 
  - File size limits (10MB for CSVs)
  - Row count limits (1,000 cadets, 200,000 qualification records)
  - MIME type checking
  - CSV sanitization (strips HTML and script tags)
- **Dual Clear Options**:
  - **Reset Cadet Data**: Clears CSV data only, preserves logos
  - **Wipe All Data**: Clears everything including logos
- **Persistent Storage**: Data persists between sessions via localStorage

### Rank Structures
**Sea Cadets:**
- New Entry Cadet (NEC)
- Cadet (Cdt)
- Cadet 1st Class (Cdt 1st)
- Ordinary Cadet (OC)
- Able Cadet (AC)
- Leading Cadet (LC)
- Petty Officer Cadet (POC)

**Marine Cadets:**
- Recruit (Rct)
- Marine Cadet (MC)
- Cadet Lance Corporal (Cdt LCpl)
- Cadet Corporal (Cdt Cpl)
- Cadet Sergeant (Cdt Sgt)

**Junior Cadets:**
- Junior Cadet (JC)
- Junior Cadet 1st Class (JCFC)
- Able Junior Cadet (AJC)
- Leading Junior Cadet (LJC)

### Training Progress Views

**1. Home Dashboard**
- Unit overview statistics
- Cadet count by rank
- Age distribution warnings (colour-coded)
- Quick-access navigation

**2. Cadet Focus**
- Individual cadet progress tracking
- Personal qualifications history
- Training plan recommendations
- Good Conduct Badge tracking
- CVQO integration

**3. SCC CTP Progress**
- Class Training Plan module tracking by rank
- Progress visualization
- Module drill-down with detailed information
- Video tutorials integration

**4. RMC CTS Progress**
- Corps Training Syllabus tracking by rank
- Section-based module organization
- Comprehensive progress overview

**5. Waterborne Qualifications**
- Boat handling qualifications
- Powerboat levels
- Coxswain and Master Coxswain awards
- Qualification date tracking

**6. Awards System**
- Month-by-month award tracking
- Certificate generation (PDF)
- Multiple award types:
  - Qualifications
  - Specialisations
  - Proficiencies
  - DofE awards
  - Promotions
  - Good Conduct Badges
- Upcoming awards forecasting

**7. Training Planner**
- Top 12 most-needed modules by rank
- Cadet readiness indicators
- Strategic training guidance

### Certificate Generation

**Features:**
- Professional PDF certificates in landscape A4
- Arial font throughout
- Dynamic wording based on award type:
  - "has successfully qualified in" (qualifications)
  - "has been promoted to" (promotions)
  - "has been awarded the" (Good Conduct Badges)
- Correct rank display (previous rank for promotions)
- Rank abbreviations using official Westminster format
- Surnames in capitals (e.g., "AC John SMITH")
- Unit name formatting (proper case, removes parenthetical sections)

**Logo System:**
- Three customizable logos:
  - **Unit Crest**: Center top (50mm wide, aspect ratio maintained)
  - **RMC Logo**: Bottom left (52.5mm wide, aspect ratio maintained)
  - **SCC Logo**: Bottom right (52.5mm wide, aspect ratio maintained)
- User upload capability (JPG, PNG, WebP)
- 500KB file size limit per logo
- Logos persist independently of cadet data
- Preview functionality
- Remove/replace capability

**Certificate Layout:**
- Borderless design
- Centered content with professional spacing
- Signature line for Commanding Officer
- Unit name footer
- Award date display

### Security Features

**Data Protection:**
- Client-side only operation (no server uploads)
- Browser-based localStorage
- Clear security warnings on upload page
- Prominent reminders for shared computers
- No external data transmission

**File Validation:**
- CSV sanitization removes malicious code
- HTML tag stripping
- Script content removal
- File type verification
- Size limit enforcement

### User Interface

**Design:**
- Responsive layout (desktop and mobile)
- Collapsible sidebar navigation
- Colour-coded age warnings
- Icon-based navigation
- Professional blue theme (SCC navy)

**Navigation:**
- Fixed sidebar with 8 main sections
- Breadcrumb-style view indicators
- Quick-access buttons
- Contextual help (video tutorials)

**Accessibility:**
- Clear visual hierarchy
- Readable font sizes
- High-contrast elements
- Keyboard-friendly navigation

### Technical Specifications

**File Format Support:**
- CSV (Westminster exports)
- Images: JPG, JPEG, PNG, WebP (for logos)
- PDF generation (certificates)

**Browser Compatibility:**
- Modern browsers with localStorage support
- No internet required after initial load
- Offline functionality

**Performance:**
- Optimized icon rendering (runs only on view changes)
- Memoized calculations
- Efficient data processing
- Minimal re-renders

**Data Limits:**
- Personnel: 1,000 cadets maximum
- Qualifications: 200,000 records maximum
- CSV files: 10MB maximum
- Logo files: 500KB maximum each

---

## Rank Normalization

The system automatically normalizes rank variations:
- Handles abbreviations (e.g., "CDT" → "Cadet")
- Corrects historical names (e.g., "Marine Recruit" → "Recruit")
- Maps old designations (e.g., "Marine Cadet 1st Class" → "Marine Cadet")
- Supports multiple input formats

---

## Good Conduct Badge Logic

Automatic calculation based on:
- Time of Service (TOS) date
- 12th birthday
- Annual progression (1st, 2nd, 3rd year)
- Whichever is later: TOS or 12th birthday

---

## Known Limitations

1. **Storage**: Limited by browser localStorage (typically 5-10MB)
2. **Network**: No network access configured (egress proxy disabled)
3. **Logo Format**: Requires base64 conversion (increases storage usage)
4. **Version Control**: Manual data migration required on version changes
5. **Sharing**: No multi-user or cloud sync capabilities

---

## File Structure

**Single-file application:**
- All code in `index.html`
- External dependencies via CDN:
  - React 18.2.0
  - Babel 7.23.5
  - Lucide Icons 0.263.1
  - jsPDF (latest)

**Media folder:**
- Rank badge images
- Logo images
- Tutorial videos

---

## Future Considerations

**Potential Enhancements:**
- Export functionality (backup data)
- Print-friendly views
- Additional report types
- Attendance tracking integration
- Multi-unit management
- Cloud storage options

---

## Testing Recommendations

1. **Data Import**: Test with various Westminster export formats
2. **Large Datasets**: Verify performance with maximum record counts
3. **Logo Upload**: Test different image formats and sizes
4. **Certificate Generation**: Verify all award types render correctly
5. **Browser Compatibility**: Test across Chrome, Firefox, Safari, Edge
6. **Mobile Responsiveness**: Verify on tablets and smartphones
7. **Data Persistence**: Confirm localStorage reliability
8. **Clear Functions**: Verify both clear options work correctly

---

## Support

**Bug Reports & Feature Requests:**  
James Harbidge - jharbidge@mhseacadets.org

**Documentation:**  
Video tutorials available via upload screen

---

## Disclaimer

This application has been created independently of the MSSC. No warranty is offered or implied. Always maintain backup copies of your data.

---

**End of Release Notes - RC1**
