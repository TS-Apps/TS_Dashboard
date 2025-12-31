/**
 * Sea Cadet Training Dashboard - Awards View Module
 * Version: 1.0-RC2.40
 * Includes PDF certificate generation
 */


// Destructure React hooks
const { useState, useEffect, useMemo, useCallback } = React;

        window.AwardsView = ({ personnel, quals }) => {
            const [monthOffset, setMonthOffset] = useState(0); 
            // New State for PDF Selection
            const [selectedAwardKeys, setSelectedAwardKeys] = useState(new Set());

            const getTargetDate = () => {
                const d = new Date();
                d.setMonth(d.getMonth() + monthOffset);
                return d;
            };

            const targetDate = useMemo(() => getTargetDate(), [monthOffset]);
            const monthName = targetDate.toLocaleString('default', { month: 'long', year: 'numeric' });

            const isSpecOrProf = (syllabus) => {
                if (!syllabus) return false;
                return syllabus.includes("Specialisations") || syllabus.includes("Proficiencies");
            };

            const isDofEAward = (qualName) => {
                 return qualName.includes("DofE") && (qualName.includes("Bronze") || qualName.includes("Silver") || qualName.includes("Gold"));
            };

            const isCTPModule = (qualName) => {
                 const inSCC = Object.values(window.SCC_SYLLABUS).some(rank => 
                     Object.values(rank).some(category => 
                         category.some(mod => qualName.includes(mod.code) || qualName === mod.title)
                     )
                 );
                 const inRMC = Object.values(window.RMC_SYLLABUS).some(rank => 
                     Object.values(rank).some(category => 
                         category.some(mod => qualName.includes(mod.code) || qualName === mod.title)
                     )
                 );
                 return inSCC || inRMC;
            };

            const { pastAwards, upcomingAwards } = useMemo(() => {
                let endDate, startDate, nextStart, nextEnd;

                if (monthOffset === 0) {
                    endDate = new Date(); 
                    startDate = new Date();
                    startDate.setDate(endDate.getDate() - 30);
                    
                    nextStart = new Date();
                    nextEnd = new Date();
                    nextEnd.setDate(nextStart.getDate() + 30);
                } else {
                    startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
                    endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
                    
                    nextStart = new Date(endDate);
                    nextEnd = new Date(endDate);
                    nextEnd.setDate(nextStart.getDate() + 30);
                }

                let past = quals.filter(q => {
                    if (!q.date) return false;
                    // Ensure q.date is handled correctly even if it's a string from legacy state
                    const d = new Date(q.date);
                    if(isNaN(d.getTime())) return false;

                    const inDate = d >= startDate && d <= endDate;
                    const isSpec = isSpecOrProf(q.syllabus);
                    const isDofE = isDofEAward(q.module);
                    const isCTP = isCTPModule(q.module);
                    
                    return inDate && (isSpec || isDofE || !isCTP);
                }).map(q => {
                    const cadet = personnel.find(p => p.pNumber === q.pNumber);
                    let type = "Qualification";
                    if (isSpecOrProf(q.syllabus)) type = q.syllabus.includes("Specialisations") ? "Specialisation" : "Proficiency";
                    if (isDofEAward(q.module)) type = "DofE";
                    
                    // Generate a unique ID for selection tracking
                    const d = new Date(q.date);
                    const uniqueId = `${q.pNumber}-${q.module.replace(/\s+/g, '')}-${d.getTime()}`;

                    return { ...q, uniqueId, cadetName: cadet ? cadet.name : "Unknown", type: type, date: d };
                });

                personnel.forEach(p => {
                    if (p.rankDate) {
                        const rDate = window.parseDate(p.rankDate);
                        if (rDate && rDate >= startDate && rDate <= endDate) {
                            const uniqueId = `${p.pNumber}-PROMO-${rDate.getTime()}`;
                            past.push({
                                uniqueId,
                                cadetName: p.name,
                                module: `Promoted to ${p.rank}`,
                                type: "Promotion",
                                date: rDate,
                                pNumber: p.pNumber
                            });
                        }
                    }
                });

                const upcoming = [];
                personnel.forEach(p => {
                    // --- GCB Logic ---
                    if (p.tos && p.dob) {
                        const tos = window.parseDate(p.tos);
                        const dob = window.parseDate(p.dob);
                        
                        if (tos && dob) {
                            const twelfthBirthday = new Date(dob);
                            twelfthBirthday.setFullYear(dob.getFullYear() + 12);
                            const baseDate = tos > twelfthBirthday ? tos : twelfthBirthday;
                            
                            for (let year = 1; year <= 3; year++) {
                                const gcbDate = new Date(baseDate);
                                gcbDate.setFullYear(baseDate.getFullYear() + year);
                                
                                if (gcbDate >= nextStart && gcbDate <= nextEnd) {
                                    const uniqueId = `${p.pNumber}-GCB${year}-${gcbDate.getTime()}`;
                                    upcoming.push({
                                        cadetName: p.name,
                                        module: `${year === 1 ? '1st' : year === 2 ? '2nd' : '3rd'} Good Conduct Badge`,
                                        date: gcbDate,
                                        type: "GCB Due",
                                        pNumber: p.pNumber,
                                        uniqueId
                                    });
                                }
                            }
                        }
                    }

                    // --- Waterborne Award Logic (Due/Pending) ---
                    const cadetQuals = quals.filter(q => q.pNumber === p.pNumber);
                    const hasQual = (str) => cadetQuals.some(q => q.module && q.module.toLowerCase().includes(str.toLowerCase()));
                    
                    const hasMasterAward = hasQual("Master Coxswain Award");
                    if (hasMasterAward) return; // Skip logic if highest award achieved
                    const hasCoxswainAward = hasQual("Coxswain Award");

                    let proficienciesMet = 0;
                    if (hasQual("Rowing Coxswain") || hasQual("SCC Coxswain") || hasQual("Row 3")) proficienciesMet++;
                    if (hasQual("Paddle Explore")) proficienciesMet++;
                    if (hasQual("Stage 4")) proficienciesMet++;
                    if (hasQual("Windsurfing") && (hasQual("Stage 2") || hasQual("Stage 3") || hasQual("Stage 4"))) proficienciesMet++;

                    const meetsCoxswainCriteria = proficienciesMet >= 2;
                    let meetsMasterCriteria = false;

                    if (meetsCoxswainCriteria) {
                        const hasPB2 = hasQual("Powerboat Level 2") || hasQual("Powerboat L2") || hasQual("Level 2 Planing") || hasQual("Level 2 Disp");
                        const hasENS = hasQual("Essential Navigation");
                        const hasDaySkipper = hasQual("Day Skipper") || hasQual("Watch Leader");

                        if (hasPB2) {
                            const hasNavP1 = hasENS || hasDaySkipper;
                            if (hasNavP1) {
                                const hasP1Option = hasQual("Assistant Rowing Instructor") || hasQual("CST") || hasQual("FSRT") || hasQual("Foundation Safety") || hasQual("PSRC") || hasQual("Paddle Safety") || hasQual("Assistant Instructor") || (hasQual("Assistant") && hasQual("Windsurf"));
                                if (hasP1Option) meetsMasterCriteria = true;
                            }
                            if (!meetsMasterCriteria && hasENS) {
                                const hasP2Option = hasQual("Paddlesport Instructor") || (hasQual("Dinghy Instructor") && !hasQual("Assistant")) || (hasQual("Windsurfing Instructor") && !hasQual("Assistant")) || (hasQual("Powerboat Instructor") && !hasQual("Assistant"));
                                if (hasP2Option) meetsMasterCriteria = true;
                            }
                        }
                    }

                    if (meetsMasterCriteria && !hasMasterAward) {
                           const d = new Date();
                           const uniqueId = `${p.pNumber}-MASTERCOX-${d.getTime()}`;
                           upcoming.push({
                               cadetName: p.name,
                               module: "Master Coxswain Award",
                               date: d, // Action required now
                               type: "Award Due",
                               pNumber: p.pNumber,
                               uniqueId
                           });
                    } else if (meetsCoxswainCriteria && !hasCoxswainAward && !hasMasterAward) {
                           const d = new Date();
                           const uniqueId = `${p.pNumber}-COX-${d.getTime()}`;
                           upcoming.push({
                               cadetName: p.name,
                               module: "Coxswain Award",
                               date: d, // Action required now
                               type: "Award Due",
                               pNumber: p.pNumber,
                               uniqueId
                           });
                    }
                });

                // --- Junior Awards Logic ---
                const juniors = personnel.filter(c => {
                    if (!c.dob) return false;
                    const age = window.calculateAge(c.dob);
                    return age >= 9 && age <= 11;
                });
                
                juniors.forEach(junior => {
                    const juniorData = window.getJuniorData();
                    const juniorModules = juniorData.moduleCompletions.filter(m => m.pNumber === junior.pNumber);
                    
                    // Count unique modules only (duplicates count as one)
                    const redCount = new Set(juniorModules.filter(m => m.section === 'red').map(m => m.moduleCode)).size;
                    const blueCount = new Set(juniorModules.filter(m => m.section === 'blue').map(m => m.moduleCode)).size;
                    const greenCount = new Set(juniorModules.filter(m => m.section === 'green').map(m => m.moduleCode)).size;
                    const yellowCount = new Set(juniorModules.filter(m => m.section === 'yellow').map(m => m.moduleCode)).size;
                    const stemCount = new Set(juniorModules.filter(m => m.section === 'stem').map(m => m.moduleCode)).size;
                    
                    const d = new Date(); // All junior awards are "due now"
                    
                    // Check RED Badge (15 modules)
                    if (redCount >= 15 && !quals.some(q => q.pNumber === junior.pNumber && q.module.includes("JSC Red Unit Activities Badge"))) {
                        const uniqueId = `${junior.pNumber}-JSC-RED-${d.getTime()}`;
                        upcoming.push({
                            cadetName: junior.name,
                            module: "JSC Red - Unit Activities Badge",
                            date: d,
                            type: "Award Due",
                            pNumber: junior.pNumber,
                            uniqueId
                        });
                    }
                    
                    // Check BLUE Badge (15 modules)
                    if (blueCount >= 15 && !quals.some(q => q.pNumber === junior.pNumber && q.module.includes("JSC Blue Waterborne Activities Badge"))) {
                        const uniqueId = `${junior.pNumber}-JSC-BLUE-${d.getTime()}`;
                        upcoming.push({
                            cadetName: junior.name,
                            module: "JSC Blue - Waterborne Activities Badge",
                            date: d,
                            type: "Award Due",
                            pNumber: junior.pNumber,
                            uniqueId
                        });
                    }
                    
                    // Check GREEN Badge (15 modules)
                    if (greenCount >= 15 && !quals.some(q => q.pNumber === junior.pNumber && q.module.includes("JSC Green Outdoor & Recreation Activities Badge"))) {
                        const uniqueId = `${junior.pNumber}-JSC-GREEN-${d.getTime()}`;
                        upcoming.push({
                            cadetName: junior.name,
                            module: "JSC Green - Outdoor & Recreation Activities Badge",
                            date: d,
                            type: "Award Due",
                            pNumber: junior.pNumber,
                            uniqueId
                        });
                    }
                    
                    // Check YELLOW Badge (15 modules)
                    if (yellowCount >= 15 && !quals.some(q => q.pNumber === junior.pNumber && q.module.includes("JSC Yellow Community & Citizenship Activities Badge"))) {
                        const uniqueId = `${junior.pNumber}-JSC-YELLOW-${d.getTime()}`;
                        upcoming.push({
                            cadetName: junior.name,
                            module: "JSC Yellow - Community & Citizenship Activities Badge",
                            date: d,
                            type: "Award Due",
                            pNumber: junior.pNumber,
                            uniqueId
                        });
                    }
                    
                    // Check CREST Award (8+ modules)
                    if (stemCount >= 8 && !quals.some(q => q.pNumber === junior.pNumber && q.module.includes("JSC Crest Award"))) {
                        const uniqueId = `${junior.pNumber}-JSC-CREST-${d.getTime()}`;
                        upcoming.push({
                            cadetName: junior.name,
                            module: "JSC Crest Award",
                            date: d,
                            type: "Award Due",
                            pNumber: junior.pNumber,
                            uniqueId
                        });
                    }
                    
                    // Check STEM Badge (15 modules)
                    if (stemCount >= 15 && !quals.some(q => q.pNumber === junior.pNumber && q.module.includes("JSC STEM Unit Activities Badge"))) {
                        const uniqueId = `${junior.pNumber}-JSC-STEM-${d.getTime()}`;
                        upcoming.push({
                            cadetName: junior.name,
                            module: "JSC STEM - Unit Activities Badge",
                            date: d,
                            type: "Award Due",
                            pNumber: junior.pNumber,
                            uniqueId
                        });
                    }
                    
                    // Check Commodore's Broad Pennant (all 4 core sections 15+)
                    if (redCount >= 15 && blueCount >= 15 && greenCount >= 15 && yellowCount >= 15 && 
                        !quals.some(q => q.pNumber === junior.pNumber && q.module.includes("JSC Commodores Broad Pennant"))) {
                        const uniqueId = `${junior.pNumber}-JSC-CBP-${d.getTime()}`;
                        upcoming.push({
                            cadetName: junior.name,
                            module: "JSC Commodores Broad Pennant",
                            date: d,
                            type: "Award Due",
                            pNumber: junior.pNumber,
                            uniqueId
                        });
                    }
                });

                return { 
                    pastAwards: past.sort((a,b) => b.date - a.date), 
                    upcomingAwards: upcoming.sort((a,b) => a.date - b.date) 
                };
            }, [personnel, quals, monthOffset, targetDate]);

            // --- PDF GENERATION LOGIC ---
            const toggleAwardSelection = (id) => {
                const newSet = new Set(selectedAwardKeys);
                if (newSet.has(id)) newSet.delete(id);
                else newSet.add(id);
                setSelectedAwardKeys(newSet);
            };

            const selectAllAwards = () => {
                if (selectedAwardKeys.size === pastAwards.length) {
                    setSelectedAwardKeys(new Set());
                } else {
                    setSelectedAwardKeys(new Set(pastAwards.map(a => a.uniqueId)));
                }
            };

            const generateCertificates = () => {
                if (selectedAwardKeys.size === 0) {
                    // Use a custom message box instead of alert()
                    const message = "Please select at least one award to print.";
                    console.log(message); // Console log fallback
                    // A custom modal/message box implementation is normally needed here. 
                    // For brevity and compliance with single file constraint, using console.log/simple approach.
                    return; 
                }

                const { jsPDF} = window.jspdf;
                const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
                
                // Clean unit name using helper function
                const unitName = personnel.length > 0 ? cleanUnitName(personnel[0].unit) : "Unit";
                
                // Load logos from localStorage
                const unitCrest = localStorage.getItem('unit_crest');
                const sccLogo = localStorage.getItem('scc_logo');
                const rmcLogo = localStorage.getItem('rmc_logo');
                
                // Helper function to add image with preserved aspect ratio
                const itemsToPrint = pastAwards.filter(a => selectedAwardKeys.has(a.uniqueId));

                itemsToPrint.forEach((item, index) => {
                    if (index > 0) doc.addPage();

                    // Get cadet's rank
                    const cadet = personnel.find(p => p.pNumber === item.pNumber);
                    const cadetRank = cadet ? cadet.rank : "Cadet";
                    
                    // For promotions, we need the OLD rank (the rank before promotion)
                    let rankForCertificate = cadetRank;
                    if (item.type === "Promotion") {
                        // Extract the new rank from the module text "Promoted to [New Rank]"
                        const newRank = item.module.replace("Promoted to ", "");
                        // Get the previous rank in the progression
                        rankForCertificate = window.getPreviousRank(newRank);
                    }
                    
                    // Format name with appropriate rank abbreviation
                    const formattedName = window.formatCadetNameWithRank(item.cadetName, rankForCertificate);
                    
                    // Determine certificate wording based on type
                    let middleText = "has successfully qualified in";
                    let awardTitle = item.module;
                    
                    if (item.type === "Promotion") {
                        middleText = "has been promoted to";
                        awardTitle = awardTitle.replace("Promoted to ", "");
                    } else if (item.type === "GCB Due" || item.module.includes("Good Conduct Badge")) {
                        middleText = "has been awarded the";
                    }

                    // --- Certificate Design ---
                    
                    // Add logos if available (maintaining aspect ratios)
                    // Unit Crest - Center top
                    if (unitCrest) {
                        const imgProps = doc.getImageProperties(unitCrest);
                        const width = 50; // Target width in mm
                        const height = (imgProps.height * width) / imgProps.width; // Maintain aspect ratio
                        doc.addImage(unitCrest, 'JPEG', (297 - width) / 2, 10, width, height);
                    }
                    
                    // RMC Logo - Bottom left corner (50% larger = 52.5mm)
                    if (rmcLogo) {
                        const imgProps = doc.getImageProperties(rmcLogo);
                        const width = 52.5; // 35 * 1.5
                        const height = (imgProps.height * width) / imgProps.width; // Maintain aspect ratio
                        doc.addImage(rmcLogo, 'JPEG', 10, 210 - height - 10, width, height);
                    }
                    
                    // SCC Logo - Bottom right corner (50% larger = 52.5mm)
                    if (sccLogo) {
                        const imgProps = doc.getImageProperties(sccLogo);
                        const width = 52.5; // 35 * 1.5
                        const height = (imgProps.height * width) / imgProps.width; // Maintain aspect ratio
                        doc.addImage(sccLogo, 'JPEG', 297 - width - 10, 210 - height - 10, width, height);
                    }
                    
                    // Header
                    doc.setTextColor(0, 51, 102);
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(32);
                    doc.text("CERTIFICATE OF ACHIEVEMENT", 148.5, 75, { align: "center" });

                    // Subheader
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(16);
                    doc.text("This is to certify that", 148.5, 95, { align: "center" });

                    // Name (with rank for awards, without for promotions)
                    doc.setFont("helvetica", "bolditalic");
                    doc.setFontSize(28);
                    doc.text(formattedName, 148.5, 110, { align: "center" });

                    // Middle text (dynamic based on type)
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(16);
                    doc.text(middleText, 148.5, 125, { align: "center" });

                    // Award Title
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(24);
                    // Handle long titles
                    if (awardTitle.length > 30) doc.setFontSize(18);
                    doc.text(awardTitle, 148.5, 140, { align: "center" });

                    // Date
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(14);
                    doc.text(`Awarded on: ${window.formatDate(item.date)}`, 148.5, 155, { align: "center" });

                    // Footer - Signature line centered
                    doc.setFontSize(12);
                    doc.text(`Signed: __________________________`, 148.5, 175, { align: "center" });
                    doc.text(`Commanding Officer`, 148.5, 181, { align: "center" });
                    
                    // Unit name centered at bottom
                    doc.setFontSize(11);
                    doc.text(`${unitName} Sea Cadets`, 148.5, 195, { align: "center" });
                });

                doc.save(`SCC_Certificates_${monthName}.pdf`);
            };

            // --- UPCOMING AWARDS REPORT GENERATION ---
            const generateUpcomingReport = () => {
                if (upcomingAwards.length === 0) {
                    console.log("No upcoming awards to report.");
                    return;
                }
                
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
                const unitName = personnel.length > 0 ? cleanUnitName(personnel[0].unit) : "Sea Cadets";
                
                doc.setFont("helvetica", "bold");
                doc.setFontSize(18);
                doc.text(`Upcoming Awards Report - ${unitName}`, 105, 20, { align: "center" });
                
                doc.setFontSize(12);
                doc.setFont("helvetica", "normal");
                doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 105, 30, { align: "center" });
                
                let y = 45;
                const itemsToPrint = upcomingAwards; // Print all upcoming awards
                
                // Headers
                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);
                doc.text("Cadet Name", 15, y);
                doc.text("Award / Module", 60, y);
                doc.text("Type", 140, y);
                doc.text("Due Date", 175, y);
                
                doc.line(15, y+2, 195, y+2);
                y += 10;
                
                doc.setFont("helvetica", "normal");
                
                itemsToPrint.forEach(item => {
                    if (y > 270) {
                        doc.addPage();
                        y = 20;
                        // Optional: Repeat headers
                        doc.setFont("helvetica", "bold");
                        doc.text("Cadet Name", 15, y);
                        doc.text("Award / Module", 60, y);
                        doc.text("Type", 140, y);
                        doc.text("Due Date", 175, y);
                        doc.line(15, y+2, 195, y+2);
                        y += 10;
                        doc.setFont("helvetica", "normal");
                    }
                    
                    doc.text(item.cadetName, 15, y);
                    
                    // Handle long module names
                    const splitTitle = doc.splitTextToSize(item.module, 75);
                    doc.text(splitTitle, 60, y);
                    
                    doc.text(item.type, 140, y);
                    const dateStr = item.type === 'Award Due' ? 'Action Required' : window.formatDate(item.date);
                    doc.text(dateStr, 175, y);
                    
                    // Adjust y based on lines (approx 5mm per line of text)
                    y += (5 * splitTitle.length) + 4; 
                });
                
                doc.save(`SCC_Upcoming_Report_${monthName}.pdf`);
            };

            return (
                <div className="space-y-6">
                    <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
                             <div className="flex justify-between items-center mb-6">
                                 <h2 className="text-lg font-bold text-slate-800">Awards & Recognition</h2>
                                 <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                                     <button onClick={() => setMonthOffset(m => m - 1)} className="p-2 hover:bg-white rounded-md text-slate-600 transition-colors" title="Previous Month">
                                         <Icon name="ChevronLeft" className="w-4 h-4" />
                                     </button>
                                     <span className="text-sm font-semibold text-slate-700 min-w-[140px] text-center">
                                         {monthOffset === 0 ? "Current (Last 30 Days)" : monthName}
                                     </span>
                                     <button onClick={() => setMonthOffset(m => m + 1)} className="p-2 hover:bg-white rounded-md text-slate-600 transition-colors" title="Next Month">
                                         <Icon name="ChevronRight" className="w-4 h-4" />
                                     </button>
                                 </div>
                             </div>
                             
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                 {/* Achieved Column with Printing Logic */}
                                 <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                     <div className="flex justify-between items-end mb-4">
                                         <div className="flex items-center gap-2">
                                             <div className="p-2 bg-green-100 rounded-full text-green-700"><Icon name="CheckCircle" className="w-5 h-5" /></div>
                                             <div>
                                                 <h3 className="font-bold text-slate-700">Achieved</h3>
                                                 <p className="text-[10px] text-slate-500">Awards & Promotions in selected period</p>
                                             </div>
                                         </div>
                                         {pastAwards.length > 0 && (
                                             <button 
                                                 onClick={generateCertificates}
                                                 disabled={selectedAwardKeys.size === 0}
                                                 className={`text-xs px-3 py-1.5 rounded flex items-center gap-1 font-bold transition-all ${selectedAwardKeys.size > 0 ? 'bg-blue-800 text-white shadow' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                             >
                                                 <Icon name="Upload" className="w-3 h-3" /> Print PDF ({selectedAwardKeys.size})
                                             </button>
                                         )}
                                     </div>

                                     {pastAwards.length > 0 && (
                                         <div className="mb-2 flex justify-end">
                                             <button onClick={selectAllAwards} className="text-[10px] text-blue-600 hover:underline">
                                                 {selectedAwardKeys.size === pastAwards.length ? "Deselect All" : "Select All"}
                                             </button>
                                         </div>
                                     )}

                                     <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                         {pastAwards.length === 0 ? (
                                             <p className="text-sm text-slate-400 italic text-center py-4">No recent awards found.</p>
                                         ) : (
                                             pastAwards.map((award, idx) => (
                                                 <div key={award.uniqueId} className={`bg-white p-3 rounded shadow-sm border transition-colors flex items-start gap-3 ${selectedAwardKeys.has(award.uniqueId) ? 'border-blue-400 ring-1 ring-blue-100' : 'border-slate-100'}`}>
                                                     
                                                     <div className="pt-1">
                                                         <input 
                                                             type="checkbox" 
                                                             checked={selectedAwardKeys.has(award.uniqueId)}
                                                             onChange={() => toggleAwardSelection(award.uniqueId)}
                                                             className="w-4 h-4 rounded border-slate-300 text-blue-800 focus:ring-blue-800"
                                                         />
                                                     </div>

                                                     <div className="flex-1">
                                                         <div className="flex justify-between items-start">
                                                             <div>
                                                                 <p className="font-bold text-sm text-slate-800">{award.cadetName}</p>
                                                                 <p className="text-xs text-slate-600">{award.module}</p>
                                                             </div>
                                                             <span className={`px-2 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap ${
                                                                 award.type === 'Specialisation' ? 'bg-orange-100 text-orange-800' : 
                                                                 award.type === 'Proficiency' ? 'bg-emerald-100 text-emerald-800' : 
                                                                 award.type === 'DofE' ? 'bg-yellow-100 text-yellow-800' :
                                                                 award.type === 'Promotion' ? 'bg-purple-100 text-purple-800' :
                                                                 'bg-blue-100 text-blue-800'
                                                             }`}>
                                                                 {award.type}
                                                             </span>
                                                         </div>
                                                         <p className="text-[10px] text-slate-400 mt-1 text-right">{window.formatDate(award.date)}</p>
                                                     </div>
                                                 </div>
                                             ))
                                         )}
                                     </div>
                                 </div>
                                 
                                 {/* Upcoming Awards (Modified) */}
                                 <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                     <div className="flex justify-between items-end mb-4">
                                         <div className="flex items-center gap-2">
                                             <div className="p-2 bg-amber-100 rounded-full text-amber-700"><Icon name="Calendar" className="w-5 h-5" /></div>
                                             <div>
                                                 <h3 className="font-bold text-slate-700">Due / Upcoming</h3>
                                                 <p className="text-[10px] text-slate-500">Awards due or upcoming in 30 days</p>
                                             </div>
                                         </div>
                                         {upcomingAwards.length > 0 && (
                                             <button 
                                                 onClick={generateUpcomingReport}
                                                 className={`text-xs px-3 py-1.5 rounded flex items-center gap-1 font-bold transition-all bg-amber-700 hover:bg-amber-800 text-white shadow`}
                                             >
                                                 <Icon name="FileText" className="w-3 h-3" /> Print Report
                                             </button>
                                         )}
                                     </div>

                                     <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                         {upcomingAwards.length === 0 ? (
                                             <p className="text-sm text-slate-400 italic text-center py-4">No upcoming awards found.</p>
                                         ) : (
                                             upcomingAwards.map((award, idx) => (
                                                 <div key={idx} className="bg-white p-3 rounded shadow-sm border border-slate-100 transition-colors flex items-start gap-3">
                                                     <div className="flex-1">
                                                         <div className="flex justify-between items-start">
                                                             <div>
                                                                 <p className="font-bold text-sm text-slate-800">{award.cadetName}</p>
                                                                 <p className="text-xs text-slate-600">{award.module}</p>
                                                             </div>
                                                             <span className={`px-2 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap ${
                                                                 award.type === 'Award Due' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                                                             }`}>
                                                                 {award.type}
                                                             </span>
                                                         </div>
                                                         <p className="text-[10px] text-slate-400 mt-1 text-right">
                                                             {award.type === 'Award Due' ? 'Action Required' : `Due: ${window.formatDate(award.date)}`}
                                                         </p>
                                                     </div>
                                                 </div>
                                             ))
                                         )}
                                     </div>
                                 </div>
                             </div>
                    </div>
                </div>
            );
        };


console.log("✓ Awards view module loaded");
