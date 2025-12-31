/**
 * Sea Cadet Training Dashboard - Cadet Focus Module
 * Version: 1.0-RC2.40
 * Individual cadet detail view with badges and progression
 */

        window.CadetFocus = ({ personnel, qualsData }) => {
            // Filter out juniors (under 12) - they have their own Junior Focus page
            const seniorCadets = useMemo(() => 
                personnel.filter(cadet => !isJunior(cadet.dob)), 
                [personnel]
            );
            
            const [selectedCadetPNum, setSelectedCadetPNum] = useState(seniorCadets.length > 0 ? seniorCadets[0].pNumber : "");
            
            // Force reset if selected cadet is not in list (e.g. new file load)
            useEffect(() => {
                if (seniorCadets.length > 0 && (!selectedCadetPNum || !seniorCadets.find(p => p.pNumber === selectedCadetPNum))) {
                    setSelectedCadetPNum(seniorCadets[0].pNumber);
                }
            }, [seniorCadets, selectedCadetPNum]);
            
            const sortedPersonnel = useMemo(() => [...seniorCadets].sort((a, b) => a.name.localeCompare(b.name)), [seniorCadets]);
            const selectedCadet = useMemo(() => seniorCadets.find(p => p.pNumber === selectedCadetPNum), [seniorCadets, selectedCadetPNum]);
            
            const cadetAge = useMemo(() => selectedCadet?.dob ? window.calculateAge(selectedCadet.dob) : "Unknown", [selectedCadet]);
            const cadetAgeClass = useMemo(() => selectedCadet?.dob ? window.getCadetAgeColor(selectedCadet.dob) : "", [selectedCadet]);

            // Get Rank Images
            const rankImages = useMemo(() => {
                if(!selectedCadet) return null;
                return window.RANK_IMG_MAP[selectedCadet.rank] || null;
            }, [selectedCadet]);

            const gcbInfo = useMemo(() => {
                if (!selectedCadet) return null;

                // Search qualsData for GCB awards
                const cadetQuals = qualsData.filter(q => q.pNumber === selectedCadet.pNumber);
                
                let level = 0;
                if (cadetQuals.some(q => q.module && q.module.includes("3rd Good Conduct Badge"))) {
                    level = 3;
                } else if (cadetQuals.some(q => q.module && q.module.includes("2nd Good Conduct Badge"))) {
                    level = 2;
                } else if (cadetQuals.some(q => q.module && q.module.includes("1st Good Conduct Badge"))) {
                    level = 1;
                }

                if (level === 0) return { text: "None", img: null };

                const isRMC = window.RMC_RANK_ORDER.includes(selectedCadet.rank) || 
                              selectedCadet.rank.includes("Marine") || 
                              selectedCadet.rank.includes("Corporal") || 
                              selectedCadet.rank.includes("Sergeant") ||
                              selectedCadet.rank.includes("Recruit");
                              
                const isPOC = selectedCadet.rank === "Petty Officer Cadet";

                let imgName = "";
                if (isRMC) {
                    imgName = `rmc_good_conduct_${level}yr.webp`;
                } else if (isPOC) {
                    imgName = `scc_cadet_poc_good_conduct_${level}yr.webp`;
                } else {
                    imgName = `scc_cadet_good_conduct_${level}yr.webp`;
                }

                const ordinal = level === 1 ? "1st" : level === 2 ? "2nd" : "3rd";
                return { text: `${ordinal} Good Conduct Badge`, img: imgName };
            }, [selectedCadet, qualsData]);

            // Logic for Appointments
            const appointmentInfo = useMemo(() => {
                if (!selectedCadet) return null;
                const cadetQuals = qualsData.filter(q => q.pNumber === selectedCadet.pNumber);
                
                // Priority Check: First Sea Lord > Lord Lieutenant > Lord Mayor
                if (cadetQuals.some(q => q.module.includes("First Sea Lord"))) return { text: "First Sea Lord's Cadet", img: "scc_award_first_sea_lords_cadet.webp" };
                if (cadetQuals.some(q => q.module.includes("Lord Lieutenant"))) return { text: "Lord Lieutenant's Cadet", img: "scc_award_lord_lieutenants_cadet.webp" };
                if (cadetQuals.some(q => q.module.includes("Lord Mayor"))) return { text: "Lord Mayor's Cadet", img: "scc_award_lord_mayors_cadet.webp" };
                
                return null;
            }, [selectedCadet, qualsData]);

            // UPDATED HIERARCHY for Specialisations: Ensures correct hierarchy and names including Intermediate First Aid
            const CADET_FOCUS_HIERARCHY = {
                "Seamanship": ["Seamanship - Advanced (Class 1)", "Seamanship - Intermediate (Class 2)", "Seamanship - Basic (Class 3)"],
                "First Aid": ["First Aid - FAA Level 3 Award in Outdoor First Aid", "First Aid - Cadet First Aid Advanced", "First Aid - Cadet First Aid Intermediate", "First Aid - Cadet First Aid Basic"], 
                "Marine Engineering": [
                    "Marine Engineering (Mechanical) - Advanced", // NEW specific names
                    "Marine Engineering (Electrical) - Advanced", // NEW specific names
                    "Marine Engineering Mechanical - Advanced", 
                    "Marine Engineering Electrical - Advanced", 
                    "Marine Engineering - Advanced", 
                    "Marine Engineering - Intermediate", 
                    "Marine Engineering - Basic"
                ], // Re-ordered to prioritise specific advanced levels
                "Navigation": ["Navigation - Cadet Instructor", "Navigation - Advanced", "Navigation - Intermediate", "Navigation - Basic"],
                "CIS": ["CIS Principle Instructor", "Communication Information Systems - Radio Advanced", "Communication Information Systems - Radio Intermediate", "Communication Information Systems - Radio Basic", "CIS Info Sys - Advanced", "CIS Info Sys - Intermediate", "CIS Info Sys - Basic"],
                "Catering": ["Catering - Advanced", "Stewarding - Advanced", "Catering & Stewarding - Intermediate Catering", "Catering & Stewarding - Basic Catering", "Stewarding - Basic"],
                "PT": ["Physical Training - Instructor", "Physical Training - Advanced", "Physical Training - Intermediate", "Physical Training - Basic"]
            };

            const cadetSpecs = useMemo(() => {
                if (!selectedCadet) return [];
                
                const cadetQuals = qualsData.filter(q => q.pNumber === selectedCadet.pNumber && q.module);
                const awardedSpecs = [];

                // Iterate through categories, searching for the highest achievement first (due to array order)
                Object.entries(CADET_FOCUS_HIERARCHY).forEach(([category, levels]) => {
                    let foundQual = null;
                    const highestAward = levels.find(specName => {
                        // Search levels in defined order (highest rank first)
                        // Use strict equality for common manual input strings to avoid false matches
                        foundQual = cadetQuals.find(q => q.module === specName || q.module.includes(specName));
                        return !!foundQual;
                    });

                    if (highestAward && foundQual) {
                        let mapKey = highestAward;
                        
                        // --- 1. Standardize mapping to window.BADGE_MAP keys ---
                        
                        const mapKeyLower = mapKey.toLowerCase();
                        
                        // First Aid Fix 
                        if (mapKeyLower.includes("faa level 3")) mapKey = "First Aid - Advanced";
                        else if (mapKeyLower.includes("cadet first aid advanced")) mapKey = "First Aid - Advanced";
                        else if (mapKeyLower.includes("cadet first aid intermediate")) mapKey = "First Aid - Intermediate";
                        else if (mapKeyLower.includes("cadet first aid basic")) mapKey = "First Aid - Basic";

                        // Marine Engineering Fix 
                        if (mapKeyLower.includes("marine engineering (mechanical) - advanced") || mapKeyLower.includes("marine engineering mechanical - advanced")) {
                             mapKey = "Marine Engineering Mechanical - Advanced"; 
                        }
                        else if (mapKeyLower.includes("marine engineering (electrical) - advanced") || mapKeyLower.includes("marine engineering electrical - advanced")) {
                            mapKey = "Marine Engineering Electrical - Advanced";
                        }
                        else if (mapKeyLower.includes("marine engineering - advanced")) {
                             // Fallback: If generic Advanced is used, assume Mechanical for the badge image
                             mapKey = "Marine Engineering Mechanical - Advanced"; 
                        }
                        else if (mapKeyLower.includes("marine engineering - intermediate")) mapKey = "Marine Engineering - Intermediate";
                        else if (mapKeyLower.includes("marine engineering - basic")) mapKey = "Marine Engineering - Basic";
                        
                        // Seamanship Cleanup (Maps classes)
                        else if (mapKeyLower.includes("seamanship - advanced")) mapKey = "Seamanship - Advanced";
                        else if (mapKeyLower.includes("seamanship - intermediate")) mapKey = "Seamanship - Intermediate";
                        else if (mapKeyLower.includes("seamanship - basic")) mapKey = "Seamanship - Basic";

                        // CIS / Radio Cleanup (Maps long names)
                        else if (mapKeyLower.includes("communication information systems - radio advanced")) mapKey = "CIS Radio - Advanced";
                        else if (mapKeyLower.includes("communication information systems - radio intermediate")) mapKey = "CIS Radio - Intermediate";
                        else if (mapKeyLower.includes("communication information systems - radio basic")) mapKey = "CIS Radio - Basic";
                        
                        // Catering/Stewarding Cleanup
                        else if (mapKeyLower.includes("intermediate catering")) mapKey = "Catering - Intermediate";
                        else if (mapKeyLower.includes("basic catering")) mapKey = "Catering - Basic";
                        else if (mapKeyLower.includes("catering - advanced")) mapKey = "Catering - Advanced";
                        else if (mapKeyLower.includes("stewarding - advanced")) mapKey = "Stewarding - Advanced";
                        else if (mapKeyLower.includes("stewarding - basic")) mapKey = "Stewarding - Basic";
                        
                        // Instructor/Info Sys Cleanup 
                        else if (mapKeyLower.includes("physical training (instructor)")) mapKey = "Physical Training - Instructor";
                        else if (mapKeyLower.includes("navigation (cadet instructor)")) mapKey = "Navigation - Cadet Instructor";
                        else if (mapKeyLower.includes("cis info sys - advanced")) mapKey = "CIS Info Sys - Advanced";
                        else if (mapKeyLower.includes("cis info sys - intermediate")) mapKey = "CIS Info Sys - Intermediate";
                        else if (mapKeyLower.includes("cis info sys - basic")) mapKey = "CIS Info Sys - Basic";
                        
                        // Drill 
                        else if (mapKeyLower.includes("drill - advanced")) mapKey = "Drill - Advanced";
                        else if (mapKeyLower.includes("drill - intermediate")) mapKey = "Drill - Intermediate";
                        else if (mapKeyLower.includes("drill - basic")) mapKey = "Drill - Basic";


                        // Final fallback for direct matches (e.g. Navigation - Advanced)
                        if (!window.BADGE_MAP[mapKey] && window.BADGE_MAP[highestAward]) {
                             mapKey = highestAward;
                        }
                        
                        awardedSpecs.push({ name: highestAward, key: mapKey, date: foundQual.date });
                    }
                });

                return awardedSpecs;
            }, [qualsData, selectedCadetPNum]);

            const CADET_FOCUS_PROFS_HIERARCHY = {
                "Campcraft": ["Campcraft (Advanced)", "Campcraft (Intermediate)", "Adv Trg - Basic Campcraft", "Campcraft (Basic)"], 
                "Climbing": ["Climbing (Advanced)", "Climbing (Intermediate)", "Climbing (Basic)"],
                "Mountain Biking": ["Mountain Biking (Advanced)", "Mountain Biking Advanced", "Mountain Biking (Intermediate)", "Mountain Biking Intermediate", "Mountain Biking (Basic)", "Mountain Biking Basic"],
                "Shooting": ["WT - GSB Full Bore Marksman", "WT - GSB Full Bore Advanced", "WT - GSB Full Bore Basic", "WT - GSB Small Bore Marksman", "WT - GSB Small Bore Advanced", "WT - GSB Small Bore Basic", "WT - GSB Air Rifle Marksman", "WT - GSB Air Rifle Advanced", "WT - GSB Air Rifle Basic"],
                "Piping": ["Piping Proficiency", "Piping Basic", "Piping - Basic"],
                "Music": ["Band - Bugling Proficiency", "Band - Band Proficiency", "Band - Drumming Proficiency", "Bugler", "Musician", "Drummer"], 
                "Comms": ["Radio Amateur", "Morse Code", "Semaphore"],
                "Met": ["Meteorology", "Met - Proficiency"],
                "Diving": ["Diving (Cadet)"]
            };

            const cadetProfs = useMemo(() => {
                if (!selectedCadet) return [];
                
                const cadetQuals = qualsData.filter(q => q.pNumber === selectedCadet.pNumber && q.module);
                const awardedProfs = [];

                // Helper for hierarchical awards (Campcraft, Shooting, etc.)
                const checkAndAdd = (category, levels) => {
                      let foundQual = null;
                      const highestAward = levels.find(specName => {
                          foundQual = cadetQuals.find(q => q.module.includes(specName));
                          return !!foundQual;
                      });

                      if (highestAward && foundQual) {
                          let mapKey = highestAward; 
                          
                          // Clean up key for image map
                          const mapKeyLower = mapKey.toLowerCase();

                          // Shooting Cleanup
                          if(mapKeyLower.includes("air rifle marksman")) mapKey = "Air Rifle Marksman";
                          else if(mapKeyLower.includes("air rifle advanced")) mapKey = "Air Rifle Advanced";
                          else if(mapKeyLower.includes("air rifle basic")) mapKey = "Air Rifle Basic";
                          else if(mapKeyLower.includes("small bore marksman")) mapKey = "Small Bore Marksman";
                          else if(mapKeyLower.includes("small bore advanced")) mapKey = "Small Bore Advanced";
                          else if(mapKeyLower.includes("small bore basic")) mapKey = "Small Bore Basic";
                          else if(mapKeyLower.includes("full bore marksman")) mapKey = "Full Bore Marksman";
                          else if(mapKeyLower.includes("full bore advanced")) mapKey = "Full Bore Advanced";
                          else if(mapKeyLower.includes("full bore basic")) mapKey = "Full Bore Basic";

                          // Campcraft / Climbing / MTB Cleanup
                          else if(mapKeyLower.includes("campcraft")) mapKey = highestAward.includes("Advanced") ? "Campcraft (Advanced)" : highestAward.includes("Intermediate") ? "Campcraft (Intermediate)" : "Campcraft (Basic)";
                          else if(mapKeyLower.includes("climbing")) mapKey = highestAward.includes("Advanced") ? "Climbing (Advanced)" : highestAward.includes("Intermediate") ? "Climbing (Intermediate)" : "Climbing (Basic)";
                          else if(mapKeyLower.includes("mountain biking")) mapKey = highestAward.includes("Advanced") ? "Mountain Biking (Advanced)" : highestAward.includes("Intermediate") ? "Mountain Biking (Intermediate)" : "Mountain Biking (Basic)";
                          
                          // Met & Piping Cleanup
                          else if(mapKeyLower.includes("met - proficiency")) mapKey = "Meteorology";
                          else if(mapKeyLower.includes("piping - basic")) mapKey = "Piping Basic";
                          
                          // Final fallback
                          if (!window.BADGE_MAP[mapKey] && window.BADGE_MAP[highestAward]) {
                              mapKey = highestAward;
                          }

                          awardedProfs.push({ name: highestAward, key: mapKey, date: foundQual.date });
                      }
                  };

                // Music and Comms are parallel/non-hierarchical, so we iterate through all to display them all.
                Object.entries(CADET_FOCUS_PROFS_HIERARCHY).forEach(([category, levels]) => {
                    if (category === "Music" || category === "Comms" || category === "Diving") {
                        levels.forEach(lvl => {
                            const found = cadetQuals.find(q => q.module.includes(lvl));
                            if(found) {
                                let mapKey = lvl;
                                // Clean up key for image map
                                if(lvl.includes("Bugling")) mapKey = "Bugler";
                                else if(lvl.includes("Drumming")) mapKey = "Drummer";
                                else if(lvl.includes("Band Proficiency")) mapKey = "Musician";
                                else if(lvl.includes("Radio Amateur")) mapKey = "Radio Amateur";
                                else if(lvl.includes("Morse Code")) mapKey = "Morse Code";
                                else if(lvl.includes("Semaphore")) mapKey = "Semaphore";
                                else if(lvl.includes("Diving (Cadet)")) mapKey = "Diving (Cadet)";
                                
                                awardedProfs.push({ name: lvl, key: mapKey, date: found.date });
                            }
                        });
                    } else {
                        // For hierarchical awards, find and add the highest level.
                        checkAndAdd(category, levels);
                    }
                });

                return awardedProfs;
            }, [qualsData, selectedCadetPNum]);

            const cadetWaterborne = useMemo(() => {
                if (!selectedCadet) return [];
                
                const cadetQuals = qualsData.filter(q => q.pNumber === selectedCadet.pNumber && q.module);
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
            }, [qualsData, selectedCadetPNum]);

            const cadetSpecificAwards = useMemo(() => {
                if (!selectedCadet) return [];
                const awards = [];
                const cadetQuals = qualsData.filter(q => q.pNumber === selectedCadet.pNumber && q.module);
                
                const getQual = (str) => {
                    return cadetQuals.find(q => q.module.toLowerCase().includes(str.toLowerCase()));
                };
                
                const getQualMulti = (str1, str2) => {
                    return cadetQuals.find(q => {
                        const m = q.module.toLowerCase();
                        return m.includes(str1.toLowerCase()) && m.includes(str2.toLowerCase());
                    });
                };

                let q = getQual("Canada Trophy");
                if (q) awards.push({ name: "Canada Trophy", key: "Canada Trophy", date: q.date });

                q = getQual("Commodore's Broad Pennant") || getQual("Broad Pennant");
                // Exclude JSC Broad Pennant from main awards if present
                if (q && !q.module.includes("JSC")) awards.push({ name: "Commodore's Broad Pennant", key: "Commodore's Broad Pennant", date: q.date });

                q = getQualMulti("Gold", "DofE");
                if (q) awards.push({ name: "DofE Gold", key: "DofE Gold", date: q.date });
                else {
                    q = getQualMulti("Silver", "DofE");
                    if (q) awards.push({ name: "DofE Silver", key: "DofE Silver", date: q.date });
                    else {
                        q = getQualMulti("Bronze", "DofE");
                        if (q) awards.push({ name: "DofE Bronze", key: "DofE Bronze", date: q.date });
                    }
                }

                q = getQual("BTEC Level 1") || getQualMulti("BTEC", "Level 1");
                if (q) awards.push({ name: "BTEC Level 1", key: "BTEC Level 1", date: q.date });
                
                q = getQual("BTEC Level 2") || getQualMulti("BTEC", "Level 2");
                if (q) awards.push({ name: "BTEC Level 2", key: "BTEC Level 2", date: q.date });

                q = getQual("Gold Wings");
                if (q) awards.push({ name: "Aviation Gold Wings", key: "Aviation Gold Wings", date: q.date });
                else {
                    q = getQual("Silver Wings");
                    if (q) awards.push({ name: "Aviation Silver Wings", key: "Aviation Silver Wings", date: q.date });
                    else {
                        q = getQual("Bronze Wings");
                        if (q) awards.push({ name: "Aviation Bronze Wings", key: "Aviation Bronze Wings", date: q.date });
                        else {
                            q = getQual("Aviation Wings") || getQual("Wings (Standard)");
                            if (q) awards.push({ name: "Aviation Wings (Standard)", key: "Aviation Wings (Standard)", date: q.date });
                        }
                    }
                }

                return awards;
            }, [qualsData, selectedCadetPNum, selectedCadet]);

            const cadetJuniorAwards = useMemo(() => {
                if (!selectedCadet) return [];
                const awards = [];
                const cadetQuals = qualsData.filter(q => q.pNumber === selectedCadet.pNumber && q.module);
                
                const juniorBadgeList = [
                    { search: "Red Unit Activities", name: "JSC Red - Unit", key: "SCC - JSC Red Unit Activities Badge" },
                    { search: "Blue Waterborne", name: "JSC Blue - Waterborne", key: "SCC - JSC Blue Waterborne Activities Badge" },
                    { search: "Green Outdoor", name: "JSC Green - Outdoor", key: "SCC - JSC Green Outdoor & Recreation Activities Badge" },
                    { search: "Yellow Community", name: "JSC Yellow - Community", key: "SCC - JSC Yellow Community & Citizenship Activities Badge" },
                    { search: "STEM", name: "JSC STEM", key: "SCC - JSC STEM Unit Activities Badge" },
                    { search: "JSC Commodores Broad Pennant", name: "JSC Broad Pennant", key: "SCC - JSC Commodores Broad Pennant" } 
                ];

                juniorBadgeList.forEach(item => {
                      const found = cadetQuals.find(q => q.module.includes(item.search));
                      if (found) {
                          awards.push({ name: item.name, key: item.key, date: found.date });
                      }
                });

                return awards;
            }, [qualsData, selectedCadetPNum, selectedCadet]);

            const cadetRecordGroups = useMemo(() => {
                if (!selectedCadet) return { ctp: {}, cts: {}, waterborne: {}, other: [], ctpKeys: [], ctsKeys: [], wbKeys: [] };
                
                const ctpGrouped = {};
                const ctsGrouped = {};
                const waterborneGrouped = {};
                const otherList = [];

                // Initialize groups based on order
                window.SCC_RANK_ORDER.forEach(r => ctpGrouped[r] = []);
                window.RMC_RANK_ORDER.forEach(r => ctsGrouped[r] = []);
                const WB_ORDER = ["Rowing", "Paddling", "Sailing", "Windsurfing", "Powerboat"];
                WB_ORDER.forEach(d => waterborneGrouped[d] = []);

                const getSccRank = (modName) => {
                    for (const rank of window.SCC_RANK_ORDER) {
                        if (window.SCC_SYLLABUS[rank]) {
                            for (const cat of Object.values(window.SCC_SYLLABUS[rank])) {
                                if (cat.some(m => modName.includes(m.code) || modName === m.title)) return rank;
                            }
                        }
                    }
                    return null;
                };

                const getRmcRank = (modName) => {
                    for (const rank of window.RMC_RANK_ORDER) {
                        if (window.RMC_SYLLABUS[rank]) {
                            for (const cat of Object.values(window.RMC_SYLLABUS[rank])) {
                                if (cat.some(m => modName.includes(m.code) || modName === m.title)) return rank;
                            }
                        }
                    }
                    return null;
                };

                const getWaterborneDisc = (modName) => {
                    const m = modName.toLowerCase();
                    if(m.includes('rowing') || m.includes('row ')) return "Rowing";
                    if(m.includes('paddle') || m.includes('canoe') || m.includes('kayak') || m.includes('sup ')) return "Paddling";
                    if(m.includes('sail') || m.includes('dinghy') || m.includes('spinnaker') || m.includes('seamanship')) return "Sailing";
                    if(m.includes('windsurf') || m.includes('wind -') || m.includes('youthws')) return "Windsurfing"; 
                    if(m.includes('powerboat') || m.includes('power ') || m.includes('safety boat')) return "Powerboat";
                    return null;
                };

                const isUsedInBadges = (modName) => {
                    // Check Specialisations
                    const inSpec = Object.values(CADET_FOCUS_HIERARCHY).flat().some(spec => {
                        const clean = spec.replace(/\(.*\)/, "").trim();
                        return modName.includes(clean);
                    });
                    if (inSpec) return true;

                    // Check Proficiencies
                    const inProf = Object.values(CADET_FOCUS_PROFS_HIERARCHY).flat().some(prof => {
                          const clean = prof.replace(/\(.*\)/, "").trim();
                          return modName.includes(clean);
                    });
                    if (inProf) return true;

                    // Check Awards (DofE etc)
                    if (modName.includes("Canada Trophy") || (modName.includes("Broad Pennant") && !modName.includes("JSC")) || modName.includes("DofE") || modName.includes("BTEC") || modName.includes("Wings")) return true;
                    if (modName.includes("First Sea Lord") || modName.includes("Lord Lieutenant") || modName.includes("Lord Mayor")) return true;
                    
                    // Check Junior Awards
                    if (modName.includes("JSC") || modName.includes("Junior Section")) return true;

                    return false;
                };

                const cadetQuals = qualsData.filter(q => q.pNumber === selectedCadet.pNumber);
                
                cadetQuals.forEach(q => {
                    const modName = q.module;
                    if (!modName) return;

                    const sccRank = getSccRank(modName);
                    if (sccRank) {
                        ctpGrouped[sccRank].push(q);
                        return;
                    }

                    const rmcRank = getRmcRank(modName);
                    if (rmcRank) {
                        ctsGrouped[rmcRank].push(q);
                        return;
                    }

                    const wbDisc = getWaterborneDisc(modName);
                    if (wbDisc) {
                        waterborneGrouped[wbDisc].push(q);
                        return;
                    }

                    if (!isUsedInBadges(modName)) {
                        otherList.push(q);
                    }
                });

                // Sort lists
                const sortByDate = (list) => list.sort((a, b) => (b.date || 0) - (a.date || 0));
                const sortByModule = (list) => list.sort((a, b) => a.module.localeCompare(b.module, undefined, { numeric: true, sensitivity: 'base' }));
                
                Object.values(ctpGrouped).forEach(sortByModule);
                Object.values(ctsGrouped).forEach(sortByModule);
                Object.values(waterborneGrouped).forEach(sortByDate);
                sortByDate(otherList);

                return { 
                    ctp: ctpGrouped, 
                    cts: ctsGrouped, 
                    waterborne: waterborneGrouped, 
                    other: otherList, 
                    ctpKeys: window.SCC_RANK_ORDER.filter(r => ctpGrouped[r] && ctpGrouped[r].length > 0), 
                    ctsKeys: window.RMC_RANK_ORDER.filter(r => ctsGrouped[r] && ctsGrouped[r].length > 0), 
                    wbKeys: WB_ORDER.filter(k => waterborneGrouped[k] && waterborneGrouped[k].length > 0) 
                };
            }, [qualsData, selectedCadetPNum, selectedCadet]);


            if (seniorCadets.length === 0) {
                return (
                    <div className="p-8 text-center">
                        <div className="bg-white rounded-lg shadow p-8">
                            <Icon name="Users" className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                            <h2 className="text-2xl font-bold text-slate-700 mb-2">No Senior Cadets Found</h2>
                            <p className="text-slate-600">All cadets in your data are under 12 years old (juniors).</p>
                            <p className="text-sm text-slate-500 mt-4">Use the Junior Focus page to view junior cadets.</p>
                        </div>
                    </div>
                );
            }

            if (!selectedCadet) return <div className="p-8 text-center text-slate-500">Please load data and select a cadet.</div>;

            return (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Icon name="User" className="w-6 h-6 text-blue-600"/> Cadet Focus</h2>
                                <p className="text-sm text-slate-500">Detailed view of achievements and awards.</p>
                            </div>
                            <div className="w-full md:w-64">
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Cadet</label>
                                <select className="w-full p-2 border border-slate-300 rounded-md text-sm" value={selectedCadetPNum || ""} onChange={(e) => setSelectedCadetPNum(e.target.value)}>
                                    {sortedPersonnel.map(p => <option key={p.pNumber} value={p.pNumber}>{p.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className={`p-4 rounded border ${cadetAgeClass ? cadetAgeClass : 'bg-slate-50'}`}>
                                <p className="text-xs text-slate-400 font-bold">Name & Age</p>
                                <p className="font-bold text-slate-700">{selectedCadet.name}</p>
                                <p className="text-sm text-slate-500">{cadetAge} years old</p>
                                <p className="text-xs text-slate-400 mt-2 font-mono bg-slate-100 inline-block px-1 rounded">{selectedCadet.pNumber}</p>
                            </div>
                            
                            <div className="bg-slate-50 p-4 rounded border">
                                <p className="text-xs text-slate-400 font-bold mb-2">Rank</p>
                                <div className="flex items-center gap-3">
                                    {rankImages ? (
                                        <>
                                            {rankImages?.sleeve && <img src={`media/${rankImages.sleeve}`} className="h-12 w-auto object-contain shadow-sm" alt="Sleeve Rank" title="Sleeve Badge" onError={(e) => e.target.style.display = 'none'} />}
                                            {rankImages?.slide && <img src={`media/${rankImages.slide}`} className="h-12 w-auto object-contain shadow-sm" alt="Shoulder Slide" title="Shoulder Slide" onError={(e) => e.target.style.display = 'none'} />}
                                        </>
                                    ) : (
                                        <div className="h-12 w-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
                                            <Icon name="Shield" className="w-6 h-6"/>
                                        </div>
                                    )}
                                    <p className="font-bold text-slate-700 text-lg ml-2 leading-tight">{selectedCadet.rank}</p>
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 p-4 rounded border">
                                <p className="text-xs text-slate-400 font-bold mb-2">Good Conduct Badge</p>
                                <div className="flex items-center gap-3">
                                    {gcbInfo && gcbInfo.img ? (
                                        <img src={`media/${gcbInfo.img}`} className="h-12 w-auto object-contain shadow-sm" alt={gcbInfo.text} title={gcbInfo.text} />
                                    ) : (
                                        <div className="h-12 w-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
                                            <Icon name="Star" className="w-6 h-6"/>
                                        </div>
                                    )}
                                    <p className="font-bold text-slate-700">{gcbInfo?.text || "None"}</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded border">
                                <p className="text-xs text-slate-400 font-bold mb-2">Appointment</p>
                                <div className="flex items-center gap-3">
                                    {appointmentInfo ? (
                                        <>
                                            <img src={`media/${appointmentInfo.img}`} className="h-12 w-auto object-contain shadow-sm" alt={appointmentInfo.text} title={appointmentInfo.text} />
                                            <p className="font-bold text-slate-700 text-sm leading-tight">{appointmentInfo.text}</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="h-12 w-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
                                                <Icon name="Award" className="w-6 h-6"/>
                                            </div>
                                            <p className="text-sm text-slate-400 italic">None held</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-6 mb-6">
                            <div className="flex-auto max-w-full">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Icon name="Shield" className="w-5 h-5 text-indigo-500"/> Specialisations</h3>
                                
                                <div className="flex gap-4 overflow-x-auto pb-4">
                                    {cadetSpecs.map((spec, idx) => (
                                        <div key={idx} className="flex-shrink-0 flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-lg p-3 min-w-[120px] text-center">
                                            <div className="h-24 flex items-center justify-center mb-2">
                                                     <BadgeImage name={spec.key} className="h-24 w-auto object-contain" fallbackIcon="Award"/>
                                            </div>
                                            <p className="text-xs font-bold text-slate-700 leading-tight">{spec.name}</p>
                                            <p className="text-[10px] text-slate-500 mt-1">{window.formatDate(spec.date)}</p>
                                        </div>
                                    ))}
                                    {cadetSpecs.length === 0 && <div className="w-full text-center py-4 text-slate-400 italic bg-slate-50 rounded border border-dashed">No specialisations found for this cadet.</div>}
                                </div>
                            </div>

                            <div className="flex-auto max-w-full">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Icon name="Target" className="w-5 h-5 text-green-600"/> Proficiencies</h3>
                                
                                <div className="flex gap-4 overflow-x-auto pb-4">
                                    {cadetProfs.map((prof, idx) => (
                                        <div key={idx} className="flex-shrink-0 flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-lg p-3 min-w-[120px] text-center">
                                            <div className="h-24 flex items-center justify-center mb-2">
                                                     <BadgeImage name={prof.key} className="h-24 w-auto object-contain" fallbackIcon="Award"/>
                                            </div>
                                            <p className="text-xs font-bold text-slate-700 leading-tight">{prof.name}</p>
                                            <p className="text-[10px] text-slate-500 mt-1">{window.formatDate(prof.date)}</p>
                                        </div>
                                    ))}
                                    {cadetProfs.length === 0 && <div className="w-full text-center py-4 text-slate-400 italic bg-slate-50 rounded border border-dashed">No proficiencies found for this cadet.</div>}
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Icon name="Anchor" className="w-5 h-5 text-blue-600"/> Waterborne Proficiencies</h3>
                            
                            <div className="flex gap-4 overflow-x-auto pb-4">
                                {cadetWaterborne.map((wb, idx) => (
                                    <div key={idx} className="flex-shrink-0 flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-lg p-3 min-w-[120px] text-center">
                                                <div className="h-24 flex items-center justify-center mb-2">
                                                    <BadgeImage name={wb.key} className="h-24 w-auto object-contain" fallbackIcon="Award"/>
                                                </div>
                                                <p className="text-xs font-bold text-slate-700 leading-tight">{wb.name}</p>
                                                <p className="text-[10px] text-slate-500 mt-1">{window.formatDate(wb.date)}</p>
                                    </div>
                                ))}
                                {cadetWaterborne.length === 0 && <div className="w-full text-center py-4 text-slate-400 italic bg-slate-50 rounded border border-dashed">No waterborne proficiencies found for this cadet.</div>}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Icon name="BookOpen" className="w-5 h-5 text-slate-500"/> Other Qualifications / Record</h3>
                            
                            <div className="space-y-6">
                                {cadetRecordGroups.ctpKeys.length > 0 && (
                                    <div className="border rounded-lg overflow-hidden shadow-sm">
                                        <div className="bg-indigo-50 px-4 py-2 border-b border-indigo-100"><h4 className="font-bold text-indigo-800 text-sm">SCC CTP Modules</h4></div>
                                        {cadetRecordGroups.ctpKeys.map(rank => (
                                            <div key={rank}>
                                                <div className="px-4 py-1.5 bg-indigo-50/30 text-xs font-bold text-indigo-900 border-b border-indigo-50/50 uppercase tracking-wide">{rank}</div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-3 bg-white border-b border-slate-100 last:border-0">
                                                    {cadetRecordGroups.ctp[rank].map((q, i) => (
                                                        <div key={i} className="flex items-center gap-2 text-xs p-1 hover:bg-slate-50 rounded">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0"></span>
                                                            <span className="truncate flex-1 font-medium text-slate-700" title={q.module}>{q.module}</span>
                                                            <span className="text-slate-400 text-[10px]">{window.formatDate(q.date)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {cadetRecordGroups.ctsKeys.length > 0 && (
                                    <div className="border rounded-lg overflow-hidden shadow-sm">
                                        <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100"><h4 className="font-bold text-emerald-800 text-sm">RMC CTS Modules</h4></div>
                                        {cadetRecordGroups.ctsKeys.map(rank => (
                                            <div key={rank}>
                                                <div className="px-4 py-1.5 bg-emerald-50/30 text-xs font-bold text-emerald-900 border-b border-emerald-50/50 uppercase tracking-wide">{rank}</div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-3 bg-white border-b border-slate-100 last:border-0">
                                                    {cadetRecordGroups.cts[rank].map((q, i) => (
                                                        <div key={i} className="flex items-center gap-2 text-xs p-1 hover:bg-slate-50 rounded">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
                                                            <span className="truncate flex-1 font-medium text-slate-700" title={q.module}>{q.module}</span>
                                                            <span className="text-slate-400 text-[10px]">{window.formatDate(q.date)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {cadetRecordGroups.wbKeys.length > 0 && (
                                    <div className="border rounded-lg overflow-hidden shadow-sm">
                                        <div className="bg-sky-50 px-4 py-2 border-b border-sky-100"><h4 className="font-bold text-sky-800 text-sm">Waterborne Qualifications</h4></div>
                                        {cadetRecordGroups.wbKeys.map(disc => (
                                            <div key={disc}>
                                                <div className="px-4 py-1.5 bg-sky-50/30 text-xs font-bold text-sky-900 border-b border-sky-50/50 uppercase tracking-wide">{disc}</div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-3 bg-white border-b border-slate-100 last:border-0">
                                                    {cadetRecordGroups.waterborne[disc].map((q, i) => (
                                                        <div key={i} className="flex items-center gap-2 text-xs p-1 hover:bg-slate-50 rounded">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0"></span>
                                                            <span className="truncate flex-1 font-medium text-slate-700" title={q.module}>{q.module}</span>
                                                            <span className="text-slate-400 text-[10px]">{window.formatDate(q.date)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {cadetRecordGroups.other.length > 0 && (
                                    <div className="border rounded-lg overflow-hidden shadow-sm">
                                        <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                                            <h4 className="font-bold text-slate-700 text-sm">Other Awards</h4>
                                            <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{cadetRecordGroups.other.length} records</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-3 bg-white">
                                            {cadetRecordGroups.other.map((q, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs p-1 hover:bg-slate-50 rounded">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0"></span>
                                                    <span className="truncate flex-1 font-medium text-slate-700" title={q.module}>{q.module}</span>
                                                    <span className="text-slate-400 text-[10px]">{window.formatDate(q.date)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        };


console.log("✓ Cadet focus module loaded");
