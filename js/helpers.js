/**
 * Sea Cadet Training Dashboard - Helper Functions Module
 * Version: 1.0-RC2.40
 * Contains: Date parsing, formatting, rank normalization, calculations
 */


// --- 2.1 CSV PARSING ---
window.splitCSVLine = (str) => {
    const arr = [];
    let quote = false;
    let col = "";
    for (let c of str) {
        if (c === '"') { quote = !quote; continue; }
        if (c === ',' && !quote) { arr.push(col); col = ""; continue; }
        col += c;
    }
    arr.push(col);
    return arr;
};

window.sanitizeText = (text) => {
    if (!text || typeof text !== 'string') return text;
    // Strip HTML tags and script content
    return text
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .trim();
};

window.RANK_ABBREVIATIONS = {
    "Petty Officer Cadet": "POC",
    "Leading Cadet": "LC",
    "Able Cadet": "AC",
    "Ordinary Cadet": "OC",
    "Cadet 1st Class": "Cdt 1st",
    "Cadet": "Cdt",
    "New Entry Cadet": "NEC",
    "Leading Junior Cadet": "LJC",
    "Able Junior Cadet": "AJC",
    "Junior Cadet 1st Class": "JCFC",
    "Junior Cadet": "JC",
    "Cadet Sergeant": "Cdt Sgt",
    "Cadet Corporal": "Cdt Cpl",
    "Cadet Lance Corporal": "Cdt LCpl",
    "Marine Cadet": "MC",
    "Recruit": "Rct"
};

window.formatCadetNameWithRank = (name, rank) => {
    // Parse "SURNAME, Firstname" format
    const parts = name.split(',').map(p => p.trim());
    if (parts.length !== 2) return name; // Fallback if format unexpected
    
    const surname = parts[0].toUpperCase(); // Keep surname in capitals
    const firstname = parts[1];
    
    // Get rank abbreviation
    const rankAbbrev = RANK_ABBREVIATIONS[rank] || rank;
    
    return `${rankAbbrev} ${firstname} ${surname}`;
};

window.getPreviousRank = (newRank) => {
    // Find the new rank in the appropriate rank order array
    const sccIndex = SCC_RANK_ORDER.indexOf(newRank);
    if (sccIndex > 0) return SCC_RANK_ORDER[sccIndex - 1];
    
    const rmcIndex = RMC_RANK_ORDER.indexOf(newRank);
    if (rmcIndex > 0) return RMC_RANK_ORDER[rmcIndex - 1];
    
    // Junior ranks
    const JUNIOR_RANK_ORDER = ["Junior Cadet", "Junior Cadet 1st Class", "Able Junior Cadet", "Leading Junior Cadet"];
    const juniorIndex = JUNIOR_RANK_ORDER.indexOf(newRank);
    if (juniorIndex > 0) return JUNIOR_RANK_ORDER[juniorIndex - 1];
    
    // Fallback
    return newRank;
};

window.parseDate = (dateStr) => {
    if (!dateStr) return null;
    
    // Parse DD/MM/YYYY, DD-MM-YYYY, or DD-MMM-YY format (UK/International standard)
    const parts = dateStr.split(/[\/\-\s]/);
    if (parts.length === 3) {
        const day = parseInt(parts[0]);
        let year = parseInt(parts[2]);
        let month = parseInt(parts[1]) - 1; 

        // Handle text month names (e.g., "May", "Jan")
        if (isNaN(month)) {
            const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
            month = months.findIndex(m => parts[1].toLowerCase().startsWith(m));
        }
        
        // Handle 2-digit years (e.g., "15" should be 2015, not 15 AD)
        if (year < 100) {
            // Westminster uses YY format: 00-30 = 2000-2030, 31-99 = 1931-1999
            year = year <= 30 ? 2000 + year : 1900 + year;
        }
        
        if (!isNaN(day) && !isNaN(month) && !isNaN(year) && month >= 0) {
            const d = new Date(year, month, day);
            if (!isNaN(d.getTime())) return d;
        }
    }
    
    // Fallback for ISO format (YYYY-MM-DD) - used internally by the app
    if (dateStr.includes('-') && dateStr.length === 10 && dateStr.charAt(4) === '-') {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) return d;
    }
    
    return null;
};

// Global Date Formatter
window.formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-GB');
};

