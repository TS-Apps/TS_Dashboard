/**
 * Sea Cadet Training Dashboard - Juniors Module
 * Version: 1.0-RC2.40
 * Junior Sea Cadets views (JuniorsView, JuniorDetail, JuniorProgressView)
 */


// Destructure React hooks
const { useState, useEffect, useMemo, useCallback } = React;

        window.JuniorProgressView = ({ personnel }) => {
            const juniorData = window.getJuniorData();
            const juniors = personnel.filter(c => window.isJunior(c.dob));
            
            if (juniors.length === 0) {
                return (
                    <div className="p-8">
                        <div className="bg-white rounded-lg shadow p-8 text-center">
                            <Icon name="Users" className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                            <h2 className="text-2xl font-bold text-slate-700 mb-2">No Junior Sea Cadets Found</h2>
                            <p className="text-slate-600">No cadets under 12 years old found in your personnel data.</p>
                        </div>
                    </div>
                );
            }
            
            
            const hasModule = (pNumber, section, code) => {
                return juniorData.moduleCompletions.find(m => 
                    m.pNumber === pNumber && m.section === section && m.moduleCode === code
                );
            };
            
            const getSectionColor = (section) => {
                const colors = {
                    red: 'bg-red-600',
                    blue: 'bg-blue-600',
                    green: 'bg-green-600',
                    yellow: 'bg-yellow-600',
                    stem: 'bg-purple-600'
                };
                return colors[section];
            };
            
            const getSectionBg = (section) => {
                const colors = {
                    red: 'bg-red-50',
                    blue: 'bg-blue-50',
                    green: 'bg-green-50',
                    yellow: 'bg-yellow-50',
                    stem: 'bg-purple-50'
                };
                return colors[section];
            };
            
            const getSectionModuleBg = (section) => {
                const colors = {
                    red: 'bg-red-100 text-red-900',
                    blue: 'bg-blue-100 text-blue-900',
                    green: 'bg-green-100 text-green-900',
                    yellow: 'bg-yellow-100 text-yellow-900',
                    stem: 'bg-purple-100 text-purple-900'
                };
                return colors[section];
            };
            
            return (
                <div className="space-y-4">
                    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
                        <div className="flex items-center gap-3">
                            <Icon name="BarChart3" className="w-6 h-6 text-purple-700" />
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Junior Progress Chart</h1>
                                <p className="text-sm text-slate-600">{juniors.length} juniors tracked across {allModules.length} modules</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-xs border-collapse">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="sticky left-0 bg-slate-100 px-2 py-2 text-left font-bold text-slate-700 uppercase z-10 border-r text-xs" style={{maxWidth: '200px', width: '200px'}}>
                                            Module / Cadet
                                        </th>
                                        {juniors.map(junior => (
                                            <th key={junior.pNumber} className="px-1 py-2 text-center font-semibold text-slate-700 border-r last:border-r-0 relative bg-slate-100" style={{width: '30px'}}>
                                                <div className="flex items-center justify-center" style={{height: '140px'}}>
                                                    <div style={{
                                                        transform: 'rotate(-90deg)',
                                                        transformOrigin: 'center center',
                                                        whiteSpace: 'nowrap',
                                                        width: '140px',
                                                        textAlign: 'left',
                                                        position: 'absolute'
                                                    }}>
                                                        <div className="text-[10px] font-bold leading-tight">{junior.name}</div>
                                                        <div className="text-[8px] font-normal text-slate-500 leading-tight">{junior.rank}</div>
                                                    </div>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {allModules.map((mod, idx) => (
                                        <tr key={`${mod.s}-${mod.c}`} className={getSectionBg(mod.s)}>
                                            <td className={`sticky left-0 px-2 py-1 font-semibold border-r border-b z-10 text-xs ${getSectionModuleBg(mod.s)}`} style={{maxWidth: '200px', width: '200px'}}>
                                                <div className="overflow-hidden text-ellipsis whitespace-nowrap" title={`${mod.s.toUpperCase()} ${mod.c}: ${mod.n}`}>
                                                    <span className="font-bold">{mod.s.toUpperCase()} {mod.c}:</span> {mod.n}
                                                </div>
                                            </td>
                                            {juniors.map(junior => {
                                                const completion = hasModule(junior.pNumber, mod.s, mod.c);
                                                return (
                                                    <td key={junior.pNumber} style={{width: '30px'}} className={`px-0 py-1 text-center border-r border-b last:border-r-0 ${completion ? getSectionColor(mod.s) : ''}`}>
                                                        {completion ? '\u00A0' : ''}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            );
        };


        // --- 3.9 JUNIORS VIEW COMPONENT (RC2 Stage 2) ---
        // ============================================================================
        // DATA / UTILITIES VIEW COMPONENT
        // ============================================================================

        window.JuniorsView = ({ personnel, qualifications }) => {
            const juniorData = window.getJuniorData();
            
            // Filter personnel to only juniors (under 12)
            const juniors = personnel.filter(cadet => window.isJunior(cadet.dob));
            
            const [selectedJuniorPNum, setSelectedJuniorPNum] = useState(juniors.length > 0 ? juniors[0].pNumber : "");
            
            // Restore selected junior after reload (if saved)
            useEffect(() => {
                const tempJunior = localStorage.getItem('scc_temp_junior');
                if (tempJunior && juniors.some(j => j.pNumber === tempJunior)) {
                    setSelectedJuniorPNum(tempJunior);
                    localStorage.removeItem('scc_temp_junior'); // Clean up
                }
            }, [juniors]);
            
            if (juniors.length === 0) {
                return (
                    <div className="p-8">
                        <div className="bg-white rounded-lg shadow p-8 text-center">
                            <Icon name="Users" className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                            <h2 className="text-2xl font-bold text-slate-700 mb-2">No Junior Sea Cadets Found</h2>
                            <p className="text-slate-600">
                                No cadets under 12 years old found in your personnel data.
                            </p>
                            <p className="text-sm text-slate-500 mt-4">
                                Junior Sea Cadets are cadets aged 9-11 years old. 
                                Ensure DOB data is present in your Westminster personnel CSV.
                            </p>
                        </div>
                    </div>
                );
            }
            
            const selectedJunior = juniors.find(j => j.pNumber === selectedJuniorPNum) || juniors[0];
            
            return (
                <div className="space-y-6">
                    {/* Header with dropdown */}
                    <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-purple-500">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <Icon name="Users" className="w-8 h-8 text-purple-700" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-extrabold text-slate-900">Junior Focus</h1>
                                    <p className="text-slate-600">{juniors.length} junior{juniors.length !== 1 ? 's' : ''} (ages 9-11)</p>
                                </div>
                            </div>
                            <div className="w-full md:w-64">
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Junior</label>
                                <select 
                                    value={selectedJuniorPNum}
                                    onChange={(e) => setSelectedJuniorPNum(e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                >
                                    {juniors.map(junior => (
                                        <option key={junior.pNumber} value={junior.pNumber}>
                                            {junior.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    {/* Junior Detail */}
                    <JuniorDetail junior={selectedJunior} juniorData={juniorData} personnel={personnel} qualifications={qualifications} />
                </div>
            );
        };
        

        window.JuniorDetail = ({ junior, juniorData, personnel, qualifications }) => {
            const [section, setSection] = useState('red');
            const [moduleCode, setModuleCode] = useState('');
            const [dateCompleted, setDateCompleted] = useState(new Date().toISOString().split('T')[0]);
            const [showSuccess, setShowSuccess] = useState(false);
            
            const age = window.calculateAge(junior.dob);
            const daysTo12 = window.daysTo12thBirthday(junior.dob);
            
            // Get this junior's completed modules
            const juniorModules = juniorData.moduleCompletions.filter(m => m.pNumber === junior.pNumber);
            
            // Get section progress
            // Count unique modules only (duplicates count as one)
            const redModules = new Set(juniorModules.filter(m => m.section === 'red').map(m => m.moduleCode)).size;
            const blueModules = new Set(juniorModules.filter(m => m.section === 'blue').map(m => m.moduleCode)).size;
            const greenModules = new Set(juniorModules.filter(m => m.section === 'green').map(m => m.moduleCode)).size;
            const yellowModules = new Set(juniorModules.filter(m => m.section === 'yellow').map(m => m.moduleCode)).size;
            const stemModules = new Set(juniorModules.filter(m => m.section === 'stem').map(m => m.moduleCode)).size;
            
            // Use rank from Westminster CSV (not calculated from modules)
            const currentRank = junior.rank || "Junior Cadet";
            
            // Helper: Calculate time served from TOS Date
            const calculateTimeServed = (tosDate) => {
                if (!tosDate) return { months: 0, days: 0, text: "TOS Date not available" };
                try {
                    const tos = new Date(tosDate);
                    const now = new Date();
                    const diffMs = now - tos;
                    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    const months = Math.floor(diffDays / 30);
                    const days = diffDays % 30;
                    return { months, days, totalDays: diffDays, text: `${months} months, ${days} days` };
                } catch {
                    return { months: 0, days: 0, text: "Invalid TOS Date" };
                }
            };
            
            // Helper: Count proficiencies
            const countProficiencies = (pNumber) => {
                if (!qualifications || qualifications.length === 0) return 0;
                const juniorQuals = qualifications.filter(q => q.pNumber === pNumber);
                const proficiencyNames = [
                    "BC Paddle Discover Award",
                    "RYA YSS Stage 2",
                    "Sail - RYA YSS Stage 2",
                    "SCC Row 2",
                    "BR Explore Rowing - Go Row 2 (Fixed)",
                    "Rowing - BR Explore Rowing - Go Row 2 (Fixed)"
                ];
                return juniorQuals.filter(q => 
                    proficiencyNames.some(name => q.module.includes(name))
                ).length;
            };
            
            // Helper: Count RED core modules (specific list from syllabus)
            const redCoreModules = ["1", "1.1", "1.2", "1.3", "1.4", "1.5", "5", "6", "15", "16", "17"];
            const redCoresCompleted = juniorModules.filter(m => 
                m.section === 'red' && redCoreModules.includes(m.moduleCode)
            ).length;
            
            // Helper: Count BLUE core modules
            const blueCoreModules = ["1", "9", "15", "21"];
            const blueCoresCompleted = juniorModules.filter(m => 
                m.section === 'blue' && blueCoreModules.includes(m.moduleCode)
            ).length;
            
            // Get time served and proficiencies
            const timeServed = calculateTimeServed(junior.tos);
            const proficiencies = countProficiencies(junior.pNumber);
            
            // Calculate next rank and requirements (DYNAMIC)
            let nextRank = "";
            let requirements = [];
            
            // Normalize rank name for comparison
            const rankLower = currentRank.toLowerCase();
            
            if (rankLower.includes("junior cadet 1st class") || rankLower.includes("jcfc")) {
                nextRank = "Able Junior Cadet";
                
                // BLUE Core modules
                const blueNeed = 4 - blueCoresCompleted;
                if (blueCoresCompleted >= 4) {
                    requirements.push("✓ BLUE Section Core modules (4/4 completed)");
                } else {
                    requirements.push(`Complete BLUE Section Core modules (${blueCoresCompleted}/4 - need ${blueNeed} more)`);
                }
                
                // 12 months service
                if (timeServed.months >= 12) {
                    requirements.push(`✓ 12 months service (${timeServed.text})`);
                } else {
                    const daysNeeded = (12 * 30) - timeServed.totalDays;
                    requirements.push(`12 months service (${timeServed.text} - need ${daysNeeded} more days)`);
                }
                
                // One proficiency
                if (proficiencies >= 1) {
                    requirements.push(`✓ At least one proficiency (${proficiencies} completed)`);
                } else {
                    requirements.push("Complete at least one proficiency (0 completed)");
                }
                
            } else if (rankLower.includes("able junior") || rankLower.includes("ajc")) {
                nextRank = "Leading Junior Cadet";
                
                // All 4 sections
                const sectionsComplete = [
                    { name: "RED", count: redModules, need: 15 },
                    { name: "BLUE", count: blueModules, need: 15 },
                    { name: "GREEN", count: greenModules, need: 15 },
                    { name: "YELLOW", count: yellowModules, need: 15 }
                ];
                const allSectionsComplete = sectionsComplete.every(s => s.count >= s.need);
                
                if (allSectionsComplete) {
                    requirements.push("✓ All four Sections completed (RED, BLUE, GREEN, YELLOW)");
                } else {
                    const progress = sectionsComplete.map(s => {
                        const status = s.count >= s.need ? "✓" : "✗";
                        return `${status} ${s.name}: ${s.count}/15`;
                    }).join(", ");
                    requirements.push(`Complete all four Sections: ${progress}`);
                }
                
                // One additional proficiency (total 2)
                if (proficiencies >= 2) {
                    requirements.push(`✓ One additional proficiency (${proficiencies} total)`);
                } else {
                    const need = 2 - proficiencies;
                    requirements.push(`Complete one additional proficiency (${proficiencies}/2 - need ${need} more)`);
                }
                
                // Age 11
                if (age >= 11) {
                    requirements.push(`✓ At least 11 years old (currently ${age})`);
                } else {
                    requirements.push(`At least 11 years old (currently ${age} - ${11 - age} year${11 - age > 1 ? 's' : ''} remaining)`);
                }
                
                requirements.push("Be recommended by Juniors Training Officer");
                
            } else if (rankLower.includes("leading junior") || rankLower.includes("ljc")) {
                nextRank = "Top Rank (promote to Sea Cadet at 12)";
                requirements.push(`Continue activities until 12th birthday (${daysTo12} days remaining)`);
                
            } else {
                // Default: Junior Cadet
                nextRank = "Junior Cadet 1st Class";
                
                // RED Core modules
                const redNeed = 11 - redCoresCompleted;
                if (redCoresCompleted >= 11) {
                    requirements.push("✓ RED Section Core modules (11/11 completed)");
                } else {
                    requirements.push(`Complete RED Section Core modules (${redCoresCompleted}/11 - need ${redNeed} more)`);
                }
                
                // 6 months service
                if (timeServed.months >= 6) {
                    requirements.push(`✓ 6 months service (${timeServed.text})`);
                } else {
                    const daysNeeded = (6 * 30) - timeServed.totalDays;
                    requirements.push(`6 months service (${timeServed.text} - need ${daysNeeded} more days)`);
                }
            }
            
            // Get rank images (same logic as Cadet Focus)
            const rankImages = useMemo(() => {
                if(!junior) return null;
                return RANK_IMG_MAP[junior.rank] || null;
            }, [junior]);

            // Get waterborne proficiencies (same logic as Cadet Focus)
            const juniorWaterborne = useMemo(() => {
                if (!junior) return [];
                
                const cadetQuals = qualifications.filter(q => q.pNumber === junior.pNumber && q.module);
                const awardedWaterborne = [];
                const safetyBoatHeld = cadetQuals.some(q => q.module.includes("Safety Boat"));

                const swimQual = cadetQuals.find(q => {
                    const m = q.module.toLowerCase();
                    return m.includes("swim test") || m.includes("swimming test") || m.includes("water safety");
                });

                if (swimQual) {
                    awardedWaterborne.push({ name: "Swim Test / Water Safety", key: "Swim Test", date: swimQual.date });
                } else {
                    awardedWaterborne.push({ name: "Swim Test Required", key: "No Swim Test", date: null });
                }

                // Check for STEM Award
                const stemAward = cadetQuals.find(q => q.module.includes("JSC STEM Unit Activities Badge"));
                if (stemAward) {
                    awardedWaterborne.push({ name: "JSC STEM Award", key: "SCC - JSC STEM Unit Activities Badge", date: stemAward.date });
                }

                Object.entries(CADET_FOCUS_WATERBORNE_HIERARCHY).forEach(([category, levels]) => {
                    const highestAward = levels.find(specName => {
                        if (specName.includes("Powerboat Instructor")) {
                            return cadetQuals.some(q => q.module.includes("Powerboat Instructor") && !q.module.includes("Pre-Entry"));
                        }
                        return cadetQuals.some(q => q.module.includes(specName)); 
                    });

                    if (highestAward) {
                         let key = highestAward;
                         // Map to Badge Keys
                         if (highestAward.includes("Rowing Coxswain")) key = "Rowing Coxswain";
                         else if (highestAward.includes("Rowing Supervised Coxswain")) key = "Rowing Supervised Coxswain";
                         else if (highestAward.includes("Rowing Competent Crew")) key = "Rowing Competent Crew";
                         else if (highestAward.includes("Rowing Instructor")) key = "Rowing Instructor";
                         else if (highestAward.includes("Explore Award")) key = "Paddle Explore Award";
                         else if (highestAward.includes("Discover Award")) key = "Paddle Discover Award";
                         else if (highestAward.includes("Paddlesport Instructor")) key = "Paddlesport Instructor";
                         else if (highestAward.includes("Dinghy Instructor")) key = "Dinghy Instructor";
                         else if (highestAward.includes("Stage 4") && category === "Sailing") key = "Sailing Stage 4 / Level 3";
                         else if (highestAward.includes("Stage 3") && category === "Sailing") key = "Sailing Stage 3 / Level 2";
                         else if (highestAward.includes("Stage 2") && category === "Sailing") key = "Sailing Stage 2 / Level 1";
                         else if (highestAward.includes("Spinnakers")) key = "Sailing with Spinnakers";
                         else if (highestAward.includes("Seamanship Skills")) key = "Seamanship Skills";
                         else if (highestAward.includes("Start Racing")) key = "Start Racing";
                         else if (highestAward.includes("Performance Sailing")) key = "Performance Sailing";
                         else if (highestAward.includes("Day Sailing")) key = "Day Sailing";
                         else if (highestAward.includes("Start Windsurfing Instructor")) key = "Windsurfing Instructor";
                         else if (highestAward.includes("Stage 4") && category === "Windsurfing") key = "Windsurfing Stage 4";
                         else if (highestAward.includes("Stage 3") && category === "Windsurfing") key = "Windsurfing Stage 3";
                         else if (highestAward.includes("Stage 2") && category === "Windsurfing") key = "Windsurfing Stage 2";
                         else if (highestAward.includes("Stage 1") && category === "Windsurfing") key = "Windsurfing Stage 1";
                         else if (highestAward.includes("Powerboat Instructor")) key = "Powerboat Instructor";
                         else if (highestAward.includes("Powerboat Level 2")) key = "RYA Powerboat Level 2";
                         else if (highestAward.includes("Powerboat Level 1")) key = "RYA Powerboat Level 1";
                         else if (highestAward.includes("Power Watch Leader")) key = "Offshore Power Watch Leader";
                         else if (highestAward.includes("Power Seaman")) key = "Offshore Power Seaman";
                         else if (highestAward.includes("Power Grade 2")) key = "Offshore Power Grade 2";
                         else if (highestAward.includes("Power Grade 1")) key = "Offshore Power Grade 1";
                         else if (highestAward.includes("Sail Watch Leader")) key = "Offshore Sailing Watch Leader";
                         else if (highestAward.includes("Sail Seaman")) key = "Offshore Sailing Seaman";
                         else if (highestAward.includes("Sail Grade 2")) key = "Offshore Sailing Grade 2";
                         else if (highestAward.includes("Sail Grade 1")) key = "Offshore Sailing Grade 1";
                         else if (highestAward.includes("Master Coxswain")) key = "Master Coxswain";
                         else if (highestAward === "Coxswain Award" || highestAward === "SCC Row Coxswain Module") key = "Cadet Coxswain";

                        const qualRecord = cadetQuals.find(q => q.module.includes(highestAward));

                        awardedWaterborne.push({ name: highestAward, key: key, date: qualRecord ? qualRecord.date : null });
                    }
                    
                    if (category === "Powerboat" && safetyBoatHeld) {
                         if (!awardedWaterborne.some(wb => wb.name.includes("Safety Boat"))) {
                             const sbQual = cadetQuals.find(q => q.module.includes("Safety Boat"));
                             awardedWaterborne.push({ name: "RYA Safety Boat", key: "RYA Safety Boat", date: sbQual ? sbQual.date : null });
                         }
                    }
                });

                return awardedWaterborne;
            }, [qualifications, junior?.pNumber]);

            const handleModuleSubmit = () => {
                if (!moduleCode.trim()) {
                    alert("Please enter a module code");
                    return;
                }
                
                // Split by commas to allow multiple modules
                const codes = moduleCode.split(',').map(c => c.trim()).filter(c => c);
                
                if (codes.length === 0) {
                    alert("Please enter at least one module code");
                    return;
                }
                
                // Create module object for each code
                const newModules = codes.map(code => ({
                    pNumber: junior.pNumber,
                    section: section,
                    moduleCode: code.toUpperCase(),
                    moduleName: code,
                    dateCompleted: dateCompleted,
                    isCore: false
                }));
                
                const updatedData = {
                    ...juniorData,
                    moduleCompletions: [...juniorData.moduleCompletions, ...newModules]
                };
                
                if (window.saveJuniorData(updatedData)) {
                    setShowSuccess(true);
                    setModuleCode('');
                    // Save current state before reload
                    localStorage.setItem('scc_temp_view', 'juniors');
                    localStorage.setItem('scc_temp_junior', junior.pNumber);
                    setTimeout(() => {
                        setShowSuccess(false);
                        window.location.reload(); // Refresh to show new data
                    }, 1500);
                } else {
                    alert("Error saving module completions");
                }
            };
            
            const handleModuleDelete = (moduleToDelete) => {
                const confirmMsg = `Delete ${moduleToDelete.section.toUpperCase()} ${moduleToDelete.moduleCode} (completed ${window.formatDate(moduleToDelete.dateCompleted)})?\n\nThis cannot be undone.`;
                
                if (!confirm(confirmMsg)) {
                    return; // User cancelled
                }
                
                // Filter out the specific module entry
                const updatedCompletions = juniorData.moduleCompletions.filter(m => {
                    // Match by pNumber, section, moduleCode, and date to ensure we delete the exact entry
                    return !(
                        m.pNumber === moduleToDelete.pNumber &&
                        m.section === moduleToDelete.section &&
                        m.moduleCode === moduleToDelete.moduleCode &&
                        m.dateCompleted === moduleToDelete.dateCompleted
                    );
                });
                
                const updatedData = {
                    ...juniorData,
                    moduleCompletions: updatedCompletions
                };
                
                if (window.saveJuniorData(updatedData)) {
                    // Save current state before reload
                    localStorage.setItem('scc_temp_view', 'juniors');
                    localStorage.setItem('scc_temp_junior', junior.pNumber);
                    window.location.reload(); // Refresh to show updated data
                } else {
                    alert("Error deleting module");
                }
            };
            
            return (
                <div className="space-y-6">
                    {/* Junior Info Card */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-slate-600 mb-2">Name</p>
                                <p className="font-bold text-lg mb-3">{junior.name}</p>
                                
                                {/* Rank Badge Display */}
                                <div className="mt-2 pt-2 border-t border-slate-200">
                                    <p className="text-xs text-slate-500 font-semibold mb-2">Current Rank</p>
                                    <div className="flex items-center gap-3">
                                        {rankImages || currentRank === "Able Junior Cadet" ? (
                                            <>
                                                {currentRank === "Able Junior Cadet" || rankImages?.count === 2 ? (
                                                    <div className="flex gap-1">
                                                        <img src="media/scc_junior_star.webp" className="h-10 w-auto object-contain shadow-sm" alt="Rank Star 1" onError={(e) => e.target.style.display = 'none'} />
                                                        <img src="media/scc_junior_star.webp" className="h-10 w-auto object-contain shadow-sm" alt="Rank Star 2" onError={(e) => e.target.style.display = 'none'} />
                                                    </div>
                                                ) : (
                                                    <>
                                                        {rankImages?.sleeve && <img src={`media/${rankImages.sleeve}`} className="h-10 w-auto object-contain shadow-sm" alt="Sleeve Rank" title="Sleeve Badge" onError={(e) => e.target.style.display = 'none'} />}
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            <div className="h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
                                                <Icon name="Shield" className="w-5 h-5"/>
                                            </div>
                                        )}
                                        <p className="font-bold text-purple-700 leading-tight">{currentRank}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600 mb-2">Next Rank</p>
                                <p className="text-lg font-bold text-blue-600 mb-2">{nextRank}</p>
                                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                                    <p className="text-xs text-slate-500 font-semibold mb-2">Requirements:</p>
                                    <ul className="text-xs text-slate-600 space-y-1">
                                        {requirements.map((req, idx) => (
                                            <li key={idx}>• {req}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Age / Days to 12th Birthday</p>
                                <p className="font-bold text-lg">{age} years old / {daysTo12} days</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Section Progress */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-xl font-bold mb-4">Section Progress</h3>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="text-center p-4 bg-red-50 rounded-lg border-2 border-red-200">
                                <p className="text-sm font-semibold text-red-800">Red - Unit</p>
                                <p className="text-3xl font-bold text-red-700">{redModules}/15</p>
                                <div className="w-full bg-red-200 rounded-full h-2 mt-2">
                                    <div className="bg-red-600 h-2 rounded-full" style={{width: `${Math.min((redModules/15)*100, 100)}%`}}></div>
                                </div>
                                {(() => {
                                    const redAward = qualifications?.find(q => q.pNumber === junior.pNumber && q.module.includes("JSC Red Unit Activities Badge"));
                                    if (redAward) {
                                        return <p className="text-xs font-bold text-green-900 mt-2 bg-green-100 py-1 px-2 rounded">Awarded on {window.formatDate(redAward.date)}</p>;
                                    } else if (redModules >= 15) {
                                        return <p className="text-xs font-bold text-red-900 mt-2 bg-red-100 py-1 px-2 rounded">AWARD DUE</p>;
                                    }
                                    return null;
                                })()}
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                                <p className="text-sm font-semibold text-blue-800">Blue - Waterborne</p>
                                <p className="text-3xl font-bold text-blue-700">{blueModules}/15</p>
                                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{width: `${Math.min((blueModules/15)*100, 100)}%`}}></div>
                                </div>
                                {(() => {
                                    const blueAward = qualifications?.find(q => q.pNumber === junior.pNumber && q.module.includes("JSC Blue Waterborne Activities Badge"));
                                    if (blueAward) {
                                        return <p className="text-xs font-bold text-green-900 mt-2 bg-green-100 py-1 px-2 rounded">Awarded on {window.formatDate(blueAward.date)}</p>;
                                    } else if (blueModules >= 15) {
                                        return <p className="text-xs font-bold text-blue-900 mt-2 bg-blue-100 py-1 px-2 rounded">AWARD DUE</p>;
                                    }
                                    return null;
                                })()}
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                                <p className="text-sm font-semibold text-green-800">Green - Outdoor</p>
                                <p className="text-3xl font-bold text-green-700">{greenModules}/15</p>
                                <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                                    <div className="bg-green-600 h-2 rounded-full" style={{width: `${Math.min((greenModules/15)*100, 100)}%`}}></div>
                                </div>
                                {(() => {
                                    const greenAward = qualifications?.find(q => q.pNumber === junior.pNumber && q.module.includes("JSC Green Outdoor & Recreation Activities Badge"));
                                    if (greenAward) {
                                        return <p className="text-xs font-bold text-green-900 mt-2 bg-green-100 py-1 px-2 rounded">Awarded on {window.formatDate(greenAward.date)}</p>;
                                    } else if (greenModules >= 15) {
                                        return <p className="text-xs font-bold text-green-900 mt-2 bg-green-100 py-1 px-2 rounded">AWARD DUE</p>;
                                    }
                                    return null;
                                })()}
                            </div>
                            <div className="text-center p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                                <p className="text-sm font-semibold text-yellow-800">Yellow - Community</p>
                                <p className="text-3xl font-bold text-yellow-700">{yellowModules}/15</p>
                                <div className="w-full bg-yellow-200 rounded-full h-2 mt-2">
                                    <div className="bg-yellow-600 h-2 rounded-full" style={{width: `${Math.min((yellowModules/15)*100, 100)}%`}}></div>
                                </div>
                                {(() => {
                                    const yellowAward = qualifications?.find(q => q.pNumber === junior.pNumber && q.module.includes("JSC Yellow Community & Citizenship Activities Badge"));
                                    if (yellowAward) {
                                        return <p className="text-xs font-bold text-green-900 mt-2 bg-green-100 py-1 px-2 rounded">Awarded on {window.formatDate(yellowAward.date)}</p>;
                                    } else if (yellowModules >= 15) {
                                        return <p className="text-xs font-bold text-yellow-900 mt-2 bg-yellow-100 py-1 px-2 rounded">AWARD DUE</p>;
                                    }
                                    return null;
                                })()}
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                                <p className="text-sm font-semibold text-purple-800">STEM</p>
                                <p className="text-3xl font-bold text-purple-700">{stemModules}/15</p>
                                <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                                    <div className="bg-purple-600 h-2 rounded-full" style={{width: `${Math.min((stemModules/15)*100, 100)}%`}}></div>
                                </div>
                                {(() => {
                                    const stemAward = qualifications?.find(q => q.pNumber === junior.pNumber && q.module.includes("JSC STEM Unit Activities Badge"));
                                    const crestAward = qualifications?.find(q => q.pNumber === junior.pNumber && q.module.includes("JSC Crest Award"));
                                    
                                    // STEM Badge (15+ modules)
                                    if (stemAward && stemModules >= 15) {
                                        return <p className="text-xs font-bold text-green-900 mt-2 bg-green-100 py-1 px-2 rounded">STEM Awarded on {window.formatDate(stemAward.date)}</p>;
                                    } else if (!stemAward && stemModules >= 15) {
                                        return <p className="text-xs font-bold text-purple-900 mt-2 bg-purple-100 py-1 px-2 rounded">STEM AWARD DUE</p>;
                                    }
                                    
                                    // CREST Award (8+ modules)
                                    if (crestAward && stemModules >= 8) {
                                        return <p className="text-xs font-bold text-green-900 mt-2 bg-green-100 py-1 px-2 rounded">CREST Awarded on {window.formatDate(crestAward.date)}</p>;
                                    } else if (!crestAward && stemModules >= 8) {
                                        return <p className="text-xs font-bold text-purple-900 mt-2 bg-purple-100 py-1 px-2 rounded">CREST AWARD DUE</p>;
                                    }
                                    
                                    return null;
                                })()}
                            </div>
                        </div>
                        
                        {/* Commodore's Broad Pennant Alert */}
                        {redModules >= 15 && blueModules >= 15 && greenModules >= 15 && yellowModules >= 15 && (() => {
                            const broadPennant = qualifications?.find(q => q.pNumber === junior.pNumber && q.module.includes("JSC Commodores Broad Pennant"));
                            if (broadPennant) {
                                return (
                                    <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Icon name="Award" className="w-8 h-8 text-green-600" />
                                            <div>
                                                <p className="font-bold text-green-900 text-lg">🎖️ COMMODORE'S BROAD PENNANT</p>
                                                <p className="text-sm text-green-800">Awarded on {window.formatDate(broadPennant.date)}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            } else {
                                return (
                                    <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Icon name="Award" className="w-8 h-8 text-amber-600" />
                                            <div>
                                                <p className="font-bold text-amber-900 text-lg">🎖️ COMMODORE'S BROAD PENNANT DUE!</p>
                                                <p className="text-sm text-amber-800">All four core sections completed (RED, BLUE, GREEN, YELLOW)</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        })()}
                    </div>
                    
                    {/* Junior Proficiencies */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Icon name="Award" className="w-5 h-5 text-purple-600"/> Junior Proficiencies</h3>
                        
                        <div className="flex gap-4 overflow-x-auto pb-4">
                            {juniorWaterborne.map((wb, idx) => (
                                <div key={idx} className="flex-shrink-0 flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-lg p-3 min-w-[120px] text-center">
                                    <div className="h-24 flex items-center justify-center mb-2">
                                        <BadgeImage name={wb.key} className="h-24 w-auto object-contain" fallbackIcon="Award"/>
                                    </div>
                                    <p className="text-xs font-bold text-slate-700 leading-tight">{wb.name}</p>
                                    <p className="text-[10px] text-slate-500 mt-1">{window.formatDate(wb.date)}</p>
                                </div>
                            ))}
                            {juniorWaterborne.length === 0 && <div className="w-full text-center py-4 text-slate-400 italic bg-slate-50 rounded border border-dashed">No waterborne proficiencies found for this junior.</div>}
                        </div>
                    </div>
                    
                    {/* Add Module Completion */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-xl font-bold mb-4">Add Module Completion</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Section</label>
                                <select 
                                    value={section}
                                    onChange={(e) => setSection(e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded-lg"
                                >
                                    <option value="red">Red - Unit</option>
                                    <option value="blue">Blue - Waterborne</option>
                                    <option value="green">Green - Outdoor</option>
                                    <option value="yellow">Yellow - Community</option>
                                    <option value="stem">STEM</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Module Code</label>
                                <input
                                    type="text"
                                    value={moduleCode}
                                    onChange={(e) => setModuleCode(e.target.value)}
                                    placeholder="e.g. 1.1 or 1,1.1,1.2 for multiple"
                                    className="w-full p-2 border border-slate-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Date Completed</label>
                                <input
                                    type="date"
                                    value={dateCompleted}
                                    onChange={(e) => setDateCompleted(e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded-lg"
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={handleModuleSubmit}
                                    className="w-full bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 font-semibold"
                                >
                                    Add Module
                                </button>
                            </div>
                        </div>
                        {showSuccess && (
                            <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700">
                                ✓ Module added successfully!
                            </div>
                        )}
                    </div>
                    
                    {/* Completed Modules List */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-xl font-bold mb-4">Completed Modules ({juniorModules.length})</h3>
                        {juniorModules.length === 0 ? (
                            <p className="text-slate-500 italic">No modules completed yet.</p>
                        ) : (
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {juniorModules.map((mod, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                        <div>
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mr-2 ${
                                                mod.section === 'red' ? 'bg-red-100 text-red-800' :
                                                mod.section === 'blue' ? 'bg-blue-100 text-blue-800' :
                                                mod.section === 'green' ? 'bg-green-100 text-green-800' :
                                                mod.section === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-purple-100 text-purple-800'
                                            }`}>
                                                {mod.section.toUpperCase()} {mod.moduleCode}
                                            </span>
                                            <span className="text-slate-700">{mod.moduleName}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-500">{window.formatDate(mod.dateCompleted)}</span>
                                            <button
                                                onClick={() => handleModuleDelete(mod)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title="Delete this module"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M3 6h18"></path>
                                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                                    <line x1="10" x2="10" y1="11" y2="17"></line>
                                                    <line x1="14" x2="14" y1="11" y2="17"></line>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Other Awards from CSV */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Icon name="Award" className="w-5 h-5 text-amber-600"/> Other Awards</h3>
                        {(() => {
                            const cadetQuals = qualifications.filter(q => q.pNumber === junior.pNumber && q.module);
                            const awards = [];
                            
                            // Check for section badges
                            if (cadetQuals.some(q => q.module.includes("JSC Red Unit Activities Badge"))) {
                                const award = cadetQuals.find(q => q.module.includes("JSC Red Unit Activities Badge"));
                                awards.push({ name: "JSC Red - Unit Activities", key: "SCC - JSC Red Unit Activities Badge", date: award.date });
                            }
                            if (cadetQuals.some(q => q.module.includes("JSC Blue Waterborne Activities Badge"))) {
                                const award = cadetQuals.find(q => q.module.includes("JSC Blue Waterborne Activities Badge"));
                                awards.push({ name: "JSC Blue - Waterborne", key: "SCC - JSC Blue Waterborne Activities Badge", date: award.date });
                            }
                            if (cadetQuals.some(q => q.module.includes("JSC Green Outdoor & Recreation Activities Badge"))) {
                                const award = cadetQuals.find(q => q.module.includes("JSC Green Outdoor"));
                                awards.push({ name: "JSC Green - Outdoor", key: "SCC - JSC Green Outdoor & Recreation Activities Badge", date: award.date });
                            }
                            if (cadetQuals.some(q => q.module.includes("JSC Yellow Community & Citizenship Activities Badge"))) {
                                const award = cadetQuals.find(q => q.module.includes("JSC Yellow Community"));
                                awards.push({ name: "JSC Yellow - Community", key: "SCC - JSC Yellow Community & Citizenship Activities Badge", date: award.date });
                            }
                            if (cadetQuals.some(q => q.module.includes("JSC STEM Unit Activities Badge"))) {
                                const award = cadetQuals.find(q => q.module.includes("JSC STEM Unit Activities Badge"));
                                awards.push({ name: "JSC STEM Award", key: "SCC - JSC STEM Unit Activities Badge", date: award.date });
                            }
                            if (cadetQuals.some(q => q.module.includes("JSC Commodores Broad Pennant"))) {
                                const award = cadetQuals.find(q => q.module.includes("JSC Commodores Broad Pennant"));
                                awards.push({ name: "JSC Commodores Broad Pennant", key: "SCC - JSC Commodores Broad Pennant", date: award.date });
                            }
                            
                            return awards.length === 0 ? (
                                <p className="text-slate-500 italic">No awards found in qualifications CSV yet.</p>
                            ) : (
                                <div className="flex gap-4 overflow-x-auto pb-4">
                                    {awards.map((award, idx) => (
                                        <div key={idx} className="flex-shrink-0 flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-lg p-3 min-w-[120px] text-center">
                                            <div className="h-24 flex items-center justify-center mb-2">
                                                <BadgeImage name={award.key} className="h-24 w-auto object-contain" fallbackIcon="Award"/>
                                            </div>
                                            <p className="text-xs font-bold text-slate-700 leading-tight">{award.name}</p>
                                            <p className="text-[10px] text-slate-500 mt-1">{window.formatDate(award.date)}</p>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                    
                </div>
            );
        };

        // ============================================================================
        // SECTION 4: MAIN APP COMPONENT
        // ============================================================================

console.log("✓ Juniors module loaded (JuniorsView, JuniorDetail, JuniorProgressView)");