window.normalizeRank = (rawRank) => {
    if (!rawRank) return "Unknown";
    const r = rawRank.toLowerCase().trim();

    // Junior Ranks
    if (r === "ljc" || (r.includes("leading") && (r.includes("junior") || r.includes("jnr")))) return "Leading Junior Cadet";
    if (r === "ajc" || (r.includes("able") && (r.includes("junior") || r.includes("jnr")))) return "Able Junior Cadet";
    if (r === "jcfc" || r === "jc1" || ((r.includes("junior") || r.includes("jnr") || r.includes("jc")) && (r.includes("1st") || r.includes("first")))) return "Junior Cadet 1st Class";
    if (r === "jc" || r === "junior cadet" || r.includes("junior") || r.includes("jnr")) return "Junior Cadet";

    // Senior SCC Ranks
    if (r.includes("new entry") || r === "nec") return "New Entry Cadet";
    if (r === "cdt" || r === "cadet") return "Cadet";
    if (r === "cdt 1st" || r.includes("1st class")) return "Cadet 1st Class";
    if (r === "oc" || r === "ordinary cadet" || r.includes("ordinary")) return "Ordinary Cadet";
    if (r === "ac" || r === "able cadet" || r.includes("able")) return "Able Cadet";
    if (r === "lc" || r === "leading cadet" || r.includes("leading")) return "Leading Cadet";
    if (r === "poc" || r === "petty officer cadet") return "Petty Officer Cadet";
    
    // RMC Ranks - Map all variations to correct rank names
    // Marine Cadet (including old "Marine" and "Marine Cadet 1st Class" references)
    if (r === "mc" || r === "marine cadet" || r === "marine" || r === "royal marine" || 
        r === "mc1" || r === "marine cadet 1st class" || r === "marine cadet 1") return "Marine Cadet"; 
    
    // Recruit (previously called "Marine Recruit")
    if (r === "rct" || r === "recruit" || r === "marine recruit" || r.includes("recruit")) return "Recruit";
    
    // RMC NCO Ranks
    if (r === "cdt sgt" || r === "cdt sergeant" || r.includes("cadet sergeant")) return "Cadet Sergeant";
    if (r === "cdt cpl" || r.includes("cadet corporal")) return "Cadet Corporal";
    if (r === "cdt lcpl" || r.includes("cadet lance corporal")) return "Cadet Lance Corporal";

    // Fallback for variations
    if (r.includes("lance")) return "Cadet Lance Corporal";
    if (r.includes("corporal") && !r.includes("lance")) return "Cadet Corporal"; 
    
    return rawRank;
};

window.calculateAge = (dob) => {
    if (!dob) return "Unknown";
    const birthDate = parseDate(dob);
    if (!birthDate) return "Unknown";
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

// Clean unit name helper - removes Junior Section/RMCD references and converts to proper case
window.cleanUnitName = (rawUnit) => {
    if (!rawUnit) return "Unit";
    
    // Remove everything in parentheses (Junior Section, RMCD, etc.)
    let cleaned = rawUnit.split('(')[0].trim();
    
    // If empty after cleaning, return default
    if (!cleaned) return "Unit";
    
    // Convert to proper case (e.g., "MARKET HARBOROUGH" -> "Market Harborough")
    cleaned = cleaned.toLowerCase().split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    return cleaned;
};

// Age-based styling function
window.getCadetAgeColor = (dob) => {
    if (!dob) return '';
    const birthDate = parseDate(dob);
    if (!birthDate) return '';
    
    const today = new Date();
    const ageInMilliseconds = today.getTime() - birthDate.getTime();
    const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
    
    if (ageInYears >= 18.0) {
        return 'bg-red-500/30 text-red-800 font-bold'; // 18+ (Red)
    }
    if (ageInYears >= 17.5) {
        return 'bg-orange-500/30 text-orange-800 font-bold'; // 17.5+ (Orange)
    }
    if (ageInYears >= 17.0) {
        return 'bg-yellow-500/30 text-yellow-800 font-bold'; // 17+ (Yellow/Amber)
    }
    
    return ''; // No highlighting
};


// --- 2.6 JUNIOR SEA CADETS HELPER FUNCTIONS (RC2 Stage 2) ---

// Check if cadet is a junior (under 12 years old)
window.isJunior = (dob) => {
    const age = calculateAge(dob);
    return age !== "Unknown" && age < 12;
console.log("✓ Helpers module loaded");
