import React, { useState, useEffect, useMemo, useCallback, Component } from 'react'
import jsPDF from 'jspdf'
import * as LucideIcons from 'lucide-react'

// Icon wrapper component that works with lucide-react
const Icon = ({ name, className }) => {
    const LucideIcon = LucideIcons[name]
    if (!LucideIcon) return null
    return <LucideIcon className={className} />
}

        
        // ============================================================================
        // SECTION 1: CONSTANTS & DATA
        // ============================================================================
        
        // --- 1.1 VERSION ---
        const DATA_VERSION = "1.0-RC2.68e"; // FEATURE: JSC STEM Award now shown in Junior Proficiencies box 

        // --- 1.2 BADGE & RANK IMAGE MAPS ---
        const RANK_IMG_MAP = {
            "Petty Officer Cadet": { sleeve: "scc_cadet_sleeve_petty_officer.webp", slide: "scc_cadet_shoulder_petty_officer.webp" },
            "Leading Cadet": { sleeve: "scc_cadet_sleeve_leading_cadet.webp", slide: "scc_cadet_shoulder_leading_cadet.webp" },
            "Able Cadet": { sleeve: "scc_cadet_sleeve_able_cadet.webp", slide: "scc_cadet_shoulder_able_cadet.webp" },
            "Ordinary Cadet": { sleeve: "scc_cadet_sleeve_ordinary_cadet.webp", slide: "scc_cadet_shoulder_ordinary_cadet.webp" },
            "Cadet 1st Class": { sleeve: "scc_cadet_sleeve_1st_class.webp", slide: "scc_cadet_shoulder_1st_class.webp" },
            "Cadet": { sleeve: "scc_cadet_sleeve_cadet.webp", slide: "scc_cadet_shoulder_cadet.webp" },
            "Cadet Sergeant": { sleeve: "rmc_rank_sergeant.webp", slide: "rmc_slide_cadet_sergeant.webp" },
            "Cadet Corporal": { sleeve: "rmc_rank_corporal.webp", slide: "rmc_slide_corporal.webp" },
            "Cadet Lance Corporal": { sleeve: "rmc_rank_lance_corporal.webp", slide: "rmc_slide_lance_corporal.webp" },
            "Marine Cadet": { sleeve: "rmc_rank_marine_cadet.webp", slide: "rmc_slide_marine_cadet.webp" }, 
            "Recruit": null,
            "New Entry Cadet": null,
            "Leading Junior Cadet": { sleeve: "scc_junior_leading.webp" },
            "Able Junior Cadet": { sleeve: "scc_junior_star.webp", count: 2 },
            "Junior Cadet 1st Class": { sleeve: "scc_junior_star.webp" },
            "Junior Cadet": { sleeve: "scc_junior_cadet.webp" }
        };

        const BADGE_MAP = {
            "Drill - Advanced": "scc_prof_drill_advanced.webp",
            "Drill - Intermediate": "scc_prof_drill_intermediate.webp",
            "Drill - Basic": "scc_prof_drill_basic.webp",
            "Seamanship - Advanced": "scc_prof_seamanship_advanced.webp",
            "Seamanship - Intermediate": "scc_prof_seamanship_intermediate.webp",
            "Seamanship - Basic": "scc_prof_seamanship_basic.webp",
            "First Aid - Advanced": "scc_prof_first_aid_advanced.webp",
            "First Aid - Intermediate": "scc_prof_first_aid_intermediate.webp",
            "First Aid - Basic": "scc_prof_first_aid_basic.webp",
            "Marine Engineering - Advanced": "scc_prof_marine_eng_advanced.webp",
            "Marine Engineering Mechanical - Advanced": "scc_prof_me_mechanical_advanced.webp",
            "Marine Engineering Electrical - Advanced": "scc_prof_me_electrical_advanced.webp",
            "Marine Engineering - Intermediate": "scc_prof_marine_eng_intermediate.webp",
            "Marine Engineering - Basic": "scc_prof_marine_eng_basic.webp",
            "Navigation - Cadet Instructor": "scc_prof_navigation_instructor.webp",
            "Navigation - Advanced": "scc_prof_navigation_advanced.webp",
            "Navigation - Intermediate": "scc_prof_navigation_intermediate.webp",
            "Navigation - Basic": "scc_prof_navigation_basic.webp",
            "CIS Info Sys - Advanced": "scc_prof_cis_infosys_advanced.webp",
            "CIS Info Sys - Intermediate": "scc_prof_cis_infosys_intermediate.webp",
            "CIS Info Sys - Basic": "scc_prof_cis_infosys_basic.webp",
            "CIS Radio - Advanced": "scc_prof_cis_radio_advanced.webp",
            "CIS Radio - Intermediate": "scc_prof_cis_radio_intermediate.webp",
            "CIS Radio - Basic": "scc_prof_cis_infosys_basic.webp", 
            "CIS Principle Instructor": "scc_prof_cis_principle_instructor.webp",
            "Catering - Advanced": "scc_prof_catering_advanced.webp",
            "Catering - Intermediate": "scc_prof_catering_intermediate.webp",
            "Catering - Basic": "scc_prof_catering_basic.webp",
            "Stewarding - Advanced": "scc_prof_stewarding_advanced.webp",
            "Stewarding - Basic": "scc_prof_stewarding_basic.webp",
            "Physical Training - Instructor": "scc_prof_pt_instructor.webp",
            "Physical Training - Advanced": "scc_prof_pt_advanced.webp",
            "Physical Training - Intermediate": "scc_prof_pt_intermediate.webp",
            "Physical Training - Basic": "scc_prof_pt_basic.webp",
            "Rowing Instructor": "scc_prof_rowing_instructor.webp",
            "Rowing Coxswain": "scc_prof_rowing_coxswain.webp",
            "Rowing Supervised Coxswain": "scc_prof_rowing_supervised_cox.webp",
            "Rowing Competent Crew": "scc_prof_rowing_competent_crew.webp",
            "Powerboat Instructor": "scc_prof_powerboat_instructor.webp",
            "RYA Powerboat Intermediate": "scc_prof_powerboat_intermediate.webp",
            "RYA Safety Boat": "scc_prof_powerboat_safety.webp",
            "RYA Powerboat Level 2": "scc_prof_powerboat_level2.webp",
            "RYA Powerboat Level 1": "scc_prof_powerboat_level1.webp",
            "Paddlesport Instructor": "scc_prof_paddlesport_instructor.webp",
            "Paddle Discipline Specific": "scc_prof_paddle_specific.webp",
            "Paddle FSRT/PSRC": "scc_prof_paddle_fsrt.webp",
            "Paddle Explore Award": "scc_prof_paddle_explore.webp",
            "Paddle Discover Award": "scc_prof_paddle_discover.webp",
            "Dinghy Instructor": "scc_prof_sailing_dinghy_instructor.webp",
            "Spinnaker/Seamanship": "scc_prof_sailing_spinnaker.webp",
            "Sailing with Spinnakers": "scc_prof_sailing_spinnaker.webp",
            "Seamanship Skills": "scc_prof_sailing_spinnaker.webp",
            "Start Racing": "scc_prof_sailing_spinnaker.webp",
            "Performance Sailing": "scc_prof_sailing_spinnaker.webp",
            "Day Sailing": "scc_prof_sailing_spinnaker.webp",
            "Sailing Stage 4 / Level 3": "scc_prof_sailing_stage4.webp",
            "Sailing Stage 3 / Level 2": "scc_prof_sailing_stage3.webp",
            "Sailing Stage 2 / Level 1": "scc_prof_sailing_stage2.webp",
            "Windsurfing Instructor": "scc_prof_windsurfing_instructor.webp",
            "Windsurfing Stage 4": "scc_prof_windsurfing_stage4.webp",
            "Windsurfing Stage 3": "scc_prof_windsurfing_stage3.webp",
            "Windsurfing Stage 2": "scc_prof_windsurfing_stage2.webp",
            "Windsurfing Stage 1": "scc_prof_windsurfing_stage1.webp",
            "Master Coxswain": "scc_prof_master_coxswain.webp",
            "Cadet Coxswain": "scc_prof_cadet_coxswain.webp",
            "Offshore Power Watch Leader": "scc_prof_offshore_power_watch_leader.webp",
            "Offshore Power Seaman": "scc_prof_offshore_power_seaman.webp",
            "Offshore Power Grade 2": "scc_prof_offshore_power_grade2.webp",
            "Offshore Power Grade 1": "scc_prof_offshore_power_grade1.webp",
            "Offshore Sailing Watch Leader": "scc_prof_offshore_sailing_watch_leader.webp",
            "Offshore Sailing Seaman": "scc_prof_offshore_sailing_seaman.webp",
            "Offshore Sailing Grade 2": "scc_prof_offshore_sailing_grade2.webp",
            "Offshore Sailing Grade 1": "scc_prof_offshore_sailing_grade1.webp",
            "Campcraft (Advanced)": "scc_prof_campcraft_advanced.webp",
            "Campcraft (Intermediate)": "scc_prof_campcraft_intermediate.webp",
            "Campcraft (Basic)": "scc_prof_campcraft_basic.webp",
            "Climbing (Advanced)": "scc_prof_climbing_advanced.webp",
            "Climbing (Intermediate)": "scc_prof_climbing_intermediate.webp",
            "Climbing (Basic)": "scc_prof_climbing_basic.webp",
            "Mountain Biking (Advanced)": "scc_prof_mountain_biking_advanced.webp",
            "Mountain Biking (Intermediate)": "scc_prof_mountain_biking_intermediate.webp",
            "Mountain Biking (Basic)": "scc_prof_mountain_biking_basic.webp",
            "Semaphore": "scc_prof_semaphore.webp",
            "Radio Amateur": "scc_prof_radio_amateur.webp",
            "Morse Code": "scc_prof_morse.webp",
            "Meteorology": "scc_prof_meteorology.webp",
            "Air Rifle Marksman": "scc_prof_shooting_air_marksman.webp",
            "Air Rifle Advanced": "scc_prof_shooting_air_advanced.webp",
            "Air Rifle Basic": "scc_prof_shooting_air_basic.webp",
            "Small Bore Marksman": "scc_prof_shooting_smallbore_marksman.webp",
            "Small Bore Advanced": "scc_prof_shooting_smallbore_advanced.webp",
            "Small Bore Basic": "scc_prof_shooting_smallbore_basic.webp",
            "Full Bore Marksman": "scc_prof_shooting_fullbore_marksman.webp",
            "Full Bore Advanced": "scc_prof_shooting_fullbore_advanced.webp",
            "Full Bore Basic": "scc_prof_shooting_fullbore_basic.webp",
            "Bugler": "scc_prof_bugler.webp",
            "Musician": "scc_prof_musician.webp",
            "Drummer": "scc_prof_drummer.webp",
            "Diving (Cadet)": "scc_prof_diving.webp",
            "Piping Proficiency": "scc_prof_piping_proficiency.webp",
            "Piping Basic": "scc_prof_piping_basic.webp",
            "Wings (Standard)": "scc_award_wings_standard.png",
            "Gold Wings": "scc_award_wings_gold.png",
            "Silver Wings": "scc_award_wings_silver.png",
            "Bronze Wings": "scc_award_wings_bronze.png",
            "First Sea Lord's Cadet": "scc_award_first_sea_lords_cadet.webp",
            "Lord Lieutenant's Cadet": "scc_award_lord_lieutenants_cadet.webp",
            "Lord Mayor's Cadet": "scc_award_lord_mayors_cadet.webp",
            "Swim Test": "scc_swim.webp",
            "No Swim Test": "scc_NO_SWIM.webp",
            "Canada Trophy": "scc_award_canada_trophy.webp",
            "Commodore's Broad Pennant": "scc_award_commodores_pennant.webp",
            "DofE Gold": "scc_award_dofe_gold.webp",
            "DofE Silver": "scc_award_dofe_silver.webp",
            "DofE Bronze": "scc_award_dofe_bronze.webp",
            "BTEC Level 1": "scc_award_btec1.webp",
            "BTEC Level 2": "scc_award_btec2.webp",
            "Aviation Gold Wings": "scc_award_wings_gold.webp",
            "Aviation Silver Wings": "scc_award_wings_silver.webp",
            "Aviation Bronze Wings": "scc_award_wings_bronze.webp",
            "Aviation Wings (Standard)": "scc_award_wings_standard.webp",
            "SCC - JSC Red Unit Activities Badge": "scc_junior_section_red.webp",
            "SCC - JSC Blue Waterborne Activities Badge": "scc_junior_section_blue.webp",
            "SCC - JSC Green Outdoor & Recreation Activities Badge": "scc_junior_section_green.webp",
            "SCC - JSC Yellow Community & Citizenship Activities Badge": "scc_junior_section_yellow.webp",
            "SCC - JSC STEM Unit Activities Badge": "scc_junior_stem.webp",
            "SCC - JSC Commodores Broad Pennant": "scc_award_commodores_pennant.webp"
        };
        
        const Icons = {
            Upload: lucide.icons.Upload,
            Users: lucide.icons.Users,
            Award: lucide.icons.Award,
            BookOpen: lucide.icons.BookOpen,
            CheckCircle: lucide.icons.CheckCircle,
            FileText: lucide.icons.FileText,
            ChevronDown: lucide.icons.ChevronDown,
            ChevronUp: lucide.icons.ChevronUp,
            ChevronLeft: lucide.icons.ChevronLeft,
            ChevronRight: lucide.icons.ChevronRight,
            Calendar: lucide.icons.Calendar,
            Save: lucide.icons.Save,
            Trash2: lucide.icons.Trash2,
            RefreshCw: lucide.icons.RefreshCw,
            X: lucide.icons.X,
            AlertCircle: lucide.icons.AlertCircle,
            Anchor: lucide.icons.Anchor,
            Shield: lucide.icons.Shield,
            ShieldAlert: lucide.icons.ShieldAlert,
            Target: lucide.icons.Target,
            Lightbulb: lucide.icons.Lightbulb,
            User: lucide.icons.User,
            Star: lucide.icons.Star,
            Command: lucide.icons.Command,
            ShipWheel: lucide.icons.ShipWheel,
            ChartGantt: lucide.icons.ChartGantt,
            Database: lucide.icons.Database,
            Download: lucide.icons.Download,
            Settings: lucide.icons.Settings,
            BarChart3: lucide.icons.BarChart3,
            Home: lucide.icons.Home
        };

        // ============================================================================
        // --- 1.3 SYLLABUS DATA (SCC CTP & RMC CTS) ---
        // ============================================================================

        const SCC_SYLLABUS = {
            "New Entry Cadet": { 
                "Core": [ 
                    { code: "NE01", title: "Unit Introduction" }, 
                    { code: "NE02", title: "General Sea Cadets Terms" }, 
                    { code: "NE03", title: "Sea Cadet Promise and Values" }, 
                    { code: "NE04", title: "Ranks, Rates and Promotion" }, 
                    { code: "NE05", title: "Introduction to Cadet Wellbeing" }, 
                    { code: "NE06", title: "Introduction to Expedition Skill: Weather" }, 
                    { code: "NE07", title: "Sea Cadet Water Safety Test" }, 
                    { code: "NE08", title: "Introduction to Bends and Hitches" }, 
                    { code: "NE09", title: "Introduction to Foot Drill" }, 
                    { code: "NE10", title: "History of your Uniform" }, 
                    { code: "NE11", title: "Uniform, Boot and Shoe Care" }, 
                    { code: "NE12", title: "Basic Saluting and Compliments" }, 
                    { code: "NE13", title: "Introduction to Marching, Halting and Falling in and Out of a Squad" }, 
                    { code: "NE14", title: "SHOUT (Introduction to the Safeguarding Pocket Guide)" }, 
                    { code: "NE15", title: "Intro to Sea Cadet Portal, Opportunities, Specialisations and Proficiencies" }, 
                    { code: "NE16", title: "Cadet Action Plan" } 
                ] 
            },
            "Cadet": { 
                "Core CTP": [ 
                    { code: "CAV01", title: "Intro to Cadet Voice" }, 
                    { code: "CK01", title: "Sea Cadets and Unit History" }, 
                    { code: "CK02", title: "Royal Navy and Royal Marines Ranks and Rates" }, 
                    { code: "CK03", title: "Unit Duties and Ship's Routine" }, 
                    { code: "CK04", title: "Today's Naval Terms and Customs" }, 
                    { code: "CK05", title: "Types of Ship" }, 
                    { code: "CK06", title: "Phonetic Alphabet" }, 
                    { code: "CK07", title: "Introduction to the Duke of Edinburgh's Award" }, 
                    { code: "CK08", title: "Introduction to Specialisations and Proficiencies" }, 
                    { code: "CV01", title: "Commitment" }, 
                    { code: "CWB01", title: "Cadet Wellbeing: Stress" },
                ],
                "Drill": [ 
                    { code: "DR01", title: "Revision of Basic Drill" }, 
                    { code: "DR02", title: "Marching Theory" }, 
                    { code: "DR03", title: "Marching Practice" }, 
                    { code: "DR04", title: "Squad Theory" } 
                ], 
                "Expedition": [ 
                    { code: "ES01", title: "Environment and Countryside Code" }, 
                    { code: "ES02", title: "Suitable Clothing and Equipment" }, 
                    { code: "ES03", title: "Kit Packing and Carrying" }, 
                    { code: "ES04", title: "Conventional Signs" } 
                ], 
                "First Aid": [ 
                    { code: "FA01", title: "Introduction to Basic First Aid: Coping in an Emergency" }, 
                    { code: "FA02", title: "Communication and Casualty Care" }, 
                    { code: "FA03", title: "Primary Survey and Recovery 1" }, 
                    { code: "FA04", title: "Primary Survey and Recovery 2" }, 
                    { code: "FA05", title: "Minor Bleeding" }, 
                    { code: "FA06", title: "Bleeding Shock 1" }, 
                    { code: "FA07", "title": "Bleeding Shock 2" }, 
                    { code: "FA08", title: "Bites, Stings and Foreign Objects" }, 
                    { code: "FA09", title: "Choking" }, 
                    { code: "FA10", title: "Chest Pains" }, 
                    { code: "FA11", title: "Resuscitation 1" }, 
                    { code: "FA12", title: "Resuscitation 2" } 
                ], 
                "Health & Safety": [{ code: "HS01", title: "Health and Safety Signage" }], 
                "Meteorology": [ 
                    { code: "MT01", title: "Introduction to Meteorology: Why Weather?" }, 
                    { code: "MT02", title: "Getting the Measure of Things: Measuring Instruments" }, 
                    { code: "MT03", title: "Make your own Weather Instruments" } 
                ], 
                "Navigation": [
                    { code: "NAV01", title: "Basic Collision Regulations: Rules of the Road 1" },
                    { code: "NAV02", title: "Charts: How do you make a round thing square?" },
                    { code: "NAV03", title: "Introduction to Tides" }
                ],
                "Piping": [{ code: "PIP01", title: "Introduction to the Boatswain's Call" }], 
                "Recreational": [ 
                    { code: "RA01", title: "Recreational Activity 1" }, 
                    { code: "RA02", title: "Recreational Activity 2" }, 
                    { code: "RA03", title: "Recreational Activity 3" }, 
                    { code: "RA04", title: "Recreational Activity 4" }, 
                    { code: "RA05", title: "Recreational Activity 5" } 
                ], 
                "Seamanship": [ 
                    { code: "SM01", title: "General Sea Terms and Parts of a Ship" }, 
                    { code: "SM02", title: "Essential Bends and Hitches" }, 
                    { code: "SM03", title: "Introduction to Safe Handling of Ropes" }, 
                    { code: "SM04", title: "Bowline, Clove Hitch and Sheet Bend" } 
                ], 
                "Waterborne": [ 
                    { code: "WB01", title: "Waterborne Activity 1" }, 
                    { code: "WB02", title: "Practical Waterborne 2" }, 
                    { code: "WB03", title: "Practical Waterborne 3" }, 
                    { code: "WB04", "title": "Practical Waterborne 4" } 
                ] 
            }
            ,
            "Cadet 1st Class": { 
                "Core CTP": [
                    { code: "CA02", title: "Community Activities" },
                    { code: "CAV02", title: "Cadet Voice: Prioritisation and District Meetings" },
                    { code: "CK09", "title": "Royal Navy History" }, 
                    { code: "CK10", "title": "Times, Watches and Bells" }, 
                    { code: "CK11", "title": "Practical Piping: Unit Ceremonial" }, 
                    { code: "CK12", "title": "Ranks and Rates of RAF and Army" },
                    { code: "CV02", "title": "Self Discipline and Honesty and Integrity" }, 
                    { code: "CV03", "title": "Cadet Development Evening" },
                    { code: "CWB02", title: "Healthy Habits" }
                ], 
                "Drill": [ 
                    { code: "DR05", "title": "Squad Drill: Direction and Speed Changes" }, 
                    { code: "DR06", "title": "Squad Drill: Formation Changes" }, 
                    { code: "DR07", "title": "Introduction to Parade Drill" } 
                ], 
                "Expedition": [ 
                    { code: "ES05", "title": "Introduction to Mapwork: Grid References" }, 
                    { code: "ES06", "title": "Introduction to Mapwork: Measuring Distance" }, 
                    { code: "ES07", "title": "Contours and Reliefs" }, 
                    { code: "ES08", "title": "Compass and Bearings" } 
                ],
                "First Aid": [ 
                    { code: "FA13", title: "Introduction to Intermediate First Aid: First Aid Kits" }, 
                    { code: "FA14", title: "Asthma and Low Blood Sugar" }, 
                    { code: "FA15", title: "Electric Shock, Burns and Scalds" }, 
                    { code: "FA16", title: "Fainting and Seizures" }, 
                    { code: "FA17", title: "Poisons and Severe Allergic Reaction" }, 
                    { code: "FA18", title: "Hypothermia and Heat Exhaustion" }, 
                    { code: "FA19", title: "Bone, Muscle and Joint Injuries" }, 
                    { code: "FA20", title: "Head Injuries" }, 
                    { code: "FA21", title: "Spinal Injury" }, 
                    { code: "FA22", title: "Revision - Bleeding (Severe) and Shock" }, 
                    { code: "FA23", title: "Revision-Primary survey & Recovery position" }, 
                    { code: "FA24", title: "Revision-Resuscitation (Adult CPR)" }, 
                    { code: "FA25", title: "Formal Assessment - part 1" }, 
                    { code: "FA26", title: "Formal Assessment-part 2" } 
                ], 
                "Health & Safety": [{ code: "HS02", title: "Unit Health and Safety Check" }], 
                "Leadership": [ 
                    { code: "LT01", title: "What Does Good Teamwork Look Like?" }, 
                    { code: "LT02", title: "Practical Teamwork Tasks: Inital Attempt" }, 
                    { code: "LT03", title: "Practical Leadership Task: Lessons Learnt" } 
                ], 
                "Meteorology": [ 
                    { code: "MT04", title: "Cloud Watching - Introduction to Clouds" }, 
                    { code: "MT05", title: "Highs, Lows and Charts" }, 
                    { code: "MT06", title: "A Gentle Breeze or a Destructive Force" } 
                ], 
                "Piping": [{ code: "PIP02", title: "Unit Calls" }], 
                "Recreational": [ 
                    { code: "RA06", title: "Recreational Activity 6" }, 
                    { code: "RA07", title: "Recreational Activity 7" }, 
                    { code: "RA08", title: "Recreational Activity 8" }, 
                    { code: "RA09", title: "Recreational Activity 9" } 
                ], 
                "Seamanship": [ 
                    { code: "SM05", title: "Cadet Review and Types of Rope" }, 
                    { code: "SM06", title: "Fisherman's Bend and Timber Hitch, Double Sheet Bend and Rolling Hitches" }, 
                    { code: "SM07", title: "Introduction to Blocks and Tackles" }, 
                    { code: "SM08", title: "Heaving Lines" }, 
                    { code: "SM09", title: "Cadet First Class Consolidation Session" } 
                ], 
                "Waterborne": [ 
                    { code: "WB05", title: "Practical Waterborne 5" }, 
                    { code: "WB06", title: "Practical Waterborne 6" }, 
                    { code: "WB07", title: "Practical Waterborne 7" } 
                ] 
            }
            ,
            "Ordinary Cadet": { 
                "Core CTP": [
                    { code: "CA03", title: "Community Activity 3" },
                    { code: "CAV03", title: "Cadet Voice and Unit Management Team" },
                    { code: "CK13", title: "Maritime Careers" }, 
                    { code: "CK14", title: "Vocational Qualifications" }, 
                    { code: "CK15", title: "Naval Battles: Research Project" }, 
                    { code: "CK16", title: "Naval Battles: Show and Tell" },
                    { code: "CV04", title: "Loyalty, Respect and Courage" }, 
                    { code: "CV05", title: "Cadet Development Session" },
                    { code: "CWB03", title: "Wellbeing and Communication" }
                ],
                "Drill": [ 
                    { code: "DR08", title: "Fitting, Wearing and Cleaning White-Webbing" }, 
                    { code: "DR09", title: "Safety and Familiarisation" }, 
                    { code: "DR10", title: "Rifle Drill: Guard" }, 
                    { code: "DR11", title: "Rifle Drill: Ceremonial" }, 
                    { code: "DR12", title: "Drill Revision" } 
                ], 
                "Expedition": [ 
                    { code: "ES09", title: "Tent and Campsite Selection" }, 
                    { code: "ES10", title: "Food and Cooking" }, 
                    { code: "ES11", title: "Emergency Action Plan" }, 
                    { code: "ES12", title: "Route Planning" } 
                ], 
                "Health & Safety": [{ code: "HS03", title: "Fire Prevention" }], 
                "Leadership": [ 
                    { code: "LT04", title: "Leadership Styles" }, 
                    { code: "LT05", title: "Leadership Project Planning" }, 
                    { code: "LT06", title: "Leadership Project Delivery and Reflection" } 
                ], 
                "Meteorology": [ 
                    { code: "MT07", title: "Local Winds (Meteorology in Context)" }, 
                    { code: "MT08", title: "Warm Fronts and Cold Fronts" }, 
                    { code: "MT09", title: "The Shipping Forecast" }, 
                    { code: "MT10", title: "On the Lookout: Weather Observations" } 
                ], 
                "Recreational": [ 
                    { code: "RA10", title: "Recreational Activity 1" }, 
                    { code: "RA11", title: "Recreational Activity 2" }, 
                    { code: "RA12", title: "Recreational Activity 3" }, 
                    { code: "RA13", title: "Recreational Activity 4" } 
                ], 
                "Seamanship": [ 
                    { code: "SM10", "title": "Parts of a Tackle and Rigging" }, 
                    { code: "SM11", "title": "Handling of Ropes" }, 
                    { code: "SM12", "title": "Consolidation Session" } 
                ], 
                "Waterborne": [ 
                    { code: "WB08", title: "Waterborne Activity 8" }, 
                    { code: "WB09", title: "Waterborne Activity 9" }, 
                    { code: "WB10", title: "Waterborne Activity 10" }, 
                    { code: "WB11", title: "Waterborne Activity 11" } 
                ] 
            }
            ,
            "Able Cadet": { 
                "Peer Educator": [ 
                    { code: "BP01", title: "What is a Peer Educator?" }, 
                    { code: "BP02", title: "Roles and Responsibilities of a Peer Educator" }, 
                    { code: "BP03", title: "Learning Styles" }, 
                    { code: "BP04", title: "Skills of an Instructor" }, 
                    { code: "BP05", title: "Session Planning" }, 
                    { code: "BP06", title: "Giving and Receiving Feedback" }, 
                    { code: "BP07", title: "Keeping Peers Engaged by Making Learning Fun" }, 
                    { code: "BP08", title: "Using Feedback to Aid Reflection" }, 
                ], 
                "Community": [ 
                    { code: "CA04", title: "Community Activity 4" }, 
                    { code: "CA05", title: "Community Activity 5" } 
                ], 
                "Corps Knowledge": [ 
                    { code: "CK17", title: "My Senior Cadet Pathway" }, 
                    { code: "CK18", "title": "Organisation of the SCC at Area level" }, 
                    { code: "CK19", "title": "Safeguarding as a Senior Cadet" }, 
                    { code: "CK20", "title": "Volunteer for the Day" } 
                ], 
                "Drill": [ 
                    { code: "DR13", "title": "Basic Instruction Theory: CLAP" }, 
                    { code: "DR14", "title": "Basic Instruction Theory: DEIP" }, 
                    { code: "DR15", "title": "Basic Instruction: Delivery" }, 
                    { code: "DR16", "title": "Promotion Board Drill Practice" } 
                ], 
                "Leadership": [ 
                    { code: "LT07", title: "What Makes a Great Leader?" }, 
                    { code: "LT08", title: "Leadership Styles" }, 
                    { code: "LT09", title: "Being a Positive Role Model" }, 
                    { code: "LT10", title: "Facilitating Cadet Discussions" }, 
                    { code: "LT11", title: "Reflection and Self-Development" }, 
                    { code: "LT12", "title": "The Difference between a Leader and a Manager" } 
                ], 
                "Personal Development": [ 
                    { code: "PD01", title: "Demonstrating my Skills: Mock Promotion Board Interview" }, 
                    { code: "PD02", title: "Communication Skills: Written, Email, Phone" }, 
                    { code: "PD03", title: "Presentation and Group Discussion Skills" }
                ], 
                "Waterborne": [ 
                    { code: "WB12", title: "Waterborne Activity 12" }, 
                    { code: "WB13", title: "Waterborne Activity 13" }, 
                    { code: "WB14", title: "Waterborne Activity 14" }, 
                    { code: "WB15", "title": "Waterborne Activity 15" } 
                ] 
            }
            ,
            "Leading Cadet": { 
                "Advanced Peer Educator": [ 
                    { code: "AP01", title: "Roles of the Advanced Peer Educator" }, 
                    { code: "AP02", title: "Communication Skills" }, 
                    { code: "AP03", title: "Team Working and 1-2-1 Skills" }, 
                    { code: "AP04", title: "Motivating and Encouraging Peers" }, 
                    { code: "AP05", title: "Health and Safety in the Classroom" }, 
                    { code: "AP06", title: "Making Learning Inclusive" }, 
                    { code: "AP07", title: "Leadership" }, 
                    { code: "AP08", title: "Using Subject Knowledge" }, 
                    { code: "AP09", title: "What Next and Evaluation" }, 
                    { code: "AP10", title: "Advanced Peer Educator (Development)" }, 
                    { code: "AP11", title: "Advanced Peer Educator (Delivery)" }
                ], 
                "Community": [ 
                    { code: "CA06", title: "Community Activity 1" }, 
                    { code: "CA07", title: "Community Activity 2" }
                ], 
                "Corps Knowledge": [ 
                    { code: "CK21", title: "Supporting a Unit Fundraising Activity" }, 
                    { code: "CK22", title: "Growing My Unit" }, 
                    { code: "CK23", title: "Roles and Responsibilities of a Petty Officer Cadet and Cadet Instructor" }, 
                    { code: "CK24", title: "Organisation of the Sea Cadet Corps at National level" }
                ], 
                "Drill": [ 
                    { code: "DR17", title: "Drill: Instruction Theory" }, 
                    { code: "DR18", title: "Drill: Instruction Delivery" }, 
                    { code: "DR19", title: "Drill: Fault Finding" }, 
                    { code: "DR20", title: "Drill: Final Consolidation" }
                ], 
                "Leadership": [ 
                    { code: "LT13", title: "Active Listening" }, 
                    { code: "LT14", title: "Emotional Intelligence" }, 
                    { code: "LT15", title: "Conflict Resolution" }, 
                    { code: "LT16", title: "Motivating Self and Others" }, 
                    { code: "LT17", title: "How to Plan Effectively" }
                ], 
                "Personal Development": [ 
                    { code: "PD04", title: "CVs and Cover Letters" }, 
                    { code: "PD05", title: "Presenting my Sea Cadet Experience" }, 
                    { code: "PD06", title: "Interview Skills" }
                ], 
                "Waterborne": [ 
                    { code: "WB16", title: "Practical waterborne activity" }, 
                    { code: "WB17", title: "Practical waterborne activity" }, 
                    { code: "WB18", title: "Practical waterborne activity" }, 
                    { code: "WB19", title: "Practical waterborne activity" }
                ] 
            },
            "Petty Officer Cadet": { 
                "Cadet Leadership & Transition": [
                    { code: "POC01", title: "Personal Development Plan" },
                    { code: "POC02", title: "Shadow in unit Volunteer roles" },
                    { code: "POC03", title: "Meeting with your CO" },
                    { code: "POC04", title: "Meet a cadet turned volunteer" },
                    { code: "POC05", title: "What will change session" },
                    { code: "POC06", title: "Act as a Volunteer" },
                    { code: "POC07", title: "Write a Risk Assessment" },
                    { code: "POC08", title: "Organise an event" },
                    { code: "POC09", title: "Lead the units cadet voice meeting" },
                    { code: "POC10", title: "Attend a UMT Meeting" },
                    { code: "POC11", title: "Use Programmes Online" },
                    { code: "POC12", title: "Session Creation" },
                    { code: "POC13", title: "Plan Leadership Tasks" },
                    { code: "POC14", title: "Shadow roles on beyond unit training" },
                    { code: "POC15", title: "Specialisation/Proficiency Instructor Qualification" }
                ]
            }
        };

        const RMC_SYLLABUS = {
            "Recruit": {
                "Recruit Section 1": [
                    { code: "R1-1", title: "Unit Tour, Health and Safety and Who's Who" },
                    { code: "R1-2", title: "Colours Routine and History" },
                    { code: "R1-3", title: "Ranks and Rates of the SCC and RMC" },
                    { code: "R1-4", title: "Duty Personnel, Watches and Bells" },
                    { code: "R2-1", title: "'SHOUT' Introduction to the Sea Cadets Pocket Safeguarding Guide" },
                    { code: "R3-1", title: "Basic Parts of a Ship and Jackspeak" },
                    { code: "R3-2", title: "Introduction to Bends and Hitches" },
                    { code: "R3-3", title: "Safety By the Water & Cadet Forces Water Safety Test" },
                    { code: "R4-1", title: "Cadet Wellbeing" },
                    { code: "R5-1", title: "Values of the Sea Cadet Corps and RMC Ethos" },
                    { code: "R5-2", title: "Cadet portal and Wider Sea-Cadet Opportunities" },
                    { code: "R5-3", title: "Your Royal Marines Cadet Experience" },
                    { code: "R5-4", title: "The Cadet Action Plan" }
                ],
                "Recruit Section 2": [
                    { code: "R6-1", title: "Wearing and Maintaining PCS, Introduction to Dress Regulations" },
                    { code: "R7-1", title: "Introduction to Basic Foot Drill" },
                    { code: "R7-2", title: "Introduction to Marching" },
                    { code: "R7-3", title: "Inclining, Saluting and Falling In" },
                    { code: "R8-1", title: "The Royal Marines 1664 - the Present Day" },
                    { code: "R8-2", title: "Royal Marines Family and Terminology" },
                    { code: "R9-1", title: "Introduction to Physical Activity and Health" },
                    { code: "R9-2", title: "Effective Warm-Up, Cool Down and Safe Lifting" },
                    { code: "R9-3", title: "Components of Fitness" },
                    { code: "R10-1", title: "Introduction to Skill at Arms and Shooting in the RMC" }
                ]
            },
            "Marine Cadet": {
                "L1: Personal Development": [
                    { code: "L1-1", title: "Royal Marines Cadets' Company ORBAT" },
                    { code: "L1-2", title: "The Cadet Action Plan" },
                    { code: "L1-3", title: "Cadet Personal Development Evening" }
                ],
                "L2: Drill": [
                    { code: "L2-1", title: "Sizing, Changing Step in Quick Time and Saluting on the March" },
                    { code: "L2-2", title: "Right and Left Turn in Quick Time and About Turn in Quick Time" },
                    { code: "L2-3", title: "Mark Time, Halt and Change Step, Mark Time and Forward From Quick Time" }
                ],
                "L3: Casualty Info": [
                    { code: "L3-1", title: "Introduction to Basic First Aid: Coping in an Emergency" },
                    { code: "L3-2", title: "Introduction to Basic First Aid: Coping in an Emergency" }
                ],
                "L4: Map Reading": [
                    { code: "L4-1", title: "What is a Map and Care of a Map" },
                    { code: "L4-2", title: "Conventional Signs" },
                    { code: "L4-3", title: "Grid References" },
                    { code: "L4-4", title: "Scale and Navigation" },
                    { code: "L4-5", title: "Contours and Relief" },
                    { code: "L4-6", title: "Direction and Bearings" },
                    { code: "L4-7", title: "Lightweight Compass" },
                    { code: "L4-8", title: "Relating Map to Ground" },
                    { code: "L4-A", title: "Day March Practical" }
                ],
                "L5: Fieldcraft": [
                    { code: "L5-1", title: "Introduction to Fieldcraft and the Rifle Section" },
                    { code: "L5-2", title: "Preparation, Packing and Maintaining Personal Equipment" },
                    { code: "L5-3", title: "Feeding in the Field" },
                    { code: "L5-4", title: "The Two Man Shelter" },
                    { code: "L5-5", title: "Why Things are Seen" },
                    { code: "L5-6", title: "Personal Camouflage and Concealment" },
                    { code: "L5-7", title: "Observation" },
                    { code: "L5-8", title: "Judging Distance" },
                    { code: "L5-9", title: "Indication of Targets" },
                    { code: "L5-10", title: "Range Cards" },
                    { code: "L5-11", title: "Duties of a Sentry" },
                    { code: "L5-12", title: "Moving With or Without Personal Weapons" },
                    { code: "L5-13", title: "Field Signals" },
                    { code: "L5-14", title: "Elementary Obstacle Crossing" },
                    { code: "L5-15", title: "Selecting a route across country" },
                    { code: "L5-16", title: "Introduction to Night Training and Movement" },
                    { code: "L5-17", title: "Stalking" },
                    { code: "L5-18", title: "Reaction to Fire Control Orders" },
                    { code: "L5-19", title: "Keeping Direction at Night" },
                    { code: "L5-20", title: "Individual Fire and Movement (F&M)" },
                    { code: "L5-21", title: "Operating as a Member of a Fire Team and Section" },
                    { code: "L5-22", title: "Issuing Fire Control Orders (FCOs)" },
                    { code: "L5-A", title: "Overnight Practical" }
                ],
                "L6: Uniform": [
                    { code: "L6-1", title: "Care and Issue of Blues" },
                    { code: "L6-2", title: "Fitting of PLCE Webbing" }
                ],
                "L7: Leadership": [
                    { code: "L7-1", title: "Roles and Responsibilities of a Cadet Lance Corporal" },
                    { code: "L7-2", title: "Community Activity - Support an RMC Fundraising event" }
                ],
                "L8: PT": [
                    { code: "L8-1", title: "Effects of Exercise" },
                    { code: "L8-2", title: "Principles of Training" },
                    { code: "L8-3", title: "Personal Fitness Development - Aerobic Fitness" }
                ],
                "L9: The RM": [
                    { code: "L9-1", title: "RM Badge, Colours and Marches" },
                    { code: "L9-2", title: "RM Victoria Cross" }
                ],
                "L10: Waterborne": [
                    { code: "L10-1", title: "Waterborne Activity" },
                    { code: "L10-2", title: "Bowline, Clove Hitch and Sheet bend" }
                ],
                "L11: Expedition": [
                    { code: "L11-1", title: "Duke of Edinburgh's Award Requirements" },
                    { code: "L11-2", title: "Countryside Code" },
                    { code: "L11-3", title: "Equipment/Clothing Selection and Use" },
                    { code: "L11-4", title: "Packing and Lifting a Rucksack" },
                    { code: "L11-5", title: "Campsite Selection" },
                    { code: "L11-6", title: "Food and Cooking" },
                    { code: "L11-7", title: "Health and Safety" },
                    { code: "L11-8", title: "Weather" },
                    { code: "L11-9", title: "Simple Route Card" },
                    { code: "L11-10", title: "Expedition Planning" },
                    { code: "L11-A", title: "Expedition Practical" }
                ],
                "L12: Skill at Arms": [
                    { code: "L12-1", title: "General Description, Safety and Sights (L98)" },
                    { code: "L12-2", title: "Stripping and Assembling (L98)" },
                    { code: "L12-3", title: "Basic Handling Drills (L98)" },
                    { code: "L12-4", title: "Cleaning and Maintenance" },
                    { code: "L12-5", title: "Holding and Aiming in the Prone (L98)" },
                    { code: "L12-6", title: "Firing in the Prone (L98)" },
                    { code: "L12-7", title: "Firing Drills (L98)" },
                    { code: "L12-8", title: "Firing from other Positions and use of Cover (L98)" },
                    { code: "L12-9", title: "Mechanism, Immediate Action and Stoppage Drills (L98)" },
                    { code: "L12-10", title: "Aiming off and Miss Drill (L98)" },
                    { code: "L12-11", title: "Carriage and Reaction to Effective Enemy Fire" },
                    { code: "L12-12", title: "Cadet General Purpose Weapons Handling Test" },
                    { code: "L12-A", title: "Practical Demonstration of Skill at Arms: Close Quarter Battle whilst Blank Firing" },
                    { code: "L12-B", title: "Recognised Shoot (Live Range Shoot or Dismounted Close Combat Trainer Shoot)" }
                ],
                "L13: Ranks": [
                    { code: "L13-1", title: "Ranks and Rates of the Royal Marines and the Royal Navy" }
                ],
                "L14: Signals": [
                    { code: "L14-1", title: "Phonetic Alphabet and 24 Hour Clock" },
                    { code: "L14-2", title: "Radio Nets - Call Signs, Procedures, Security and Discipline" },
                    { code: "L14-3", title: "Calling and Answering, Corrections and Repetitions" },
                    { code: "L14-4", title: "Practical Radio Use" }
                ],
                "L15: Arms Drill": [
                    { code: "L15-1", title: "Positions of Attention, Stand at Ease and Stand Easy" },
                    { code: "L15-2", title: "Changing and Sloping Arms" },
                    { code: "L15-3", title: "Present and Ground Arms" },
                    { code: "L15-4", title: "Saluting at the Halt with a Rifle" },
                    { code: "L15-5", title: "Saluting on the March with a Rifle at the Slope" }
                ],
                "L16: Wellbeing": [
                    { code: "L16-1", title: "Stress" }
                ],
                "L17: Cadet Voice": [
                    { code: "L17-1", title: "Introduction to Cadet Voice" }
                ]
            },
            "Cadet Lance Corporal": {
                "C1: Personal Development": [
                    { code: "C1-1", title: "Sea Cadet Values as a Lifestyle" },
                    { code: "C1-2", title: "Royal Marines Careers and Specialist Qualifications" },
                    { code: "C1-3", title: "BTEC and other Vocational Qualifications" },
                    { code: "C1-4", title: "Cadet Action Plan - Cadet Lance Corporal" }
                ],
                "C2: Drill": [
                    { code: "C2-1", title: "Drill Orders and Sequence of Orders" },
                    { code: "C2-2", title: "Fault Finding and Correction" },
                    { code: "C2-3", title: "Drill Manual Awareness" },
                    { code: "C2-4", title: "Practice Taking Command of a Squad" }
                ],
                "C3: Casualty": [
                    { code: "C3-1", title: "Introduction to Intermediate First Aid: First Aid Kits" }
                ],
                "C4: Map Reading": [
                    { code: "C4-1", title: "Resection" },
                    { code: "C4-2", title: "Boxing, Handrailing and Aiming Off" },
                    { code: "C4-3", title: "Alternate Ways of Finding North" },
                    { code: "C4-A", title: "Practical Day and Night Navigation" }
                ],
                "C5: Fieldcraft": [
                    { code: "C5-1", title: "Model Making for Orders" },
                    { code: "C5-2", title: "Tactical Principles" },
                    { code: "C5-3", title: "Feeding in the Field" },
                    { code: "C5-4", title: "Organisation and Grouping" },
                    { code: "C5-5", title: "Patrolling - Planning and Preparation" },
                    { code: "C5-6", title: "Patrolling - Conduct" },
                    { code: "C5-7", title: "Patrol Harbours" },
                    { code: "C5-8", title: "Defence and Delay Operations" },
                    { code: "C5-9", title: "Observation Posts" },
                    { code: "C5-10", title: "The Attack - Principles" },
                    { code: "C5-11", title: "The Attack - Fire and Movement (F&M)" },
                    { code: "C5-12", title: "The Attack - Hasty Attack (Section Battle Drills)" },
                    { code: "C5-13", title: "The Attack - Hasty Attack (Troop Battle Drills)" },
                    { code: "C5-14", title: "The Attack - The Deliberate Attack" },
                    { code: "C5-15", title: "The Attack - Advance to Contact" },
                    { code: "C5-16", title: "Battle Procedure - Functional Grouping and Orders" },
                    { code: "C5-A", title: "Practical - Operate a formal harbour or observation post overnight" }
                ],
                "C6: Leadership": [
                    { code: "C6-1", title: "Roles and Responsibilities of a Cadet Corporal" },
                    { code: "C6-2", title: "Community Activity" }
                ],
                "C7: PT": [
                    { code: "C7-1", title: "Eating for Health" },
                    { code: "C7-2", title: "Climatic Injuries (Heat Illness & Hypothermia)" },
                    { code: "C7-3", title: "Exercise, Stress and Relaxation" },
                    { code: "C7-4", title: "Personal Fitness Development - Basic Personal Fitness" }
                ],
                "C8: RM": [
                    { code: "C8-1", title: "Current Royal Marines Activity" }
                ],
                "C9: Waterborne": [
                    { code: "C9-1", title: "Waterborne Activity" }
                ],
                "C10: Expedition": [
                    { code: "C10-1", title: "Expedition Planning" },
                    { code: "C10-2", title: "Planning Session 1: Location, Accommodation and logistics" },
                    { code: "C10-3", title: "Planning Session 2 - Route" },
                    { code: "C10-4", title: "Planning Session 3 - Equipment" },
                    { code: "C10-5", title: "Planning Session 4 - Final Considerations and Briefing" },
                    { code: "C10-6", title: "Survival and Bushcraft" },
                    { code: "C10-A", title: "Expedition Practical" }
                ],
                "C11: Skill at Arms": [
                    { code: "C11-A", title: "Blank Firing Serial" },
                    { code: "C11-B", title: "Range Serial" }
                ],
                "C12: Ranks": [
                    { code: "C12-1", title: "Ranks of the Army and RAF" }
                ],
                "C13: Signals": [
                    { code: "C13-1", title: "Contact Reports and Situation Reports" },
                    { code: "C13-2", title: "Voice Procedures and Sending Reports" },
                    { code: "C13-3", title: "Practical Field Signals" }
                ],
                "C14: Wellbeing": [
                    { code: "C14-1", title: "Healthy Habits" }
                ],
                "C15: Cadet Voice": [
                    { code: "C15-1", title: "Prioritisation and District Meetings" }
                ]
            },
            "Cadet Corporal": {
                "S1: Personal Development": [
                    { code: "S1-1", title: "Safeguarding as a Senior Cadet" },
                    { code: "S1-2", title: "Career Planning" },
                    { code: "S1-3", title: "Cadet Action Plan - Cadet Corporal" }
                ],
                "S2: Drill": [
                    { code: "S2-1", title: "Practise Taking Command of a Squad" },
                    { code: "S2-2", title: "Method of Instruction" },
                    { code: "S2-3", title: "Instruction Practise - Interval Drill at the Halt" },
                    { code: "S2-4", title: "Instruction Practise - Interval Drill on the March" }
                ],
                "S3: Casualty": [
                    { code: "S3-1", title: "Casualty Evacuation" },
                    { code: "S3-2", title: "Casualty Triage" },
                    { code: "S3-3", title: "Health and Safety" }
                ],
                "S4: Map Reading": [
                    { code: "S4-1", title: "Route Planning" }
                ],
                "S5: Fieldcraft": [
                    { code: "S5-1", title: "Orders Development" },
                    { code: "S5-2", title: "Ambushes - Organisation" },
                    { code: "S5-3", title: "Ambushes - Planning and Preparation" },
                    { code: "S5-4", title: "Ambushes - Conduct" },
                    { code: "S5-5", title: "Training in Woods and Forest (TIWAF) - Offensive Operations" },
                    { code: "S5-6", title: "Training in Woods and Forest (TIWAF) - Defence and Delay Operations" },
                    { code: "S5-7", title: "Training in Built Up Areas (TIBUA) - Offensive Operations" },
                    { code: "S5-8", title: "Training in Built Up Areas (TIBUA) - Defensive Operations" },
                    { code: "S5-9", title: "Patrol Reports" }
                ],
                "S6: Leadership": [
                    { code: "S6-1", title: "What Makes a Great Leader?" },
                    { code: "S6-2", title: "Difference Between a Leader and a Manager" },
                    { code: "S6-3", title: "Active Listening" },
                    { code: "S6-4", title: "Emotional Intelligence" },
                    { code: "S6-5", title: "Conflict Resolution" },
                    { code: "S6-6", title: "Motivating Self and Others" },
                    { code: "S6-7", title: "How to Plan Effectively" },
                    { code: "S6-8", title: "Facilitating Cadet Discussion" },
                    { code: "S6-9", title: "Reflection and Self-Development" }
                ],
                "S7: PT": [
                    { code: "S7-1", title: "Injury Prevention and Goal Setting" },
                    { code: "S7-2", title: "Aerobic and Anaerobic Fitness and Skill Related Fitness" },
                    { code: "S7-3", title: "Training for Overall Fitness" },
                    { code: "S7-4", title: "Personal Fitness Development - Goal Setting for Sergeant and Beyond" }
                ],
                "S8: RM": [
                    { code: "S8-1", title: "Research - Individual Honours, Battles and Operations" },
                    { code: "S8-2", title: "Presentation - Individual Honours, Battles and Operations" },
                    { code: "S8-3", title: "Current Royal Marines Activity - Commando Case Study" }
                ],
                "S9: Waterborne": [
                    { code: "S9-1", title: "Waterborne Activity" }
                ],
                "S10: Expedition": [
                    { code: "S10-1", title: "Planning Session 1: Location" },
                    { code: "S10-2", title: "Planning Session 2: Accommodation and logistics" },
                    { code: "S10-3", title: "Planning Session 3 - Route" },
                    { code: "S10-4", title: "Planning Session 4 - Equipment" },
                    { code: "S10-5", title: "Planning Session 5 - Final Considerations and Briefing Prep" },
                    { code: "S10-6", title: "Planning Session 6 - Briefing Delivery" },
                    { code: "S10-A", title: "Expedition Practical" }
                ],
                "S11: Skill at Arms": [
                    { code: "S11-1", title: "Cadet Target Rifle - General Description, Safety, Bipod, Slings and Sights" },
                    { code: "S11-2", title: "Fitting the Sling and Rifle Cleaning" },
                    { code: "S11-3", title: "Sight Setting, Load, Unload, Misfires and Safe-Handling" },
                    { code: "S11-4", title: "Adjusting the Rifle, Handling" },
                    { code: "S11-5", title: "Mechanism of the Rifle" },
                    { code: "S11-6", title: "Practice Period - Rifle Practice Covering Lessons 1,2,3 and 4" }
                ],
                "S12: Wellbeing": [
                    { code: "S12-1", title: "Wellbeing and Communication" }
                ],
                "S13: Cadet Voice": [
                    { code: "S13-1", title: "Working with your UMT" }
                ]
            },
            "Cadet Sergeant": {
                "SGT Modules": [
                    { code: "SGT01", title: "Personal Development Plan" },
                    { code: "SGT02", title: "Shadow In-Unit Volunteer Roles" },
                    { code: "SGT03", title: "Meeting with your CO/OiC" },
                    { code: "SGT04", title: "Meet a Cadet-Turned-Volunteer" },
                    { code: "SGT05", title: "What will Change?" },
                    { code: "SGT06", title: "Act as a Volunteer" },
                    { code: "SGT07", title: "Write a Risk Assessment" },
                    { code: "SGT08", title: "Organise an Event" },
                    { code: "SGT09", title: "Lead the Unit's Cadet Voice Meeting" },
                    { code: "SGT10", title: "Attend a UMT Meeting" },
                    { code: "SGT11", title: "Use Programmes Online" },
                    { code: "SGT12", title: "Session Creation" },
                    { code: "SGT13", title: "Plan Leadership Tasks" },
                    { code: "SGT14", title: "Shadow Roles during Beyond-Unit Training" },
                    { code: "SGT15", title: "Specialisation/Proficiency/Activity Instructor Qualification" }
                ]
            }
        };

        const WATER_SYLLABUS = {
            "Swim": [ { code: "Swim Test", title: "CF Swim Test", alts: ["CF Swimming Test"] }, { code: "Water Safety", title: "CF Water Safety Test", alts: [] } ],
            "Paddle": [ { code: "Start", title: "BC Paddle Start Award", alts: [] }, { code: "Discover", title: "BC Paddle Discover Award", alts: [] }, { code: "Explore", title: "BC Paddle Explore Award", alts: [] }, { code: "PSRC", title: "BC Paddle Safety & Rescue Course (PSRC)", alts: ["BC Foundation Safety & Rescue Training (FSRT)"] }, { code: "SUP Sheltered", title: "BC Stand Up Paddle Sheltered Water Award", alts: [] }, { code: "Instructor", title: "BC Paddlesport Instructor", alts: [] } ],
            "Row": [ { code: "Taster", title: "Taster Certificate", alts: ["SCC Taster Certificate", "SCC Row 1-Rowing Taster"] }, { code: "Go Row 1 (Fixed)", title: "BR Explore Rowing - Go Row 1 (Fixed)", alts: ["SCC Competent Crew"] }, { code: "Go Row 1 (Sliding)", title: "BR Explore Rowing - Go Row 1 (Sliding)", alts: [] }, { code: "Go Row 2 (Fixed)", title: "BR Explore Rowing - Go Row 2 (Fixed)", alts: ["SCC Supervised Cox", "SCC Row 2"] }, { code: "Go Row 2 (Sliding)", title: "BR Explore Rowing - Go Row 2 (Sliding)", alts: [] }, { code: "Go Row 3 (Fixed)", title: "BR Explore Rowing - Go Row 3 (Fixed)", alts: ["SCC Coxswain", "SCC Row 3"] }, { code: "Asst Instructor", title: "SCC Assistant Rowing Instructor", alts: [] }, { code: "Instructor", title: "SCC Rowing Instructor", alts: [] }, { code: "Sliding Endorsement", title: "SCC Sliding Seat Instructor Endorsement", alts: [] }, { code: "Coastal Endorsement", title: "SCC Instructor Coastal Endorsement", alts: [] } ],
            "Sail": [ { code: "Taster", title: "Dinghy Sailing Taster", alts: ["Dinghy Sailing Taster Certificate"] }, { code: "Stage 1", title: "RYA YSS Stage 1", alts: [] }, { code: "Stage 2", title: "RYA YSS Stage 2", alts: [] }, { code: "Stage 3", title: "RYA YSS Stage 3", alts: [] }, { code: "Stage 4", title: "RYA YSS Stage 4", alts: [] }, { code: "Spinnakers", title: "RYA Sailing with Spinnakers", alts: [] }, { code: "Seamanship", title: "RYA Seamanship Skills", alts: [] }, { code: "Day Sailing", title: "RYA Day Sailing", alts: [] }, { code: "Performance", title: "RYA Performance Sailing", alts: [] }, { code: "Start Racing", title: "RYA Start Racing", alts: [] }, { code: "Asst Instructor", title: "RYA Assistant Instructor", alts: [] }, { code: "DI Pre-Entry", title: "RYA Dinghy Instructor Pre-Entry Assessment", alts: [] }, { code: "DI Training", title: "RYA Dinghy Instructor Training", alts: [] }, { code: "DI Moderation", title: "RYA Dinghy Instructor Moderation", alts: [] } ],
            "Power": [ { code: "Level 1", title: "RYA Powerboat Level 1", alts: [] }, { code: "L2 Disp", title: "RYA Powerboat Level 2 Displacement", alts: [] }, { code: "L2 Planing", title: "RYA Powerboat Level 2 Planing", alts: [] }, { code: "Safety Boat", title: "RYA Safety Boat", alts: [] }, { code: "Instructor", title: "RYA Powerboat Instructor", alts: [] }, { code: "Advanced", title: "RYA Powerboat Advanced", alts: [] } ],
            "Windsurf": [ { code: "Intro", title: "RYA YouthWS Introductory", alts: ["RYA YouthWS Introductory Certificate"] }, { code: "Stage 1", title: "RYA YouthWS - Stage 1", alts: ["RYA NWS Start Windsurfing"] }, { code: "Stage 2", title: "RYA YouthWS - Stage 2", alts: [] }, { code: "Stage 3", title: "RYA YouthWS - Stage 3", alts: [] }, { code: "Instructor Training", title: "RYA Start Windsurfing Instructor Training", alts: [] }, { code: "Instructor Mod", title: "RYA Start Windsurfing Instructor Moderation", alts: [] }, { code: "Instructor", title: "RYA Start Windsurfing Instructor", alts: [] } ],
            "Shorebased": [ { code: "First Aid", title: "RYA First Aid", alts: ["RyA First Aid"] }, { code: "Nav & Seamanship", title: "RYA Essential Navigation and Seamanship", alts: [] } ],
            "Offshore": [ { code: "Sail G1", title: "Sail Grade 1", alts: ["Offshore Hand Level 1 (OH1)", "RYA Start Yachting", "OH1 Equivalent"] }, { code: "Sail G2", title: "Sail Grade 2", alts: ["Offshore Hand Level 2 (OH2)", "RYA Competent Crew"] }, { code: "Power G1", title: "Power Grade 1", alts: [] }, { code: "Power G2", title: "Power Grade 2", alts: ["Offshore Power Level 2 (OPH2)"] }, { code: "Power Seaman", title: "Power Seaman", alts: ["Offshore Power Seaman (OPS)"] }, { code: "Power WL", title: "Power Watch Leader", alts: ["OPWL"] }, { code: "Watch Leader", title: "Watch Leader", alts: ["Offshore Watch Leader (OWL)", "RYA Day Skipper"] }, { code: "Motor Cruising", title: "Motor Cruising - RYA Start Motor Cruising", alts: [] }, { code: "Sail Cruising", title: "Sail Cruising - RYA Start Yachting", alts: [] } ],
            "Awards": [ { code: "Coxswain", title: "Coxswain Award", alts: ["SCC Proficiency"] }, { code: "Master Coxswain", title: "Master Coxswain Award", alts: ["SCC Proficiency"] } ]
        };


        // --- 1.4 RANK ORDERS ---
        const SCC_RANK_ORDER = ["New Entry Cadet", "Cadet", "Cadet 1st Class", "Ordinary Cadet", "Able Cadet", "Leading Cadet", "Petty Officer Cadet"];
        const RMC_RANK_ORDER = ["Recruit", "Marine Cadet", "Cadet Lance Corporal", "Cadet Corporal", "Cadet Sergeant"];

        // --- 1.5 JUNIOR SEA CADETS DATA (RC2 Stage 2) ---
        const JUNIOR_RANK_ORDER = ["Junior Cadet", "Junior Cadet 1st Class", "Able Junior Cadet", "Leading Junior Cadet"];
        
        // Junior modules database - 312 modules across 5 sections
        // Red: 61 (11 core), Blue: 54 (3 core + Blue 1 from Westminster), Green: 49, Yellow: 107, STEM: 41
        const JUNIOR_MODULES = {
            "metadata": {
                "version": "1.0-corrected",
                "source": "Official JSC Module List - January 2025",
                "totalModules": 341
            },
            "sections": {
                "red": {
                    "name": "Red - Unit Activities",
                    "requirement": 15,
                    "coreCount": 11,
                    "totalModules": 73,
                    "theme": "The Unit"
                },
                "blue": {
                    "name": "Blue - Waterborne Activities",
                    "requirement": 15,
                    "coreCount": 4,
                    "totalModules": 70,
                    "theme": "Waterborne (Blue 1 from Westminster)"
                },
                "green": {
                    "name": "Green - Outdoor & Recreation",
                    "requirement": 15,
                    "coreCount": 0,
                    "totalModules": 49,
                    "theme": "Outdoor & Recreation"
                },
                "yellow": {
                    "name": "Yellow - Community & Citizenship",
                    "requirement": 15,
                    "coreCount": 0,
                    "totalModules": 107,
                    "theme": "Community & Citizenship"
                },
                "stem": {
                    "name": "STEM Activities",
                    "requirement": 15,
                    "coreCount": 0,
                    "totalModules": 42,
                    "theme": "Science, Technology, Engineering, Maths"
                }
            }
        };
        
        console.log("Junior Sea Cadets data loaded - Stage 2 active");

        // ============================================================================
        // SECTION 2: HELPER FUNCTIONS
        // ============================================================================
        
        // --- 2.1 CSV PARSING ---
        const splitCSVLine = (str) => {
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

        const sanitizeText = (text) => {
            if (!text || typeof text !== 'string') return text;
            // Strip HTML tags and script content
            return text
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<[^>]+>/g, '')
                .trim();
        };

        const RANK_ABBREVIATIONS = {
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

        const formatCadetNameWithRank = (name, rank) => {
            // Parse "SURNAME, Firstname" format
            const parts = name.split(',').map(p => p.trim());
            if (parts.length !== 2) return name; // Fallback if format unexpected
            
            const surname = parts[0].toUpperCase(); // Keep surname in capitals
            const firstname = parts[1];
            
            // Get rank abbreviation
            const rankAbbrev = RANK_ABBREVIATIONS[rank] || rank;
            
            return `${rankAbbrev} ${firstname} ${surname}`;
        };

        const getPreviousRank = (newRank) => {
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

        const parseDate = (dateStr) => {
            if (!dateStr) return null;
            let d = new Date(dateStr);
            if (!isNaN(d.getTime())) return d;
            
            const parts = dateStr.split(/[\/\-\s]/);
            if (parts.length === 3) {
                const day = parseInt(parts[0]);
                const year = parseInt(parts[2]);
                let month = parseInt(parts[1]) - 1; 

                if (isNaN(month)) {
                    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
                    month = months.findIndex(m => parts[1].toLowerCase().startsWith(m));
                }
                
                if (!isNaN(day) && !isNaN(month) && !isNaN(year) && month >= 0) {
                    d = new Date(year, month, day);
                    if (!isNaN(d.getTime())) return d;
                }
            }
            return null;
        };

        // Global Date Formatter
        const formatDate = (date) => {
            if (!date) return '-';
            const d = new Date(date);
            if (isNaN(d.getTime())) return '-';
            return d.toLocaleDateString('en-GB');
        };

        const normalizeRank = (rawRank) => {
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

        const calculateAge = (dob) => {
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
        
        // Age-based styling function
        const getCadetAgeColor = (dob) => {
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
        
        // Check if cadet is a junior (under 12 OR age 12 with junior modules/rank)
        const isJunior = (dob, pNumber = null, rank = null) => {
            const age = calculateAge(dob);
            if (age === "Unknown") return false;
            
            // Definitely include if under 12
            if (age < 12) return true;
            
            // For 12-year-olds, check if they have junior modules or junior rank
            if (age === 12 && pNumber) {
                const juniorData = getJuniorData();
                const hasJuniorModules = juniorData.moduleCompletions.some(m => m.pNumber === pNumber);
                
                // Check if they have a junior rank (passed as parameter)
                const hasJuniorRank = rank && (
                    rank.toLowerCase().includes('junior cadet') || 
                    rank.toLowerCase().includes('able junior cadet')
                );
                
                return hasJuniorModules || hasJuniorRank;
            }
            
            return false;
        };
        
        // Calculate days until 12th birthday
        const daysTo12thBirthday = (dob) => {
            if (!dob) return null;
            const birthDate = parseDate(dob);
            if (!birthDate) return null;
            
            const today = new Date();
            const twelfthBirthday = new Date(birthDate.getFullYear() + 12, birthDate.getMonth(), birthDate.getDate());
            
            if (today >= twelfthBirthday) return 0; // Already 12 or older
            
            const diffTime = twelfthBirthday - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        };
        
        // Get junior data from localStorage
        const getJuniorData = () => {
            try {
                const data = localStorage.getItem('scc_juniors');
                return data ? JSON.parse(data) : {
                    moduleCompletions: [], // {pNumber, section, moduleCode, moduleName, dateCompleted, isCore}
                    rankHistory: [], // {pNumber, rank, dateAwarded}
                    sectionBadges: [] // {pNumber, section, dateAwarded, modulesCompleted}
                };
            } catch (e) {
                console.error("Error loading junior data:", e);
                return { moduleCompletions: [], rankHistory: [], sectionBadges: [] };
            }
        };
        
        // Save junior data to localStorage
        const saveJuniorData = (data) => {
            try {
                localStorage.setItem('scc_juniors', JSON.stringify(data));
                return true;
            } catch (e) {
                console.error("Error saving junior data:", e);
                return false;
            }
        };

        
        // ============================================================================
        // SECTION 3: UI COMPONENTS
        // ============================================================================
        
        // --- 3.1 UTILITY COMPONENTS (Icon, BadgeImage, ErrorBoundary) ---

        const Icon = ({ name, className }) => {
            return <i data-lucide={name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()} className={className}></i>;
        };
        
        const BadgeImage = ({ name, fallbackIcon, className }) => {
            const [error, setError] = useState(false);
            let filename = BADGE_MAP[name];
            if (!filename) {
                const cleanName = name.replace(/\(.*\)/, "").trim(); 
                const matchingKey = Object.keys(BADGE_MAP).find(k => k.includes(cleanName) || cleanName.includes(k));
                if(matchingKey) filename = BADGE_MAP[matchingKey];
            }
            if (!filename) filename = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + ".png";
            const src = `media/${filename}`;
            
            if (error) {
                // Return a placeholder box with "Missing Image" text
                return (
                    <div className={`${className} bg-slate-100 border border-slate-300 rounded flex items-center justify-center text-center p-1`}>
                        <span className="text-[9px] text-slate-400 font-mono leading-tight">Missing Image<br/><span className="text-[7px] opacity-50">{name}</span></span>
                    </div>
                );
            }
            
            return <img src={src} alt={name} className={`object-contain ${className}`} onError={() => setError(true)} title={name} />;
        };

        class ErrorBoundary extends Component {
            constructor(props) {
                super(props);
                this.state = { hasError: false, error: null };
            }
            static getDerivedStateFromError(error) { return { hasError: true, error }; }
            componentDidCatch(error, errorInfo) { console.error("Dashboard Error:", error, errorInfo); }
            handleReset = () => { localStorage.clear(); window.location.reload(); }
            render() {
                if (this.state.hasError) {
                    return (
                        <div className="min-h-screen flex items-center justify-center bg-red-50 p-8">
                            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center">
                                <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
                                <p className="text-slate-600 mb-6">The dashboard encountered an error processing the data.</p>
                                <div className="bg-slate-100 p-4 rounded text-left text-xs font-mono text-red-800 mb-6 overflow-auto max-h-32">{this.state.error && this.state.error.toString()}</div>
                                <button onClick={this.handleReset} className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors">Clear Data & Reset</button>
                            </div>
                        </div>
                    );
                }
                return this.props.children; 
            }
        }

        // --- 3.2 FILE UPLOADER COMPONENT ---
        const FileUploader = ({ onDataLoaded, hasData, clearData, wipeAllData }) => {
            const [personnelFile, setPersonnelFile] = useState(null);
            const [qualsFile, setQualsFile] = useState(null);
            const [loading, setLoading] = useState(false);
            const [error, setError] = useState(null);
            const [showVideoModal, setShowVideoModal] = useState(false);
            const [preview, setPreview] = useState(null); // NEW: Preview data before import
            const [validationErrors, setValidationErrors] = useState([]); // NEW: Validation errors
            const [importSummary, setImportSummary] = useState(null); // NEW: Import summary
            
            // Logo upload states
            const [unitCrestPreview, setUnitCrestPreview] = useState(localStorage.getItem('unit_crest') || null);
            const [sccLogoPreview, setSccLogoPreview] = useState(localStorage.getItem('scc_logo') || null);
            const [rmcLogoPreview, setRmcLogoPreview] = useState(localStorage.getItem('rmc_logo') || null);

            const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit
            const VALID_MIME_TYPES = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
            const MAX_LOGO_SIZE = 500 * 1024; // 500KB for logos
            const VALID_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

            const handleFile = (file, type) => {
                if (!file) return;
                
                // Validate file size
                if (file.size > MAX_FILE_SIZE) {
                    setError(`File "${file.name}" exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
                    return;
                }
                
                // Validate MIME type
                if (!VALID_MIME_TYPES.includes(file.type) && !file.name.endsWith('.csv')) {
                    setError(`Invalid file type. Please upload CSV files only. File type: ${file.type || 'unknown'}`);
                    return;
                }
                
                if(type === 'personnel') setPersonnelFile(file);
                if(type === 'quals') setQualsFile(file);
                if (error) setError(null); // Clear error on new file selection
            };

            const handleLogoUpload = (file, type) => {
                if (!file) return;
                
                // Validate file size
                if (file.size > MAX_LOGO_SIZE) {
                    setError(`Logo file too large. Maximum size is 500KB. Current size: ${(file.size / 1024).toFixed(0)}KB`);
                    return;
                }
                
                // Validate image type
                if (!VALID_IMAGE_TYPES.includes(file.type)) {
                    setError(`Invalid image type. Please upload JPG, PNG, or WebP files only.`);
                    return;
                }
                
                // Convert to base64 and store
                const reader = new FileReader();
                reader.onload = (e) => {
                    const base64 = e.target.result;
                    
                    // Store in localStorage
                    if (type === 'crest') {
                        localStorage.setItem('unit_crest', base64);
                        setUnitCrestPreview(base64);
                    } else if (type === 'scc') {
                        localStorage.setItem('scc_logo', base64);
                        setSccLogoPreview(base64);
                    } else if (type === 'rmc') {
                        localStorage.setItem('rmc_logo', base64);
                        setRmcLogoPreview(base64);
                    }
                };
                reader.readAsDataURL(file);
            };

            const removeLogo = (type) => {
                if (type === 'crest') {
                    localStorage.removeItem('unit_crest');
                    setUnitCrestPreview(null);
                } else if (type === 'scc') {
                    localStorage.removeItem('scc_logo');
                    setSccLogoPreview(null);
                } else if (type === 'rmc') {
                    localStorage.removeItem('rmc_logo');
                    setRmcLogoPreview(null);
                }
            };

            const readFile = (file) => new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsText(file);
            });

            const processPersonnelFile = async (text, validationErrors = []) => {
                const personnelData = [];
                const lines = text.split('\n');
                
                // Validate row count (excluding header)
                const dataRowCount = lines.length - 1;
                if (dataRowCount > 1000) {
                    throw new Error(`Personnel file has too many rows (${dataRowCount.toLocaleString()}). Maximum allowed is 1,000 cadets.`);
                }
                
                const headers = splitCSVLine(lines[0].trim());
                
                const findCol = (name) => headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));
                
                const idx = {
                    pnum: findCol("PNumber") > -1 ? findCol("PNumber") : findCol("PNo"),
                    rank: findCol("Rank"),
                    surname: findCol("Surname"),
                    firstname: findCol("First Name"),
                    unit: findCol("Unit"),
                    dob: findCol("DOB"),
                    tos: findCol("TOS Date"),
                    rankDate: findCol("Date Current Rank"),
                    cvqo: findCol("CVQO Reference")
                };

                const requiredFields = ['pnum', 'rank', 'surname'];
                const missing = requiredFields.filter(key => idx[key] === -1);
                if (missing.length > 0) {
                    throw new Error(`Personnel file missing columns: ${missing.join(', ')}. Check CSV headers.`);
                }

                for (let i = 1; i < lines.length; i++) {
                    const row = splitCSVLine(lines[i].trim());
                    if (row.length < 3) continue;
                    
                    // Enhanced validation: Track errors for this row
                    const rowErrors = [];
                    const pNumber = sanitizeText(row[idx.pnum] || "").trim();
                    const rank = sanitizeText(row[idx.rank] || "").trim();
                    const surname = sanitizeText(row[idx.surname] || "").trim();
                    const firstname = sanitizeText(row[idx.firstname] || "").trim();
                    
                    // Validate P-Number (recognize both cadet and adult volunteer formats)
                    if (!pNumber) {
                        rowErrors.push(`Row ${i + 1}: Missing P-Number`);
                    } else {
                        const cleanPNum = pNumber.replace(/[\s-]/g, ''); // Remove spaces/hyphens
                        
                        // Valid formats:
                        // P##### - Cadet format with prefix (e.g., P12345)
                        // ######## - Cadet format without prefix (e.g., 11806919) - Westminster export format
                        // CV##### - Adult volunteer format (e.g., CV139891)
                        // L#######L - Adult volunteer format (e.g., B907946L, A009350Q)
                        const isCadetWithPrefix = /^[Pp]\d+$/.test(cleanPNum);
                        const isCadetNumericOnly = /^\d{7,8}$/.test(cleanPNum); // 7-8 digit numbers (Westminster export format)
                        const isAdultCVFormat = /^CV\d+$/i.test(cleanPNum);
                        const isAdultLetterFormat = /^[A-Z]\d{6,7}[A-Z]$/i.test(cleanPNum);
                        
                        if (!isCadetWithPrefix && !isCadetNumericOnly && !isAdultCVFormat && !isAdultLetterFormat) {
                            // Only warn if it doesn't match any known format
                            rowErrors.push(`Row ${i + 1}: Unusual P-Number format "${pNumber}" (expected: P12345, 11806919, CV12345, or A123456B)`);
                        }
                    }
                    
                    // Validate rank (treat missing rank as Unit Assistant for adult volunteers)
                    // No warning for missing rank - will be set to "Unit Assistant (UA)"
                    // This is valid for adult volunteers with no rank
                    
                    // Validate name
                    if (!surname && !firstname) {
                        rowErrors.push(`Row ${i + 1}: Missing name for ${pNumber}`);
                    }
                    
                    // Validate DOB if present (only if not empty)
                    if (row[idx.dob] && row[idx.dob].trim()) {
                        const dobTest = parseDate(row[idx.dob]);
                        if (!dobTest) {
                            rowErrors.push(`Row ${i + 1}: Invalid date format for DOB "${row[idx.dob]}" (${pNumber})`);
                        }
                    }
                    
                    // If there are errors, add them to validation errors list
                    if (rowErrors.length > 0) {
                        validationErrors.push(...rowErrors);
                    }
                    
                    // Still add the record (with warnings) so partial data can be imported
                    personnelData.push({
                        pNumber: pNumber,
                        rank: normalizeRank(rank || "Unit Assistant (UA)"),
                        name: `${surname}, ${firstname}`,
                        unit: sanitizeText(row[idx.unit] || "").trim(),
                        dob: row[idx.dob],
                        tos: row[idx.tos],
                        rankDate: row[idx.rankDate],
                        cvqo: sanitizeText(row[idx.cvqo]),
                        _hasWarnings: rowErrors.length > 0 // Flag for preview
                    });
                }
                
                return personnelData;
            };

            const processQualsFile = async (text) => {
                const qualsData = [];
                const lines = text.split('\n');
                
                // Validate row count (excluding header)
                const dataRowCount = lines.length - 1;
                if (dataRowCount > 200000) {
                    throw new Error(`Qualifications file has too many rows (${dataRowCount.toLocaleString()}). Maximum allowed is 200,000 records.`);
                }
                
                const headers = splitCSVLine(lines[0].trim());
                
                const findCol = (name) => headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));
                
                const idx = {
                    pnum: findCol("PNumber") > -1 ? findCol("PNumber") : findCol("PNo"),
                    module: findCol("Module"),
                    date: findCol("Date Achieved"),
                    result: findCol("Result"),
                    syllabus: findCol("Syllabus")
                };

                const requiredFields = ['pnum', 'module', 'date'];
                const missing = requiredFields.filter(key => idx[key] === -1);
                if (missing.length > 0) {
                    throw new Error(`Qualifications file missing columns: ${missing.join(', ')}. Check CSV headers.`);
                }

                for (let i = 1; i < lines.length; i++) {
                    const row = splitCSVLine(lines[i].trim());
                    if (row.length < 3) continue;
                    qualsData.push({
                        pNumber: sanitizeText(row[idx.pnum] || "").trim(),
                        module: sanitizeText(row[idx.module] || "").trim(),
                        date: parseDate(row[idx.date]),
                        result: sanitizeText(row[idx.result]),
                        syllabus: sanitizeText(row[idx.syllabus])
                    });
                }
                
                return qualsData;
            };

            const processFiles = async () => {
                if (!personnelFile || !qualsFile) {
                    setError("Please select both files.");
                    return;
                }

                setLoading(true);
                setError(null);
                setValidationErrors([]);
                setImportSummary(null);

                try {
                    const personnelText = await readFile(personnelFile);
                    const qualsText = await readFile(qualsFile);
                    
                    const validationErrors = [];
                    const personnelData = await processPersonnelFile(personnelText, validationErrors);
                    const qualsData = await processQualsFile(qualsText);
                    
                    // Generate preview (first 10 rows)
                    const previewData = {
                        personnel: personnelData.slice(0, 10),
                        personnelTotal: personnelData.length,
                        qualifications: qualsData.slice(0, 10),
                        qualificationsTotal: qualsData.length,
                        errors: validationErrors
                    };
                    
                    setPreview(previewData);
                    setValidationErrors(validationErrors);
                    
                    // Store warnings in localStorage so they persist after navigation
                    if (validationErrors.length > 0) {
                        localStorage.setItem('importWarnings', JSON.stringify({
                            warnings: validationErrors,
                            timestamp: new Date().toISOString(),
                            personnelCount: personnelData.length,
                            qualsCount: qualsData.length
                        }));
                    }
                    
                    // If there are critical errors (more than 10% of records), require confirmation
                    const errorRate = validationErrors.length / personnelData.length;
                    if (errorRate > 0.1) {
                        const proceed = confirm(
                            `Found ${validationErrors.length} validation warnings in ${personnelData.length} personnel records (${(errorRate * 100).toFixed(1)}%).\n\n` +
                            `Do you want to proceed with import?\n\n` +
                            `Click OK to continue or Cancel to fix errors and re-upload.`
                        );
                        if (!proceed) {
                            setLoading(false);
                            return;
                        }
                    }
                    
                    // Import data
                    onDataLoaded(personnelData, qualsData);
                    
                    // Show summary (warnings box is shown above via setValidationErrors)
                    setImportSummary({
                        personnelImported: personnelData.length,
                        qualificationsImported: qualsData.length,
                        warningsCount: validationErrors.length,
                        success: true
                    });
                    
                    // Scroll to top to show warnings
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    
                } catch (err) {
                    console.error(err);
                    setError(err.message);
                    setImportSummary({
                        success: false,
                        error: err.message
                    });
                } finally {
                    setLoading(false);
                }
            };
            
            return (
                <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto mt-2 border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Icon name="Upload" className="w-5 h-5" /> Import Data Sources
                    </h2>
                    
                    <div className="mb-6 text-sm text-slate-600 bg-blue-50 p-4 rounded border border-blue-100">
                        <p className="mb-3">
                            Please watch this video to see how to download the correct CSV files from Westminster, ready to upload to your dashboard. 
                            Please note that all data remains secure within your web browser, and no data is uploaded to our servers.
                        </p>
                        <button onClick={() => setShowVideoModal(true)} className="inline-flex items-center gap-2 font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer">
                            <Icon name="FileText" className="w-4 h-4" /> Watch Instructions Video
                        </button>
                    </div>

                    {/* Security Warning */}
                    <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded">
                        <div className="flex items-start gap-2">
                            <Icon name="ShieldAlert" className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-bold text-amber-900 mb-2">Data Security Notice</p>
                                <p className="text-amber-800 mb-2">
                                    Your cadet data is stored in your browser only. It never leaves your device.
                                </p>
                                <p className="text-amber-800 mb-2">
                                    <strong>On shared computers:</strong> Always click "Reset Data" when finished to clear all cadet information.
                                </p>
                                <p className="text-amber-700 text-xs">
                                    For best security, use this dashboard on your personal device.
                                </p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex justify-between items-start">
                            <div>
                                <p className="font-bold">Error Processing Files</p>
                                <p className="text-sm">{error}</p>
                            </div>
                            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700" aria-label="Dismiss error message">
                                <Icon name="X" className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Validation Warnings */}
                    {validationErrors.length > 0 && (
                        <div className="mb-4 p-4 bg-amber-50 border-l-4 border-amber-500">
                            <div className="flex justify-between items-start mb-2">
                                <p className="font-bold text-amber-900 flex items-center gap-2">
                                    <Icon name="AlertTriangle" className="w-5 h-5" />
                                    {validationErrors.length} Validation Warning{validationErrors.length !== 1 ? 's' : ''}
                                </p>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => {
                                            // Export warnings to CSV
                                            const csvContent = "data:text/csv;charset=utf-8," 
                                                + "Row,Warning\n"
                                                + validationErrors.map(err => {
                                                    // Extract row number and message
                                                    const match = err.match(/Row (\d+): (.+)/);
                                                    if (match) {
                                                        return `${match[1]},"${match[2].replace(/"/g, '""')}"`;
                                                    }
                                                    return `,"${err.replace(/"/g, '""')}"`;
                                                }).join("\n");
                                            
                                            const encodedUri = encodeURI(csvContent);
                                            const link = document.createElement("a");
                                            link.setAttribute("href", encodedUri);
                                            link.setAttribute("download", `validation_warnings_${new Date().toISOString().split('T')[0]}.csv`);
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                        }}
                                        className="text-amber-700 hover:text-amber-900 flex items-center gap-1 text-sm font-semibold"
                                        title="Download warnings as CSV"
                                    >
                                        <Icon name="Download" className="w-4 h-4" />
                                        Download CSV
                                    </button>
                                    <button onClick={() => setValidationErrors([])} className="text-amber-600 hover:text-amber-800">
                                        <Icon name="X" className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="text-sm text-amber-800 max-h-48 overflow-y-auto space-y-1">
                                {validationErrors.slice(0, 20).map((err, idx) => (
                                    <div key={idx} className="pl-2 border-l-2 border-amber-300">• {err}</div>
                                ))}
                                {validationErrors.length > 20 && (
                                    <p className="font-semibold mt-2">...and {validationErrors.length - 20} more warnings</p>
                                )}
                            </div>
                            <p className="text-xs text-amber-700 mt-2">
                                These records were imported but may have data quality issues. Review and correct in Westminster if needed.
                            </p>
                        </div>
                    )}

                    {/* Import Summary */}
                    {importSummary && importSummary.success && (
                        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-green-900 flex items-center gap-2 mb-2">
                                        <Icon name="CheckCircle" className="w-5 h-5" />
                                        Import Successful!
                                    </p>
                                    <div className="text-sm text-green-800 space-y-1">
                                        <p>✓ {importSummary.personnelImported} personnel records imported</p>
                                        <p>✓ {importSummary.qualificationsImported} qualification records imported</p>
                                        {importSummary.warningsCount > 0 && (
                                            <p className="text-amber-700">⚠ {importSummary.warningsCount} warnings (see above)</p>
                                        )}
                                    </div>
                                </div>
                                <button onClick={() => setImportSummary(null)} className="text-green-600 hover:text-green-800">
                                    <Icon name="X" className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="border-2 border-dashed border-slate-300 p-6 rounded-lg text-center hover:bg-slate-50 transition-colors">
                            <p className="font-semibold text-slate-600 mb-2">1. Unit Personnel Report</p>
                            <input type="file" accept=".csv" onChange={(e) => handleFile(e.target.files[0], 'personnel')} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        </div>
                        <div className="border-2 border-dashed border-slate-300 p-6 rounded-lg text-center hover:bg-slate-50 transition-colors">
                            <p className="font-semibold text-slate-600 mb-2">2. Cadet Qualifications Report</p>
                            <input type="file" accept=".csv" onChange={(e) => handleFile(e.target.files[0], 'quals')} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        </div>

                        {/* Logo Uploads Section */}
                        <div className="border-t-2 border-slate-200 pt-4 mt-6">
                            <p className="text-sm font-bold text-slate-700 mb-3">Optional: Upload Logos for Certificates (500x500px recommended)</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Unit Crest */}
                                <div className="border border-slate-200 p-4 rounded-lg">
                                    <p className="text-xs font-semibold text-slate-600 mb-2">Unit Crest</p>
                                    {unitCrestPreview ? (
                                        <div className="relative">
                                            <img src={unitCrestPreview} alt="Unit Crest" className="w-full h-32 object-contain mb-2 border rounded" />
                                            <button onClick={() => removeLogo('crest')} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600">
                                                <Icon name="X" className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="border-2 border-dashed border-slate-300 p-4 rounded text-center h-32 flex items-center justify-center">
                                            <p className="text-xs text-slate-400">Top center</p>
                                        </div>
                                    )}
                                    <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={(e) => handleLogoUpload(e.target.files[0], 'crest')} className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 mt-2"/>
                                </div>

                                {/* SCC Logo */}
                                <div className="border border-slate-200 p-4 rounded-lg">
                                    <p className="text-xs font-semibold text-slate-600 mb-2">SCC Logo</p>
                                    {sccLogoPreview ? (
                                        <div className="relative">
                                            <img src={sccLogoPreview} alt="SCC Logo" className="w-full h-32 object-contain mb-2 border rounded" />
                                            <button onClick={() => removeLogo('scc')} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600">
                                                <Icon name="X" className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="border-2 border-dashed border-slate-300 p-4 rounded text-center h-32 flex items-center justify-center">
                                            <p className="text-xs text-slate-400">Bottom right</p>
                                        </div>
                                    )}
                                    <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={(e) => handleLogoUpload(e.target.files[0], 'scc')} className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 mt-2"/>
                                </div>

                                {/* RMC Logo */}
                                <div className="border border-slate-200 p-4 rounded-lg">
                                    <p className="text-xs font-semibold text-slate-600 mb-2">RMC Logo</p>
                                    {rmcLogoPreview ? (
                                        <div className="relative">
                                            <img src={rmcLogoPreview} alt="RMC Logo" className="w-full h-32 object-contain mb-2 border rounded" />
                                            <button onClick={() => removeLogo('rmc')} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600">
                                                <Icon name="X" className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="border-2 border-dashed border-slate-300 p-4 rounded text-center h-32 flex items-center justify-center">
                                            <p className="text-xs text-slate-400">Bottom left</p>
                                        </div>
                                    )}
                                    <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={(e) => handleLogoUpload(e.target.files[0], 'rmc')} className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 mt-2"/>
                                </div>
                            </div>
                        </div>

                        <button onClick={processFiles} disabled={!personnelFile || !qualsFile || loading} className={`w-full py-3 rounded-lg font-bold text-white transition-all ${(!personnelFile || !qualsFile) ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800 shadow-lg'}`}>
                            {loading ? "Processing..." : "Load Dashboards"}
                        </button>
                    </div>

                    {hasData && (
                        <div className="mt-8 border-t pt-6">
                             <p className="text-sm font-bold text-slate-700 mb-4 text-center">Update Individual Files</p>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                 <div className="border border-slate-200 p-4 rounded-lg">
                                     <p className="text-xs font-semibold text-slate-600 mb-2">Update Personnel File Only</p>
                                     <input type="file" accept=".csv" onChange={(e) => {
                                         setPersonnelFile(e.target.files[0]);
                                         setError(null);
                                     }} className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 mb-2"/>
                                     <button 
                                         onClick={async () => {
                                             if (!personnelFile) return;
                                             setLoading(true);
                                             setError(null);
                                             try {
                                                 const text = await readFile(personnelFile);
                                                 const personnelData = await processPersonnelFile(text);
                                                 onDataLoaded(personnelData, JSON.parse(localStorage.getItem('scc_quals') || '[]'));
                                                 setPersonnelFile(null);
                                             } catch (err) {
                                                 setError(err.message);
                                             } finally {
                                                 setLoading(false);
                                             }
                                         }}
                                         disabled={!personnelFile || loading}
                                         className={`w-full py-2 rounded font-semibold text-xs transition-all ${!personnelFile ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                                     >
                                         {loading ? 'Updating...' : 'Update Personnel'}
                                     </button>
                                 </div>
                                 
                                 <div className="border border-slate-200 p-4 rounded-lg">
                                     <p className="text-xs font-semibold text-slate-600 mb-2">Update Qualifications File Only</p>
                                     <input type="file" accept=".csv" onChange={(e) => {
                                         setQualsFile(e.target.files[0]);
                                         setError(null);
                                     }} className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 mb-2"/>
                                     <button 
                                         onClick={async () => {
                                             if (!qualsFile) return;
                                             setLoading(true);
                                             setError(null);
                                             try {
                                                 const text = await readFile(qualsFile);
                                                 const qualsData = await processQualsFile(text);
                                                 onDataLoaded(JSON.parse(localStorage.getItem('scc_personnel') || '[]'), qualsData);
                                                 setQualsFile(null);
                                             } catch (err) {
                                                 setError(err.message);
                                             } finally {
                                                 setLoading(false);
                                             }
                                         }}
                                         disabled={!qualsFile || loading}
                                         className={`w-full py-2 rounded font-semibold text-xs transition-all ${!qualsFile ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                                     >
                                         {loading ? 'Updating...' : 'Update Qualifications'}
                                     </button>
                                 </div>
                             </div>
                             
                             <p className="text-xs text-slate-500 text-center mb-3">Or clear data and start fresh:</p>
                             <div className="flex gap-4 justify-center">
                                 <button onClick={clearData} className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center gap-2">
                                     <Icon name="RefreshCw" className="w-4 h-4" /> Reset Cadet Data
                                 </button>
                                 <button onClick={wipeAllData} className="text-red-600 hover:text-red-800 text-sm font-semibold flex items-center gap-2">
                                     <Icon name="Trash2" className="w-4 h-4" /> Wipe All Data
                                 </button>
                             </div>
                             <p className="text-xs text-slate-400 mt-2 text-center">Reset keeps your logos. Wipe clears everything.</p>
                        </div>
                    )}

                    {showVideoModal && (
                        <div className="fixed inset-0 bg-slate-900 bg-opacity-75 z-[100] flex items-center justify-center p-4">
                            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden">
                                <div className="p-4 border-b flex justify-between items-center bg-blue-50">
                                    <h3 className="text-xl font-bold text-blue-800">
                                        How to Download Data from Westminster
                                    </h3>
                                    <button onClick={() => setShowVideoModal(false)} className="p-2 rounded-full hover:bg-blue-100 text-slate-600" aria-label="Close video tutorial">
                                        <Icon name="X" className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="bg-black flex justify-center items-center">
                                    <video controls autoPlay className="max-h-[60vh] w-full object-contain">
                                        <source src="media/TS_Dashboard_Instructions.mp4" type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                                    <button onClick={() => setShowVideoModal(false)} className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors">
                                        Close Video
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        };

        // --- NEW COMPONENT: ModuleDrillDown ---
        const ModuleDrillDown = ({ info, onClose }) => {
            if (!info) return null;

            return (
                <div className="fixed inset-0 bg-slate-900 bg-opacity-75 z-[100] flex items-center justify-center p-4" onClick={onClose}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b flex justify-between items-center bg-blue-50 rounded-t-xl">
                            <h3 className="text-xl font-bold text-blue-800">
                                Cadets Needing: {info.module.code}
                            </h3>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-blue-100 text-slate-600">
                                <Icon name="X" className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                            <p className="text-sm font-semibold text-slate-700">Module: {info.module.title}</p>
                            <p className="text-sm text-slate-500 border-b pb-2">Target Rank: <span className="font-bold text-blue-700">{info.targetRank}</span> (Total Needing: {info.cadetsNeeding.length})</p>
                            
                            {info.cadetsNeeding.length === 0 ? (
                                <p className="text-center italic text-slate-400 py-4">All cadets at this rank have completed this module.</p>
                            ) : (
                                <ul className="space-y-1 text-sm">
                                    {info.cadetsNeeding.map((cadet) => (
                                        <li key={cadet.pNumber} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg hover:bg-slate-100">
                                            <span className="font-medium text-slate-800">{cadet.name}</span>
                                            <span className="text-xs text-slate-500">{cadet.pNumber}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end rounded-b-xl">
                            <button onClick={onClose} className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            );
        };

        // --- 3.3 HOME VIEW COMPONENT ---
        const HomeView = ({ personnel }) => {
            const unitName = personnel.length > 0 ? (personnel[0].unit || "Your Unit") : "Sea Cadets";

            return (
                <div className="space-y-8">
                    {/* Welcome Section */}
                    <div className="bg-white p-8 rounded-lg shadow-xl border border-blue-200">
                        <div className="flex items-center gap-6 mb-6">
                            <div className="p-4 bg-blue-100 rounded-full text-blue-800">
                                <Icon name="ShipWheel" className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-extrabold text-blue-900">
                                    Welcome to the {unitName} Training Dashboard!
                                </h2>
                                <p className="text-sm text-blue-600 font-semibold mt-1">
                                    RC2 Complete - Now with Junior Sea Cadets tracking
                                </p>
                            </div>
                        </div>
                        
                        <p className="text-lg text-slate-700 mb-4">
                            This dashboard provides a comprehensive overview of your cadets' training progression, qualifications, and awards. It isn't a replacement for <a href="https://www.defencegateway.mod.uk/home/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-bold underline">Westminster</a>, but it's designed to help your team visualise where cadets stand in relation to the Cadet Training Programme (CTP), Cadet Training Syllabus (CTS), and waterborne proficiencies.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
                            <li>Use <strong>Cadet Focus</strong> to see all achievements and progression for an individual.</li>
                            <li>Use <strong>SCC CTP / RMC CTS Progress</strong> to plan training nights for specific rank groups.</li>
                            <li>Use <strong>Awards</strong> to review recent accomplishments and generate certificates for presentations.</li>
                            <li>Use <strong>Waterborne</strong> to track proficiency levels in all boating activities.</li>
                        </ul>
                        <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 text-sm text-yellow-800 rounded">
                            <p className="font-semibold flex items-center gap-2"><Icon name="AlertCircle" className="w-4 h-4"/> Data Note</p>
                            <p>All data shown here is derived from the CSV reports you uploaded and may not reflect real-time changes if new reports have not been synced.</p>
                        </div>
                    </div>

                    {/* Disclaimer Section */}
                    <div className="mt-10 max-w-4xl mx-auto text-center text-xs text-slate-400 p-4 border-t border-slate-300">
                        <p className="font-semibold mb-1">Disclaimer</p>
                        <p className="mb-2">
                            This app was built independently by volunteers and is not an official MSSC product. It's provided "as is", with no warranty or guarantees offered or implied, and you use it at your own risk. The code is open source, and parts of the solution, documentation, or content may be AI-generated. Always review outputs for accuracy.
                        </p>
                        <p>
                            If you spot a bug, have a feature idea, or make an improvement, please share it so others can benefit. 
                            You can contact James Harbidge at <a href="mailto:jharbidge@mhseacadets.org?subject=TS Dashboard" className="text-blue-500 hover:text-blue-600 underline">jharbidge@mhseacadets.org</a>.
                        </p>
                    </div>
                </div>
            );
        };

        // --- 3.4 AWARDS VIEW COMPONENT (with PDF generation) ---
        const AwardsView = ({ personnel, quals }) => {
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
                 const inSCC = Object.values(SCC_SYLLABUS).some(rank => 
                     Object.values(rank).some(category => 
                         category.some(mod => qualName.includes(mod.code) || qualName === mod.title)
                     )
                 );
                 const inRMC = Object.values(RMC_SYLLABUS).some(rank => 
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
                        const rDate = parseDate(p.rankDate);
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
                        const tos = parseDate(p.tos);
                        const dob = parseDate(p.dob);
                        
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
                    const age = calculateAge(c.dob);
                    return age >= 9 && age <= 11;
                });
                
                juniors.forEach(junior => {
                    const juniorData = getJuniorData();
                    const juniorModules = juniorData.moduleCompletions.filter(m => m.pNumber === junior.pNumber);
                    
                    const redCount = juniorModules.filter(m => m.section === 'red').length;
                    const blueCount = juniorModules.filter(m => m.section === 'blue').length;
                    const greenCount = juniorModules.filter(m => m.section === 'green').length;
                    const yellowCount = juniorModules.filter(m => m.section === 'yellow').length;
                    const stemCount = juniorModules.filter(m => m.section === 'stem').length;
                    
                    const d = new Date();
                    
                    if (redCount >= 15 && !quals?.some(q => q.pNumber === junior.pNumber && q.module.includes("JSC Red Unit Activities Badge"))) {
                        const uniqueId = `${junior.pNumber}-JSCRED-${d.getTime()}`;
                        upcoming.push({
                            cadetName: junior.name,
                            module: "JSC Red Unit Activities Badge",
                            date: d,
                            type: "Award Due",
                            pNumber: junior.pNumber,
                            uniqueId
                        });
                    }
                    
                    if (blueCount >= 15 && !quals?.some(q => q.pNumber === junior.pNumber && q.module.includes("JSC Blue Waterborne Activities Badge"))) {
                        const uniqueId = `${junior.pNumber}-JSCBLUE-${d.getTime()}`;
                        upcoming.push({
                            cadetName: junior.name,
                            module: "JSC Blue Waterborne Activities Badge",
                            date: d,
                            type: "Award Due",
                            pNumber: junior.pNumber,
                            uniqueId
                        });
                    }
                    
                    if (greenCount >= 15 && !quals?.some(q => q.pNumber === junior.pNumber && q.module.includes("JSC Green Outdoor & Recreation Activities Badge"))) {
                        const uniqueId = `${junior.pNumber}-JSCGREEN-${d.getTime()}`;
                        upcoming.push({
                            cadetName: junior.name,
                            module: "JSC Green Outdoor & Recreation Activities Badge",
                            date: d,
                            type: "Award Due",
                            pNumber: junior.pNumber,
                            uniqueId
                        });
                    }
                    
                    if (yellowCount >= 15 && !quals?.some(q => q.pNumber === junior.pNumber && q.module.includes("JSC Yellow Community & Citizenship Activities Badge"))) {
                        const uniqueId = `${junior.pNumber}-JSCYELLOW-${d.getTime()}`;
                        upcoming.push({
                            cadetName: junior.name,
                            module: "JSC Yellow Community & Citizenship Activities Badge",
                            date: d,
                            type: "Award Due",
                            pNumber: junior.pNumber,
                            uniqueId
                        });
                    }
                    
                    if (stemCount >= 8 && !quals?.some(q => q.pNumber === junior.pNumber && q.module.includes("JSC Crest Award"))) {
                        const uniqueId = `${junior.pNumber}-JSCCREST-${d.getTime()}`;
                        upcoming.push({
                            cadetName: junior.name,
                            module: "JSC Crest Award",
                            date: d,
                            type: "Award Due",
                            pNumber: junior.pNumber,
                            uniqueId
                        });
                    }
                    
                    if (stemCount >= 15 && !quals?.some(q => q.pNumber === junior.pNumber && q.module.includes("JSC STEM Unit Activities Badge"))) {
                        const uniqueId = `${junior.pNumber}-JSCSTEM-${d.getTime()}`;
                        upcoming.push({
                            cadetName: junior.name,
                            module: "JSC STEM Unit Activities Badge",
                            date: d,
                            type: "Award Due",
                            pNumber: junior.pNumber,
                            uniqueId
                        });
                    }
                    
                    // Commodore's Broad Pennant - requires all 4 badges awarded + 23 modules each (15 + 8 extra)
                    const hasRedBadge = quals?.some(q => q.pNumber === junior.pNumber && q.module.includes("JSC Red Unit Activities Badge"));
                    const hasBlueBadge = quals?.some(q => q.pNumber === junior.pNumber && q.module.includes("JSC Blue Waterborne Activities Badge"));
                    const hasGreenBadge = quals?.some(q => q.pNumber === junior.pNumber && q.module.includes("JSC Green Outdoor & Recreation Activities Badge"));
                    const hasYellowBadge = quals?.some(q => q.pNumber === junior.pNumber && q.module.includes("JSC Yellow Community & Citizenship Activities Badge"));
                    
                    if (hasRedBadge && hasBlueBadge && hasGreenBadge && hasYellowBadge &&
                        redCount >= 23 && blueCount >= 23 && greenCount >= 23 && yellowCount >= 23 && 
                        !quals?.some(q => q.pNumber === junior.pNumber && q.module.includes("JSC Commodores Broad Pennant"))) {
                        const uniqueId = `${junior.pNumber}-JSCPENNANT-${d.getTime()}`;
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
                
                // Clean unit name - remove anything in parentheses and convert to proper case
                let unitName = personnel.length > 0 ? personnel[0].unit : "";
                unitName = unitName.split('(')[0].trim(); // Remove everything after (
                if (!unitName) unitName = "Unit";
                // Convert to proper case (e.g., "MARKET HARBOROUGH" -> "Market Harborough")
                unitName = unitName.toLowerCase().split(' ').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');
                
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
                        rankForCertificate = getPreviousRank(newRank);
                    }
                    
                    // Format name with appropriate rank abbreviation
                    const formattedName = formatCadetNameWithRank(item.cadetName, rankForCertificate);
                    
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
                    doc.text(`Awarded on: ${formatDate(item.date)}`, 148.5, 155, { align: "center" });

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
                const unitName = personnel.length > 0 ? personnel[0].unit : "Sea Cadets";
                
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
                    const dateStr = item.type === 'Award Due' ? 'Action Required' : formatDate(item.date);
                    doc.text(dateStr, 175, y);
                    
                    // Adjust y based on lines (approx 5mm per line of text)
                    y += (5 * splitTitle.length) + 4; 
                });
                
                doc.save(`SCC_Upcoming_Report_${monthName}.pdf`);
            };

            return (
                <div className="space-y-6">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-amber-500">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-100 rounded-full">
                                <Icon name="Award" className="w-8 h-8 text-amber-700" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-extrabold text-slate-900">Awards</h2>
                                <p className="text-slate-600">Track achievements, promotions, and upcoming awards</p>
                            </div>
                        </div>
                    </div>
                    
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
                                                         <p className="text-[10px] text-slate-400 mt-1 text-right">{formatDate(award.date)}</p>
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
                                                             {award.type === 'Award Due' ? 'Action Required' : `Due: ${formatDate(award.date)}`}
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

        // --- 3.5 WATERBORNE VIEW COMPONENT ---
        const WaterborneView = ({ personnel, qualsData }) => {
            const [filterActivity, setFilterActivity] = useState("Swim");
            const activityOptions = ["Swim", "Paddle", "Row", "Sail", "Power", "Windsurf", "Shorebased", "Offshore"];
            
            // Filter to cadets only (exclude adult volunteers with CV or letter-number-letter P-Numbers)
            const cadetsOnly = personnel.filter(p => {
                const pNum = p.pNumber || "";
                const cleanPNum = pNum.replace(/[\s-]/g, '');
                // Exclude adult volunteer formats: CV##### or L######L
                const isAdultCVFormat = /^CV\d+$/i.test(cleanPNum);
                const isAdultLetterFormat = /^[A-Z]\d{6,7}[A-Z]$/i.test(cleanPNum);
                return !isAdultCVFormat && !isAdultLetterFormat;
            });
            
            const sortedCadets = useMemo(() => [...cadetsOnly].sort((a, b) => a.name.localeCompare(b.name)), [cadetsOnly]);
            
            // Modified to retrieve the full record, not just check existence
            const getWaterborneRecord = (cadet, mod) => {
                return qualsData.find(q => q.pNumber === cadet.pNumber && ((q.module.includes(mod.title)) || (mod.alts && mod.alts.some(alt => q.module.includes(alt)))));
            };
            
            // Define helper locally so it has access to the qualsData prop scope
            const hasQualContaining = (cadet, str) => qualsData.some(q => q.pNumber === cadet.pNumber && q.module && q.module.toLowerCase().includes(str.toLowerCase()));

            const getCadetStatusColor = (cadet) => {
                // Check if they already have the award
                // Relaxed string matching: "Master Coxswain" instead of "Master Coxswain Award" to catch variations
                const hasMasterAward = hasQualContaining(cadet, "Master Coxswain");
                if (hasMasterAward) return "status-master-awarded";
                // Relaxed string matching: "Coxswain Award" or "SCC Coxswain"
                const hasCoxswainAward = hasQualContaining(cadet, "Coxswain Award") || hasQualContaining(cadet, "SCC Coxswain");
                if (hasCoxswainAward) return "status-cox-awarded";

                let proficienciesMet = 0;
                if (hasQualContaining(cadet, "Rowing Coxswain") || hasQualContaining(cadet, "SCC Coxswain") || hasQualContaining(cadet, "Row 3")) proficienciesMet++;
                if (hasQualContaining(cadet, "Paddle Explore")) proficienciesMet++;
                if (hasQualContaining(cadet, "Stage 4")) proficienciesMet++;
                if (hasQualContaining(cadet, "Windsurfing") && (hasQualContaining(cadet, "Stage 2") || hasQualContaining(cadet, "Stage 3") || hasQualContaining(cadet, "Stage 4"))) proficienciesMet++;

                const meetsCoxswainCriteria = proficienciesMet >= 2;
                let meetsMasterCriteria = false;

                if (meetsCoxswainCriteria) {
                    const hasPB2 = hasQualContaining(cadet, "Powerboat Level 2") || hasQualContaining(cadet, "Powerboat L2") || hasQualContaining(cadet, "Level 2 Planing") || hasQualContaining(cadet, "Level 2 Disp");
                    const hasENS = hasQualContaining(cadet, "Essential Navigation");
                    const hasDaySkipper = hasQualContaining(cadet, "Day Skipper") || hasQualContaining(cadet, "Watch Leader");

                    if (hasPB2) {
                        const hasNavP1 = hasENS || hasDaySkipper;
                        if (hasNavP1) {
                            const hasP1Option = hasQualContaining(cadet, "Assistant Rowing Instructor") || hasQualContaining(cadet, "CST") || hasQualContaining(cadet, "FSRT") || hasQualContaining(cadet, "Foundation Safety") || hasQualContaining(cadet, "PSRC") || hasQualContaining(cadet, "Paddle Safety") || hasQualContaining(cadet, "Assistant Instructor") || (hasQualContaining(cadet, "Assistant") && hasQualContaining(cadet, "Windsurf"));
                            if (hasP1Option) meetsMasterCriteria = true;
                        }
                        if (!meetsMasterCriteria && hasENS) {
                            const hasP2Option = hasQualContaining(cadet, "Paddlesport Instructor") || (hasQualContaining(cadet, "Dinghy Instructor") && !hasQualContaining(cadet, "Assistant")) || (hasQualContaining(cadet, "Windsurfing Instructor") && !hasQualContaining(cadet, "Assistant")) || (hasQualContaining(cadet, "Powerboat Instructor") && !hasQualContaining(cadet, "Assistant"));
                            if (hasP2Option) meetsMasterCriteria = true;
                        }
                    }
                }

                if (meetsMasterCriteria) return "status-master-pending";
                if (meetsCoxswainCriteria) return "status-cox-pending";
                return "";
            };

            return (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-sky-500">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-sky-100 rounded-full">
                                    <Icon name="Anchor" className="w-8 h-8 text-sky-700" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-extrabold text-slate-900">Waterborne Qualifications</h2>
                                    <p className="text-slate-600">Track all waterborne proficiencies and awards</p>
                                </div>
                            </div>
                            <div className="w-full md:w-48">
                                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Filter Activity</label>
                                <select value={filterActivity} onChange={(e) => setFilterActivity(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg shadow-sm text-sm font-semibold">
                                    {activityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3 text-xs">
                            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#add8e6] border border-black"></span> Coxswain (Pending)</div>
                                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#003366]"></span> Coxswain (Awarded)</div>
                                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#ffffe0] border border-black"></span> Master (Pending)</div>
                                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#ffd700] border border-black"></span> Master (Awarded)</div>
                            </div>
                    </div>
                    <div className="bg-white rounded-lg shadow overflow-hidden border border-slate-200">
                        <div className="planner-container">
                            <table className="planner-table w-full text-xs text-left border-collapse">
                                <thead>
                                    <tr>
                                        <th className="px-2 py-2 bg-slate-100 border-b border-r border-slate-200 sticky left-0 z-10 w-48 min-w-[150px] font-bold text-slate-700">Cadet Name</th>
                                        {Object.entries(WATER_SYLLABUS).filter(([c]) => c === filterActivity).map(([c, m]) => <React.Fragment key={c}>{m.map((mod, i) => <th key={mod.code} className="px-2 py-2 bg-slate-50 border-b border-slate-200 text-center font-semibold text-slate-600 min-w-[80px]" title={mod.title}><div className="flex flex-col items-center"><span className="text-[10px] text-slate-500 uppercase mb-1">{c}</span><span className="truncate max-w-[90px]">{mod.code}</span></div></th>)}</React.Fragment>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedCadets.map(cadet => (
                                        <tr key={cadet.pNumber} className="hover:bg-slate-50 border-b border-slate-100 last:border-0 h-8">
                                            <td className={`px-2 py-1 border-r border-slate-200 font-medium text-slate-700 sticky left-0 z-10 ${getCadetStatusColor(cadet)}`}>{cadet.name} <span className="text-[9px] opacity-75 ml-1">({cadet.rank})</span></td>
                                            {Object.entries(WATER_SYLLABUS).filter(([c]) => c === filterActivity).map(([c, m]) => (
                                                <React.Fragment key={c}>
                                                    {m.map(mod => {
                                                        const record = getWaterborneRecord(cadet, mod);
                                                        const passed = !!record;
                                                        return (
                                                            <td key={mod.code} className={`px-1 py-1 text-center border-r border-slate-50 last:border-0 ${passed ? 'bg-passed' : ''}`}>
                                                                {passed && (
                                                                    <span className="text-xs text-white font-bold block leading-tight">
                                                                        {record.date ? formatDate(record.date) : 'Done'}
                                                                    </span>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </React.Fragment>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            );
        };
        
        // --- 3.6 CADET FOCUS COMPONENT ---
        const CadetFocus = ({ personnel, qualsData }) => {
            // Filter to only show cadets aged 12-17 (not juniors under 12, not adults 18+)
            const cadets = useMemo(() => personnel.filter(c => {
                if (!c.dob) return false; // Exclude if no DOB - can't determine age
                const age = calculateAge(c.dob);
                return age !== "Unknown" && age >= 12 && age < 18;
            }), [personnel]);
            
            const [selectedCadetPNum, setSelectedCadetPNum] = useState(cadets.length > 0 ? cadets[0].pNumber : "");
            
            // Force reset if selected cadet is not in list (e.g. new file load)
            useEffect(() => {
                if (cadets.length > 0 && (!selectedCadetPNum || !cadets.find(p => p.pNumber === selectedCadetPNum))) {
                    setSelectedCadetPNum(cadets[0].pNumber);
                }
            }, [cadets, selectedCadetPNum]);
            
            const sortedPersonnel = useMemo(() => [...cadets].sort((a, b) => a.name.localeCompare(b.name)), [cadets]);
            const selectedCadet = useMemo(() => cadets.find(p => p.pNumber === selectedCadetPNum), [cadets, selectedCadetPNum]);
            
            const cadetAge = useMemo(() => selectedCadet?.dob ? calculateAge(selectedCadet.dob) : "Unknown", [selectedCadet]);
            const cadetAgeClass = useMemo(() => selectedCadet?.dob ? getCadetAgeColor(selectedCadet.dob) : "", [selectedCadet]);

            // Get Rank Images
            const rankImages = useMemo(() => {
                if(!selectedCadet) return null;
                return RANK_IMG_MAP[selectedCadet.rank] || null;
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

                const isRMC = RMC_RANK_ORDER.includes(selectedCadet.rank) || 
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
                        
                        // --- 1. Standardize mapping to BADGE_MAP keys ---
                        
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
                        if (!BADGE_MAP[mapKey] && BADGE_MAP[highestAward]) {
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
                          if (!BADGE_MAP[mapKey] && BADGE_MAP[highestAward]) {
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

            const CADET_FOCUS_WATERBORNE_HIERARCHY = {
                "General": ["Master Coxswain Award", "Coxswain Award"],
                "Rowing": ["SCC Rowing Instructor", "Rowing Instructor", "Rowing Coxswswain", "Rowing Supervised Coxswain", "Rowing Competent Crew", "SCC Row Coxswain Module"], 
                "Paddlesport": ["BC Paddlesport Instructor", "BC Paddle Discipline Specific", "BC Paddle Safety & Rescue Course (PSRC)", "BC Paddle Explore Award", "BC Paddle Discover Award"],
                "Sailing": ["Dinghy Instructor", "RYA Dinghy Instructor", "Dinghy - RYA Instructor", "Sail - RYA Sailing with Spinnakers", "Sail - RYA Seamanship Skills", "Sail - RYA Start Racing", "Sail - RYA Performance Sailing", "Sail - RYA Day Sailing", "Sailing Stage 4", "Sailing Stage 3", "Sailing Stage 2", "Sail - RYA YSS Stage 4", "Sail - RYA YSS Stage 3", "Sail - RYA YSS Stage 2"],
                "Windsurfing": ["RYA Start Windsurfing Instructor", "Windsurfing - RYA Start Windsurfing Instructor", "Wind - RYA YouthWS - Stage 4", "Wind - RYA YouthWS - Stage 3", "Wind - RYA YouthWS - Stage 2", "Wind - RYA YouthWS - Stage 1"],
                "Powerboat": ["RYA Powerboat Instructor", "Powerboat - RYA Powerboat Instructor", "Powerboat - RYA Powerboat Intermediate", "RYA Powerboat Level 2", "RYA Powerboat Level 1"],
                "Offshore Power": ["Offshore - Power Watch Leader", "Offshore - Power Seaman", "Offshore - Power Grade 2", "Offshore - Power Grade 1"],
                "Offshore Sail": ["Offshore - Sail Watch Leader", "Offshore - Sail Seaman", "Offshore - Sail Grade 2", "Offshore - Sail Grade 1"]
            };

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
                SCC_RANK_ORDER.forEach(r => ctpGrouped[r] = []);
                RMC_RANK_ORDER.forEach(r => ctsGrouped[r] = []);
                const WB_ORDER = ["Rowing", "Paddling", "Sailing", "Windsurfing", "Powerboat"];
                WB_ORDER.forEach(d => waterborneGrouped[d] = []);

                const getSccRank = (modName) => {
                    for (const rank of SCC_RANK_ORDER) {
                        if (SCC_SYLLABUS[rank]) {
                            for (const cat of Object.values(SCC_SYLLABUS[rank])) {
                                if (cat.some(m => modName.includes(m.code) || modName === m.title)) return rank;
                            }
                        }
                    }
                    return null;
                };

                const getRmcRank = (modName) => {
                    for (const rank of RMC_RANK_ORDER) {
                        if (RMC_SYLLABUS[rank]) {
                            for (const cat of Object.values(RMC_SYLLABUS[rank])) {
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
                    ctpKeys: SCC_RANK_ORDER.filter(r => ctpGrouped[r] && ctpGrouped[r].length > 0), 
                    ctsKeys: RMC_RANK_ORDER.filter(r => ctsGrouped[r] && ctsGrouped[r].length > 0), 
                    wbKeys: WB_ORDER.filter(k => waterborneGrouped[k] && waterborneGrouped[k].length > 0) 
                };
            }, [qualsData, selectedCadetPNum, selectedCadet]);

            // Check if there are no cadets aged 12-17
            if (cadets.length === 0) {
                return (
                    <div className="p-8">
                        <div className="bg-white rounded-lg shadow p-8 text-center">
                            <Icon name="User" className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                            <h2 className="text-2xl font-bold text-slate-700 mb-2">No Cadets Found (Ages 12-17)</h2>
                            <p className="text-slate-600">
                                Cadet Focus shows cadets aged 12-17 only.
                            </p>
                            <p className="text-sm text-slate-500 mt-4">
                                Juniors (under 12) have their own dedicated Junior Focus page.
                                Adults (18+) are not yet supported in this dashboard.
                            </p>
                        </div>
                    </div>
                );
            }

            if (!selectedCadet) return <div className="p-8 text-center text-slate-500">Please load data and select a cadet.</div>;

            return (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-indigo-500">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-indigo-100">
                                    <Icon name="User" className="w-8 h-8 text-indigo-700"/>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-extrabold text-slate-900">Cadet Focus</h2>
                                    <p className="text-slate-600">Detailed view of achievements and awards</p>
                                </div>
                            </div>
                            <div className="w-full md:w-64">
                                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Select Cadet</label>
                                <select className="w-full p-2 border border-slate-300 rounded-lg shadow-sm text-sm font-semibold" value={selectedCadetPNum || ""} onChange={(e) => setSelectedCadetPNum(e.target.value)}>
                                    {sortedPersonnel.map(p => <option key={p.pNumber} value={p.pNumber}>{p.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
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
                                    {rankImages || selectedCadet.rank === "Able Junior Cadet" ? (
                                        <>
                                            {selectedCadet.rank === "Able Junior Cadet" || rankImages?.count === 2 ? (
                                                <div className="flex gap-1">
                                                    <img src="media/scc_junior_star.webp" className="h-12 w-auto object-contain shadow-sm" alt="Rank Star 1" onError={(e) => e.target.style.display = 'none'} />
                                                    <img src="media/scc_junior_star.webp" className="h-12 w-auto object-contain shadow-sm" alt="Rank Star 2" onError={(e) => e.target.style.display = 'none'} />
                                                </div>
                                            ) : (
                                                <>
                                                    {rankImages?.sleeve && <img src={`media/${rankImages.sleeve}`} className="h-12 w-auto object-contain shadow-sm" alt="Sleeve Rank" title="Sleeve Badge" onError={(e) => e.target.style.display = 'none'} />}
                                                    {rankImages?.slide && <img src={`media/${rankImages.slide}`} className="h-12 w-auto object-contain shadow-sm" alt="Shoulder Slide" title="Shoulder Slide" onError={(e) => e.target.style.display = 'none'} />}
                                                </>
                                            )}
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
                                            <p className="text-[10px] text-slate-500 mt-1">{formatDate(spec.date)}</p>
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
                                            <p className="text-[10px] text-slate-500 mt-1">{formatDate(prof.date)}</p>
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
                                                <p className="text-[10px] text-slate-500 mt-1">{formatDate(wb.date)}</p>
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
                                                            <span className="text-slate-400 text-[10px]">{formatDate(q.date)}</span>
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
                                                            <span className="text-slate-400 text-[10px]">{formatDate(q.date)}</span>
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
                                                            <span className="text-slate-400 text-[10px]">{formatDate(q.date)}</span>
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
                                                    <span className="text-slate-400 text-[10px]">{formatDate(q.date)}</span>
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

        // --- 3.7 TRAINING PLANNER COMPONENT (SCC CTP / RMC CTS) ---
        const TrainingPlanner = ({ personnel, getCadetProgress, qualsData, title, rankOrder, syllabus, colorTheme = "indigo", iconName, onModuleClick }) => {
            const [selectedRank, setSelectedRank] = useState(rankOrder[0]);
            const cadetsAtRank = useMemo(() => personnel.filter(p => p.rank === selectedRank), [personnel, selectedRank]);
            const currentSyllabus = syllabus[selectedRank];
            
            // Fix for displaying modules even if no cadets are at this rank
            const hasCadets = cadetsAtRank.length > 0;
            // Define the list for table columns (either real cadets or a single placeholder)
            const cadetsForColumns = hasCadets ? cadetsAtRank : [{ pNumber: 'PLACEHOLDER', name: 'No Cadets at Rank', rank: selectedRank }];

            const getModuleRecord = (cadet, mod) => {
                if (!cadet || !mod) return null;
                const cleanModCode = mod.code.toLowerCase();
                const cleanModTitle = mod.title.toLowerCase();
                const found = qualsData.find(q => {
                    if (q.pNumber !== cadet.pNumber || !q.module) return false;
                    const qMod = q.module.toLowerCase();
                    return qMod.includes(cleanModCode) || qMod === cleanModTitle || qMod.includes(cleanModTitle);
                });
                return found || null;
            };

            const handleModuleClick = (mod, category) => {
                // Only allow click if there are actual cadets to drill down into
                if (!hasCadets) return;

                const cadetsNeeding = cadetsAtRank
                    .filter(c => !getModuleRecord(c, mod))
                    .map(c => ({ name: c.name, pNumber: c.pNumber }));

                onModuleClick({ ...mod, category }, selectedRank, cadetsNeeding);
            };

            if (!currentSyllabus) {
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-indigo-500">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`p-3 rounded-full ${colorTheme === "green" ? "bg-green-100" : "bg-indigo-100"}`}>
                                    <Icon name={iconName || "FileText"} className={`w-8 h-8 ${colorTheme === "green" ? "text-green-700" : "text-indigo-700"}`} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-extrabold text-slate-900">{title}</h2>
                                    <p className="text-slate-600">No syllabus data available</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-semibold text-slate-700">Select target rank:</label>
                                <select value={selectedRank} onChange={(e) => setSelectedRank(e.target.value)} className="p-2 border border-slate-300 rounded-lg shadow-sm">
                                    {rankOrder.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="text-center py-12 bg-white rounded border border-dashed border-slate-300 text-slate-400">
                             No syllabus defined for {selectedRank}.
                        </div>
                    </div>
                );
            }

            // PDF Export Function
            const exportToPDF = () => {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
                
                const unitName = personnel.length > 0 ? personnel[0].unit : "Unit";
                
                // Header
                doc.setFont("helvetica", "bold");
                doc.setFontSize(16);
                doc.text(`${title} - ${selectedRank}`, 148.5, 15, { align: "center" });
                
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.text(unitName, 148.5, 22, { align: "center" });
                doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 148.5, 27, { align: "center" });
                
                // Calculate column widths
                const startY = 35;
                const moduleColWidth = 70;
                const availableWidth = 297 - moduleColWidth - 10;
                const cadetColWidth = cadetsForColumns.length > 0 ? Math.min(25, availableWidth / cadetsForColumns.length) : 20;
                
                // Table Headers
                doc.setFontSize(7);
                doc.setFont("helvetica", "bold");
                
                // Module column header
                doc.rect(5, startY, moduleColWidth, 25);
                doc.text("Module", 7, startY + 13);
                
                // Cadet column headers (vertical text)
                cadetsForColumns.forEach((cadet, idx) => {
                    if (cadet.pNumber === 'PLACEHOLDER') return;
                    
                    const x = 5 + moduleColWidth + (idx * cadetColWidth);
                    doc.rect(x, startY, cadetColWidth, 25);
                    
                    // Full surname, rotated 90 degrees - centered horizontally, starts from bottom
                    const surname = cadet.name.split(',')[0];
                    // Position text at exact center of column width, bottom of header box
                    const centerX = x + (cadetColWidth / 2);
                    const bottomY = startY + 23; // Near bottom of 25mm header
                    doc.text(surname, centerX, bottomY, { 
                        align: "left",
                        angle: 90
                    });
                });
                
                // Table Body
                let currentY = startY + 25;
                doc.setFont("helvetica", "normal");
                doc.setFontSize(7);
                
                if (currentSyllabus) {
                    Object.entries(currentSyllabus).forEach(([category, modules]) => {
                        // Category header
                        if (currentY > 185) {
                            doc.addPage();
                            currentY = 20;
                        }
                        
                        doc.setFont("helvetica", "bold");
                        doc.setFillColor(220, 220, 220);
                        doc.rect(5, currentY, moduleColWidth + (cadetsForColumns.length * cadetColWidth), 5, 'F');
                        doc.text(category, 7, currentY + 3.5);
                        currentY += 5;
                        doc.setFont("helvetica", "normal");
                        
                        modules.forEach(mod => {
                            if (currentY > 185) {
                                doc.addPage();
                                currentY = 20;
                            }
                            
                            const rowHeight = 6;
                            
                            // Module code and title
                            doc.rect(5, currentY, moduleColWidth, rowHeight);
                            const moduleText = `${mod.code}: ${mod.title}`;
                            const truncated = moduleText.length > 50 ? moduleText.substring(0, 47) + "..." : moduleText;
                            doc.text(truncated, 7, currentY + 4);
                            
                            // Completion status for each cadet
                            cadetsForColumns.forEach((cadet, cIdx) => {
                                if (cadet.pNumber === 'PLACEHOLDER') return;
                                
                                const x = 5 + moduleColWidth + (cIdx * cadetColWidth);
                                doc.rect(x, currentY, cadetColWidth, rowHeight);
                                
                                const record = getModuleRecord(cadet, mod);
                                if (record) {
                                    doc.setFillColor(13, 172, 80);
                                    doc.rect(x, currentY, cadetColWidth, rowHeight, 'F');
                                    doc.setTextColor(255, 255, 255);
                                    doc.text("✓", x + cadetColWidth/2, currentY + 4, { align: "center" });
                                    doc.setTextColor(0, 0, 0);
                                }
                            });
                            
                            currentY += rowHeight;
                        });
                    });
                }
                
                // Summary
                doc.setFont("helvetica", "bold");
                doc.setFontSize(8);
                currentY += 5;
                if (currentY > 185) {
                    doc.addPage();
                    currentY = 20;
                }
                doc.text("Progress Summary:", 7, currentY);
                currentY += 5;
                
                doc.setFont("helvetica", "normal");
                doc.setFontSize(7);
                cadetsForColumns.forEach((cadet, idx) => {
                    if (cadet.pNumber === 'PLACEHOLDER') return;
                    
                    const progress = getCadetProgress(cadet);
                    const shortName = cadet.name.split(',')[0];
                    doc.text(`${shortName}: ${progress.percentage}%`, 7 + (idx * 45), currentY);
                    if ((idx + 1) % 6 === 0) currentY += 4;
                });
                
                const filename = `${title.replace(/\s+/g, '_')}_${selectedRank.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
                doc.save(filename);
            };

            return (
                <div className="space-y-6">
                    <div className={`bg-white rounded-lg shadow-xl p-6 border-l-4 ${colorTheme === "green" ? "border-green-500" : "border-indigo-500"}`}>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${colorTheme === "green" ? "bg-green-100" : "bg-indigo-100"}`}>
                                    <Icon name={iconName || "FileText"} className={`w-8 h-8 ${colorTheme === "green" ? "text-green-700" : "text-indigo-700"}`} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-extrabold text-slate-900">{title}</h2>
                                    <p className="text-slate-600">Plan training for cadets at selected rank</p>
                                </div>
                            </div>
                            <div className="flex gap-2 items-end">
                                <div className="w-full md:w-64">
                                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Plan training for cadets currently ranked</label>
                                    <select value={selectedRank} onChange={(e) => setSelectedRank(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg shadow-sm font-semibold">
                                        {rankOrder.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <button
                                    onClick={exportToPDF}
                                    className={`px-3 py-2 ${colorTheme === "green" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"} text-white rounded-lg font-semibold text-xs transition-all flex items-center gap-1 whitespace-nowrap`}
                                >
                                    <Icon name="FileDown" className="w-3 h-3" />
                                    Export PDF
                                </button>
                            </div>
                        </div>
                    </div>
                        <div className="bg-white rounded-lg shadow overflow-hidden border border-slate-200">
                            <div className="planner-container">
                                <table className="planner-table w-full text-xs text-left border-collapse">
                                    <thead>
                                            <tr>
                                                <th className="px-2 py-2 bg-slate-100 border-b border-r border-slate-200 sticky left-0 z-10 w-48 min-w-[150px] font-bold text-slate-700">Module / Cadet</th>
                                                {cadetsForColumns.map(c => {
                                                    const ageClass = getCadetAgeColor(c.dob); // Apply age color to header cell
                                                    if (c.pNumber === 'PLACEHOLDER') {
                                                        return <th key={c.pNumber} className="px-1 py-2 bg-slate-50 border-b border-slate-200 text-center font-semibold text-slate-600 min-w-[100px]"><div className="flex flex-col items-center"><span className="text-xs text-slate-400">No Cadets at Rank</span></div></th>;
                                                    }
                                                    // Existing logic for real cadets
                                                    const progress = getCadetProgress(c);
                                                    return <th key={c.pNumber} className={`px-1 py-2 bg-slate-50 border-b border-slate-200 text-center font-semibold text-slate-600 min-w-[100px] ${ageClass}`}><div className="flex flex-col items-center"><span className="truncate max-w-[90px]">{c.name.split(',')[0]}</span><span className="text-[9px] text-slate-400 font-normal mb-1">{c.name.split(',')[1]}</span><div className="w-full px-2"><div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-0.5"><div className={`h-full ${progress.percentage === 100 ? 'bg-green-500' : progress.percentage > 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{width: `${progress.percentage}%`}}></div></div><span className="text-[9px] font-bold text-slate-500">{progress.percentage}%</span></div></div></th>
                                                })}
                                            </tr>
                                    </thead>
                                    <tbody>
                                            {currentSyllabus && Object.entries(currentSyllabus).map(([category, modules]) => <React.Fragment key={category}><tr className="bg-slate-100"><td colSpan={cadetsForColumns.length + 1} className="px-2 py-1 font-bold text-[10px] text-slate-500 uppercase border-y border-slate-200 tracking-wider">{category}</td></tr>{modules.map(mod => <tr key={mod.code} className="hover:bg-slate-50 border-b border-slate-100 last:border-0 h-8">
                                            <td 
                                                className={`cursor-pointer px-2 py-1 border-r border-slate-200 font-medium text-slate-700 sticky left-0 z-10 bg-white !important ${hasCadets ? 'hover:bg-blue-50 transition-colors' : ''}`}
                                                title={hasCadets ? `Click to see cadets needing ${mod.title}` : mod.title}
                                                onClick={() => handleModuleClick(mod, category)}
                                            >
                                                <span className="font-bold text-blue-600 mr-1">{mod.code}</span><span className="text-[10px] text-slate-500 truncate max-w-[120px] inline-block align-middle">{mod.title}</span>
                                            </td>
                                            {cadetsForColumns.map(c => {
                                                if (c.pNumber === 'PLACEHOLDER') {
                                                     return <td key={`${c.pNumber}-${mod.code}`} className={`px-1 py-1 text-center border-r border-slate-50 last:border-0`}>-</td>;
                                                }
                                                // Existing logic for real cadets
                                                const record = getModuleRecord(c, mod);
                                                const passed = !!record;
                                                return (
                                                    <td key={`${c.pNumber}-${mod.code}`} className={`px-1 py-1 text-center border-r border-slate-50 last:border-0 ${passed ? 'bg-passed' : ''}`}>
                                                        {passed ? (
                                                            <span className="text-[10px] text-white font-bold block leading-tight">{record.date ? formatDate(record.date) : 'Done'}</span>
                                                        ) : (
                                                            <div className="flex justify-center opacity-10"><div className="w-1 h-1 rounded-full bg-slate-400"></div></div>
                                                        )}
                                                    </td>
                                                );
                                            })}</tr>)}</React.Fragment>)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                </div>
            );
        };

        // --- 3.8 TRAINING SUGGESTIONS COMPONENT ---
        const TrainingSuggestions = ({ personnel, getCadetProgress, qualsData }) => {
            const [selectedRank, setSelectedRank] = useState(SCC_RANK_ORDER[0]);
            const ALL_RANKS = [...SCC_RANK_ORDER, ...RMC_RANK_ORDER];
            const cadetsAtRank = useMemo(() => personnel.filter(p => p.rank === selectedRank), [personnel, selectedRank]);
            
            const suggestions = useMemo(() => {
                if (!cadetsAtRank.length) return [];
                const isRMC = RMC_RANK_ORDER.includes(selectedRank);
                const syllabus = isRMC ? RMC_SYLLABUS : SCC_SYLLABUS;
                const currentSyllabus = syllabus[selectedRank];
                if (!currentSyllabus) return [];
                
                const demandMap = new Map();
                const hasPassed = (c, code) => qualsData.some(q => q.pNumber === c.pNumber && q.module.includes(code));
                
                cadetsAtRank.forEach(c => {
                    Object.values(currentSyllabus).forEach(cat => {
                        cat.forEach((mod, idx) => {
                            if (!hasPassed(c, mod.code)) {
                                // Simple prereq check: needs previous module in category
                                if (idx === 0 || hasPassed(c, cat[idx-1].code)) {
                                    const entry = demandMap.get(mod.code) || { ...mod, count: 0, students: [] };
                                    entry.count++;
                                    entry.students.push(c.name);
                                    demandMap.set(mod.code, entry);
                                }
                            }
                        });
                    });
                });
                return Array.from(demandMap.values()).sort((a,b) => b.count - a.count).slice(0, 12);
            }, [cadetsAtRank, qualsData, selectedRank]);

            return (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-purple-500">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-purple-100 rounded-full">
                                <Icon name="Lightbulb" className="w-8 h-8 text-purple-700" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-extrabold text-slate-900">Training Plan</h2>
                                <p className="text-slate-600">12 most-needed modules for selected rank</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-semibold text-slate-700">Target Rank:</label>
                            <select value={selectedRank} onChange={(e) => setSelectedRank(e.target.value)} className="p-2 border border-slate-300 rounded-lg shadow-sm text-sm">{ALL_RANKS.map(r => <option key={r} value={r}>{r}</option>)}</select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {suggestions.length === 0 ? <div className="col-span-full text-center py-12 bg-white rounded border border-dashed text-slate-400">No suggestions.</div> : suggestions.map(mod => (
                            <div key={mod.code} className="bg-white p-4 rounded shadow border-l-4 border-purple-500">
                                <div className="flex justify-between mb-2"><h3 className="font-bold">{mod.code}</h3><span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded-full">{mod.count} Cadets</span></div>
                                <p className="text-sm text-slate-600 truncate mb-2">{mod.title}</p>
                                <div className="text-[10px] text-slate-400">Ready: {mod.students.slice(0,3).map(s=>s.split(',')[0]).join(', ')}{mod.students.length>3 && '...'}</div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        };

        // --- JUNIOR PROGRESS VIEW (Grid Chart) ---
        const JuniorProgressView = ({ personnel }) => {
            const [selectedSection, setSelectedSection] = useState('red');
            const juniorData = getJuniorData();
            const juniors = personnel.filter(c => isJunior(c.dob, c.pNumber, c.rank));
            
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
            
            // CORRECTED: 341 official MSSC Junior modules (was 333 fabricated names)
            const allModules = [
                // ========== RED SECTION - Unit Activities (73 modules) ==========
                // Unit Induction (6 modules - all core)
                {s:'red',c:'1',n:'Unit Induction: Tour of Unit',core:true},
                {s:'red',c:'1.1',n:'Unit Induction: Unit Fire Drill',core:true},
                {s:'red',c:'1.2',n:'Unit Induction: Map Out Your Unit Treasure Hunt',core:true},
                {s:'red',c:'1.3',n:'Unit Induction: What\'s Important To You?',core:true},
                {s:'red',c:'1.4',n:'Unit Induction: Uniformed Art',core:true},
                {s:'red',c:'1.5',n:'Unit Induction: JSC Badges/Brassard, Ranks and Rates',core:true},

                // Who's Who (4 modules)
                {s:'red',c:'2',n:'Who is who? - Two Questions & A Funny'},
                {s:'red',c:'2.1',n:'Paper Planes'},
                {s:'red',c:'2.2',n:'Names and Beanbags!'},
                {s:'red',c:'2.3',n:'Mini Me'},
                {s:'red',c:'3',n:'Unit Who\'s Who: Say Cheese'},

                // Ceremonial (4 modules)
                {s:'red',c:'4',n:'Ceremonial: Moving To The Beat With Basic Drill'},
                {s:'red',c:'4.1',n:'Who\'s Calling? Ceremonial Unit Calls (Piping)'},
                {s:'red',c:'4.2',n:'Colours, Evening Colours & Naval Customs: Ceremonial'},
                {s:'red',c:'4.3',n:'Treat Yourself: Ceremonial'},

                // Uniform (1 module - core)
                {s:'red',c:'5',n:'Looking Smart and the Part: Junior Sea Cadet Uniform',core:true},

                // Safeguarding (1 module - core)
                {s:'red',c:'6',n:'Introduction to Cadet Safeguarding Pocket Guide: SHOUT',core:true},

                // Team Effort (6 modules)
                {s:'red',c:'7',n:'Team Effort: Organising Unit Activities'},
                {s:'red',c:'7.1',n:'Oh, The Activities You Can Do... Unit Activities'},
                {s:'red',c:'7.2',n:'I Promise to...? Ready Aye Ready'},
                {s:'red',c:'7.3',n:'Unit Elevator Pitch On Paper'},
                {s:'red',c:'7.4',n:'Unit Advert'},
                {s:'red',c:'7.5',n:'Theme Tune'},

                // Activities (4 modules)
                {s:'red',c:'8',n:'How\'s Your Aim?'},
                {s:'red',c:'9',n:'Tonight\'s Guest Is...A Royal Marines Cadet'},
                {s:'red',c:'9.1',n:'Royal Marines Cadets'},
                {s:'red',c:'9.2',n:'Heads Up: Royal Marines Cadets Activities'},
                {s:'red',c:'10',n:'Keeping a Log: Scrap Book Memories'},

                // Communications (6 modules)
                {s:'red',c:'11',n:'What Do We Want to Say? Passing a Message Using Flags'},
                {s:'red',c:'11.1',n:'What is the Famous Message? Lord Nelson'},
                {s:'red',c:'11.2',n:'Codebreaker: Morse'},
                {s:'red',c:'11.3',n:'What\'s your position? Over?'},
                {s:'red',c:'11.4',n:'Turn up The Radios'},
                {s:'red',c:'11.5',n:'Phonetic Alphabet'},

                // Catering (5 modules)
                {s:'red',c:'12',n:'Experimental Chocolate Crispies'},
                {s:'red',c:'12.1',n:'Refreshing Apple & Ginger'},
                {s:'red',c:'12.2',n:'Chefs\' Sweet Tooth'},
                {s:'red',c:'12.3',n:'Chefs Savoury Tooth'},
                {s:'red',c:'12.4',n:'Chefs Cuppa'},

                // Emergency Services (2 modules)
                {s:'red',c:'13',n:'Who\'s Who and Can They Help Me?'},
                {s:'red',c:'13.1',n:'Emergency Visits'},

                // International (1 module)
                {s:'red',c:'14',n:'How International Are We?'},

                // First Aid (3 modules - core)
                {s:'red',c:'15',n:'What\'s it for? First Aid basics',core:true},
                {s:'red',c:'15.1',n:'Patch it Up: First Aid Relay'},
                {s:'red',c:'15.2',n:'First Aid Comes First: Units Safety Poster'},

                // Naval Heritage (2 modules - core)
                {s:'red',c:'16',n:'Ships Crest: Naval Heraldry',core:true},

                // Seamanship (6 modules - core)
                {s:'red',c:'17',n:'Throw Yourself a Knot',core:true},
                {s:'red',c:'17.1',n:'Tasty Knots'},
                {s:'red',c:'17.2',n:'Rope and Spoons'},
                {s:'red',c:'17.3',n:'Knots on Display: Knot Board'},
                {s:'red',c:'17.4',n:'Paracord Keyrings'},
                {s:'red',c:'17.5',n:'Parts of a Ship'},
                {s:'red',c:'17.6',n:'Ship Ahoy!'},

                // Food Safety (7 modules)
                {s:'red',c:'18',n:'Planning & Preparation is Key!'},
                {s:'red',c:'18.1',n:'Fridge, Cupboard, Freezer, Bench?'},
                {s:'red',c:'18.2',n:'Keeping Germs at Bay'},
                {s:'red',c:'18.3',n:'Missed a Spot!'},
                {s:'red',c:'18.4',n:'Building Bacteria'},
                {s:'red',c:'18.5',n:'Fuzzy Bread'},
                {s:'red',c:'18.6',n:'How Clean Are Your Hands?'},

                // Special Modules (4 modules)
                {s:'red',c:'19',n:'Earthshot Challenge Completed'},
                {s:'red',c:'20',n:'Cadet Voice: Suggestion Box'},
                {s:'red',c:'21',n:'Kindness and Wellbeing'},
                {s:'red',c:'21.1',n:'Kindness and Wellbeing Activities'},
                {s:'red',c:'22',n:'Teamwork Skills'},

                // ========== BLUE SECTION - Waterborne Activities (70 modules) ==========
                // Taster Sessions (4 modules)
                {s:'blue',c:'T1',n:'Dinghy Sailing Taster Session'},
                {s:'blue',c:'T2',n:'Paddlesport Taster Session'},
                {s:'blue',c:'T3',n:'Windsurfing Taster Session'},
                {s:'blue',c:'T4',n:'Rowing Taster Session'},

                // Water Safety (3 modules - BLUE 1 is core)
                {s:'blue',c:'1',n:'Safety by the Water (NEW)',core:true},
                {s:'blue',c:'1.1',n:'Throw Me A Rescue Line'},
                {s:'blue',c:'1.2',n:'Help, Help, I Need Some Help!'},

                // Navigation Marks (2 modules)
                {s:'blue',c:'2',n:'Avoid the Danger with Cardinal Marks'},
                {s:'blue',c:'2.1',n:'Where Are The Danger Zones?'},

                // Naval Knowledge (8 modules)
                {s:'blue',c:'3',n:'Adventures Of The Royal Navy and Merchant Navy'},
                {s:'blue',c:'4',n:'Going on a Mission'},
                {s:'blue',c:'5',n:'Maritime Museum Exploration'},
                {s:'blue',c:'6',n:'How Many Battleships Can You Sink?'},
                {s:'blue',c:'7',n:'Can You Remember The Facts?'},
                {s:'blue',c:'7.1',n:'Famous Maritime Figures'},
                {s:'blue',c:'7.2',n:'Picasso\'s Lord Nelson'},

                // Boat Construction (4 modules)
                {s:'blue',c:'8',n:'Research and Sketch Boat Construction'},
                {s:'blue',c:'8.1',n:'Build, Build, Build: Boat Construction'},
                {s:'blue',c:'8.2',n:'Crafty Raft: Model Raft Building'},
                {s:'blue',c:'8.3',n:'On The Water Raft Building'},

                // Water Wisdom (2 modules - BLUE 9 is core)
                {s:'blue',c:'9',n:'Wise Cadets Near The Water',core:true},
                {s:'blue',c:'9.1',n:'Wise Cadets Near the Water: What Flag Am I?'},

                // Lifesaving (2 modules)
                {s:'blue',c:'10',n:'How To Save A Life: Lifeguards'},

                // Swimming (8 modules)
                {s:'blue',c:'11',n:'Just Keep Swimming, Just Keep Swimming'},
                {s:'blue',c:'12',n:'Swimathon: Sponsored Swim'},
                {s:'blue',c:'13',n:'Water Games: Marco? Polo!'},
                {s:'blue',c:'13.1',n:'Synchronise and Swim'},
                {s:'blue',c:'13.2',n:'Goaaal!! Water Polo Challenge'},
                {s:'blue',c:'14',n:'Swimming Gala'},

                // Signalling (3 modules - BLUE 15 is core)
                {s:'blue',c:'15',n:'Signposts at Sea',core:true},
                {s:'blue',c:'15.1',n:'Edible Signposts at Sea'},
                {s:'blue',c:'15.2',n:'Ropes on Biscuits'},

                // Boat Handling (2 modules)
                {s:'blue',c:'16',n:'Saving Sam the Haribo Snake'},
                {s:'blue',c:'16.1',n:'Don\'t Fall Out Of The Boat!'},

                // Rowing (4 modules)
                {s:'blue',c:'17',n:'Go Rowing! Afloat Activity'},
                {s:'blue',c:'17.1',n:'Learn Rowing! Afloat Activity'},

                // Dinghy Sailing (4 modules)
                {s:'blue',c:'18',n:'Go Dinghy Sailing! Afloat Activity'},
                {s:'blue',c:'18.1',n:'Learn Dinghy Sailing! Afloat Activity'},

                // Paddlesport (3 modules)
                {s:'blue',c:'19',n:'Go Paddling! Afloat Activity'},
                {s:'blue',c:'19.1',n:'Learn Paddlesport! Afloat Activity'},
                {s:'blue',c:'19.2',n:'Voyage of Discovery'},

                // Windsurfing (3 modules)
                {s:'blue',c:'20',n:'Learn Windsurfing! Afloat Activity'},
                {s:'blue',c:'20.1',n:'Go Windsurfing! Afloat Activity'},

                // Safety & Navigation (5 modules - BLUE 21 is core)
                {s:'blue',c:'21',n:'Please Don\'t Crash: Keep a Good Look Out!',core:true},
                {s:'blue',c:'21.1',n:'Danger, Danger: Hazards!'},
                {s:'blue',c:'21.2',n:'Head Above Water: Buoyancy'},
                {s:'blue',c:'21.3',n:'Please Don\'t Crash: Safe Speeds'},
                {s:'blue',c:'22',n:'Careful Navigation'},

                // Naval Traditions (4 modules)
                {s:'blue',c:'23',n:'What\'s Crossing The Line All About?'},
                {s:'blue',c:'23.1',n:'Nautical Terms'},
                {s:'blue',c:'23.2',n:'Songs of the Sea: Sea Shanties'},
                {s:'blue',c:'23.3',n:'The Sailor\'s Hornpipe Dance'},

                // Boat Types (3 modules)
                {s:'blue',c:'24',n:'Guess Who: Boat Types'},
                {s:'blue',c:'24.1',n:'MINI RS ZEST - Single Handed Dinghy'},
                {s:'blue',c:'24.2',n:'MINI RS QUEST - Crewed Sailing Dinghy'},

                // Additional Safety (4 modules)
                {s:'blue',c:'25',n:'Freeze Frame - Cold Water Shock'},
                {s:'blue',c:'26',n:'Towpath I Spy'},
                {s:'blue',c:'27',n:'Flag Etiquette'},
                {s:'blue',c:'28',n:'Keeping it Green and Clean'},

                // Earthshot (2 modules)
                {s:'blue',c:'29',n:'Earthshot (ROO) - The Big Clean Up'},
                {s:'blue',c:'29.2',n:'Earthshot (ROO) - The Plastic Eating Machine'},

                // ========== GREEN SECTION - Outdoor & Recreation (49 modules) ==========
                // Introduction (1 module)
                {s:'green',c:'1',n:'All About the 50 Things'},

                // Mapping (4 modules)
                {s:'green',c:'2',n:'Mapping It Out'},
                {s:'green',c:'2.1',n:'The Bigger Picture: Around the Globe'},
                {s:'green',c:'3',n:'What Grids? Grid References'},

                // Weather (2 modules)
                {s:'green',c:'4',n:'Rain, Rain...Maybe Stay?'},
                {s:'green',c:'4.1',n:'Make it Rain!'},

                // Navigation (4 modules)
                {s:'green',c:'5',n:'Captain\'s Coming'},
                {s:'green',c:'5.1',n:'Home Made Compass'},
                {s:'green',c:'6',n:'The Art of Photography'},
                {s:'green',c:'7',n:'Pacing It Out'},
                {s:'green',c:'7.1',n:'Micro Journey: Mapping and Navigation'},
                {s:'green',c:'7.2',n:'Unique Monopoly'},
                {s:'green',c:'7.3',n:'Which Way Am I Going? Navigating Further Afield'},

                // Outdoor Skills (4 modules)
                {s:'green',c:'8',n:'The Basic Outdoors'},
                {s:'green',c:'8.1',n:'Zero Trace: Love of the Outdoors'},
                {s:'green',c:'8.2',n:'I Don\'t Know What to Wear'},
                {s:'green',c:'8.3',n:'Keeping Things Tidy, Even When You Are Soaked'},

                // Cooking (5 modules)
                {s:'green',c:'9',n:'Stoves Galore!'},
                {s:'green',c:'9.1',n:'Cooking on Open Fires 101'},
                {s:'green',c:'9.2',n:'Open Fire Recipes'},
                {s:'green',c:'9.3',n:'Junior Survivor'},
                {s:'green',c:'9.4',n:'Master Chef Outdoors'},

                // Practice (2 modules)
                {s:'green',c:'10',n:'Putting Everything into Practice'},
                {s:'green',c:'10.1',n:'The Amazing Race: Junior League'},

                // Country Code (3 modules)
                {s:'green',c:'11',n:'Respecting the Outdoors: Country Code Style!'},
                {s:'green',c:'11.1',n:'Country Code In Practice How To Guide'},
                {s:'green',c:'11.2',n:'Giving Back to the Environment'},

                // Camping (2 modules)
                {s:'green',c:'12',n:'Tenting Around'},
                {s:'green',c:'12.1',n:'Pitching a Tent'},

                // Safety (2 modules)
                {s:'green',c:'13',n:'Staying Safe and Having Fun Outdoors'},
                {s:'green',c:'13.1',n:'Stranger Danger'},

                // Meteorology (5 modules)
                {s:'green',c:'14',n:'Weather Wise: Meteorology'},
                {s:'green',c:'14.1',n:'Weather Wise On The Water'},
                {s:'green',c:'14.2',n:'Extreme Weather: Storm Surge'},
                {s:'green',c:'14.3',n:'Low Visibility'},
                {s:'green',c:'14.4',n:'Practices of Celestial Navigation'},
                {s:'green',c:'15',n:'Which Way Is The Wind Blowing?'},

                // Physical Training (8 modules)
                {s:'green',c:'16',n:'No Injuries, Thanks! The Importance of Warming Up'},
                {s:'green',c:'16.1',n:'Testing It Out! Warm Up Guide'},
                {s:'green',c:'17',n:'How Far Can You Go...Safely! Keep Fit Challenge'},
                {s:'green',c:'17.1',n:'Game On! Recreational Training Games'},
                {s:'green',c:'17.2',n:'How Competitive are You?'},
                {s:'green',c:'17.3',n:'Happy and Healthy'},
                {s:'green',c:'17.4',n:'Eating Happy and Healthy!'},
                {s:'green',c:'17.5',n:'Games to Get You Started'},

                // Earthshot (4 modules)
                {s:'green',c:'18',n:'Earthshot (PRN) - DIY Bird Feeder'},
                {s:'green',c:'18.1',n:'Earthshot (PRN) - Bee Bombs'},
                {s:'green',c:'18.2',n:'Earthshot (WFW) - Recycled Wild Flower Seed Paper'},
                {s:'green',c:'18.3',n:'Earthshot (COA) - Reducing Your Carbon Footprint'},

                // ========== YELLOW SECTION - Community & Citizenship (107+ modules) ==========
                // Note: This is a MASSIVE section. Including all from document.

                // Festivals & Celebrations (13 modules)
                {s:'yellow',c:'1',n:'Mardi Gras/Fat Tuesday/Shrove Tuesday'},
                {s:'yellow',c:'1.1',n:'Parade with Mardi Gras Masks'},
                {s:'yellow',c:'1.2',n:'Musical Celebration: Jazz Band'},
                {s:'yellow',c:'2',n:'Celebrating Easter'},
                {s:'yellow',c:'2.1',n:'Yummy Easter Hot Cross Buns'},
                {s:'yellow',c:'2.2',n:'Twisted Pretzel: A Food of Lent'},
                {s:'yellow',c:'2.3',n:'Creative Easter Eggs'},
                {s:'yellow',c:'3',n:'Festival of Colour - Holi'},
                {s:'yellow',c:'3.1',n:'Colours of Holi'},
                {s:'yellow',c:'3.2',n:'Nariyal Barfi'},
                {s:'yellow',c:'4',n:'Happy Diwali (Divali)'},
                {s:'yellow',c:'4.1',n:'Festival of Lights'},
                {s:'yellow',c:'4.2',n:'Rangoli Designs'},
                {s:'yellow',c:'4.3',n:'Karah Parshad'},

                // Chinese New Year (7 modules)
                {s:'yellow',c:'5',n:'Snap It Up With Chinese New Year!'},
                {s:'yellow',c:'5.1',n:'Taste of China: Sweet Dumplings'},
                {s:'yellow',c:'5.2',n:'Fortune Cookie Jar'},
                {s:'yellow',c:'5.3',n:'Prosperity & Good Fortune in Red'},
                {s:'yellow',c:'5.4',n:'Chinese Dragon Costume (Individual)'},
                {s:'yellow',c:'5.5',n:'Chinese Dragon Costume (large)'},
                {s:'yellow',c:'5.6',n:'The Beating Drum'},

                // Australia (4 modules)
                {s:'yellow',c:'6',n:'Celebrate with an Australian Cork Hat'},
                {s:'yellow',c:'6.1',n:'Getting to know indigenous Australia'},
                {s:'yellow',c:'6.2',n:'Didgeridoo: Music Maker'},
                {s:'yellow',c:'6.3',n:'Australian Bakes: ANZAC Biscuits'},

                // Christmas (9 modules)
                {s:'yellow',c:'7',n:'Everything Christmas: Decorating Time!'},
                {s:'yellow',c:'7.1',n:'Christmas Bingo!'},
                {s:'yellow',c:'7.2',n:'A Ginger Christmas'},
                {s:'yellow',c:'7.3',n:'Chocolate Logs Yule Love!'},
                {s:'yellow',c:'7.4',n:'Chocolate Logs Made Easy'},
                {s:'yellow',c:'7.5',n:'Gingerbread Biscuits'},
                {s:'yellow',c:'7.6',n:'Christmas Gift photo frame'},
                {s:'yellow',c:'7.7',n:'Seasonal Festive Wreath'},
                {s:'yellow',c:'7.8',n:'Odd Sock Beanbag Characters'},

                // Other Celebrations (6 modules)
                {s:'yellow',c:'8',n:'Research Time!'},
                {s:'yellow',c:'8.1',n:'Unit Spookyville'},
                {s:'yellow',c:'8.2',n:'All Things Spooky'},
                {s:'yellow',c:'8.3',n:'What Are The Nine Candles?'},
                {s:'yellow',c:'8.4',n:'Saint Valentine\'s Day Kindness Box'},
                {s:'yellow',c:'8.5',n:'Saint Patrick\'s Day: Shamrock Shake'},
                {s:'yellow',c:'8.6',n:'A Special Sunday for Mothers & Caregivers'},
                {s:'yellow',c:'8.7',n:'Celebrating the Iranian New Year'},
                {s:'yellow',c:'8.8',n:'Halloween Trick or Treats'},

                // Community (4 modules)
                {s:'yellow',c:'9',n:'All About The Community'},
                {s:'yellow',c:'9.1',n:'Community 101'},
                {s:'yellow',c:'9.2',n:'Community Tree'},
                {s:'yellow',c:'9.3',n:'Community Mind Map'},

                // Surveys (3 modules)
                {s:'yellow',c:'10',n:'Survey Mania'},
                {s:'yellow',c:'10.1',n:'Chips Ahoy! Chip Shop Survey'},
                {s:'yellow',c:'10.2',n:'Shop Surveys'},

                // Community Projects (3 modules)
                {s:'yellow',c:'11',n:'Getting Involved: Community Projects'},
                {s:'yellow',c:'11.1',n:'Junior Cadets of the World!'},
                {s:'yellow',c:'11.2',n:'Celebrating Diversity in Your Community'},

                // Welsh (4 modules)
                {s:'yellow',c:'12',n:'Welsh Style: Traditional Welsh Cakes'},
                {s:'yellow',c:'12.1',n:'Welsh Style: Welsh Rarebit'},
                {s:'yellow',c:'12.2',n:'Yr Iaith Gymraeg: Welsh Language'},
                {s:'yellow',c:'12.3',n:'Y Ddraig Goch Flag: The Red Dragon'},

                // Scottish (6 modules)
                {s:'yellow',c:'13',n:'The Scottish Way: Haggis, Neeps & Tatties'},
                {s:'yellow',c:'13.1',n:'The Scottish Way: Cèilidh'},
                {s:'yellow',c:'13.2',n:'The Scottish Way: The Flag of Scotland'},
                {s:'yellow',c:'13.3',n:'The Scottish Way: Scots Gàidhlig'},
                {s:'yellow',c:'13.4',n:'Celebrate Saint Andrews Day: Scottish Kilt Card'},
                {s:'yellow',c:'13.5',n:'Exploring Burns Night Supper'},

                // Summer & UK (4 modules)
                {s:'yellow',c:'15',n:'The Arrival of Summer: Maypole Dancing'},
                {s:'yellow',c:'15.1',n:'Morris Dancing'},
                {s:'yellow',c:'16',n:'4 Nations in 1'},

                // Local Area (3 modules)
                {s:'yellow',c:'17',n:'Places of Interest'},
                {s:'yellow',c:'17.1',n:'Scavenger Hunt'},
                {s:'yellow',c:'17.2',n:'Town Maps, Maps of Your Town'},
                {s:'yellow',c:'18',n:'Broadening The Horizon'},

                // Inclusion & Diversity (6 modules)
                {s:'yellow',c:'19',n:'We Are Different, We are the Same!'},
                {s:'yellow',c:'19.1',n:'Embrace It: Inclusion & Diversity'},
                {s:'yellow',c:'19.2',n:'All in a phrase'},
                {s:'yellow',c:'19.3',n:'Communicating Through Sign Language'},
                {s:'yellow',c:'19.4',n:'Ditch The Labels!'},
                {s:'yellow',c:'19.5',n:'Communicating through Braille'},

                // Anti-Bullying (5 modules)
                {s:'yellow',c:'20',n:'It\'s Never the Same!'},
                {s:'yellow',c:'20.1',n:'The Issue'},
                {s:'yellow',c:'20.2',n:'Wear It On Your Wrist!'},
                {s:'yellow',c:'20.3',n:'Activists in Action! Anti-bullying Campaign'},
                {s:'yellow',c:'20.4',n:'Online: It is Still Not Okay!'},
                {s:'yellow',c:'21',n:'Ten Keys'},

                // Remembrance (10 modules)
                {s:'yellow',c:'22',n:'Remembrance Day Parade'},
                {s:'yellow',c:'22.1',n:'Cenotaphs In The Community'},
                {s:'yellow',c:'22.2',n:'Paper Plate Poppies'},
                {s:'yellow',c:'22.3',n:'Recycled Remembrance Poppies'},
                {s:'yellow',c:'22.4',n:'Remembrance Art'},
                {s:'yellow',c:'22.5',n:'Medals to Remember'},
                {s:'yellow',c:'22.6',n:'Portraits of Boy Seaman John T. Cornwell V.C.'},
                {s:'yellow',c:'22.7',n:'What is your unit\'s History?'},
                {s:'yellow',c:'22.8',n:'Remembrance Light Jars'},
                {s:'yellow',c:'22.9',n:'Remembrance Day Wreath'},

                // Home Front (3 modules)
                {s:'yellow',c:'23',n:'The Home Front'},
                {s:'yellow',c:'23.1',n:'Ration It Out'},
                {s:'yellow',c:'23.2',n:'Re-enactment Time'},

                // Government (3 modules)
                {s:'yellow',c:'24',n:'Values and Citizenship: What about Governments?'},
                {s:'yellow',c:'24.1',n:'Your Local Government: Face to Face'},
                {s:'yellow',c:'24.2',n:'Who\'s Who: Mayors or Provosts?'},

                // Special Days (2 modules)
                {s:'yellow',c:'25',n:'Saint George\'s Day'},
                {s:'yellow',c:'26',n:'VE Victory Sponge'},

                // Plastic Reduction (4 modules)
                {s:'yellow',c:'27',n:'#SCRAPPLASTIC Swap Out Your Plastics'},
                {s:'yellow',c:'27.1',n:'#SCRAPPLASTIC Plastic Free Day'},
                {s:'yellow',c:'27.2',n:'#SCRAPPLASTIC Supermarket Challenge'},
                {s:'yellow',c:'27.3',n:'#SCRAPPLASTIC Share What You Know'},

                // Earthshot (5 modules)
                {s:'yellow',c:'28',n:'Earthshot (WFW) - Tote-tally Awesome Up-cycled Bag'},
                {s:'yellow',c:'28.1',n:'Earthshot (WFW) - Ecobricks'},
                {s:'yellow',c:'28.2',n:'Earthshot (WFW) - Need v Want'},
                {s:'yellow',c:'28.3',n:'Earthshot (FOC) - Utilising Technology'},
                {s:'yellow',c:'28.4',n:'Earthshot (WFW) - Where does our waste go?'},

                // Competitions & Pride (2 modules)
                {s:'yellow',c:'29',n:'Junior Sea Cadets Competitions'},
                {s:'yellow',c:'30',n:'Your Identity Matters - Celebrating PRIDE'},

                // Special Editions (8 modules)
                {s:'yellow',c:'70',n:'Special Edition Platinum Jubilee'},
                {s:'yellow',c:'70.1',n:'The Platinum Thread'},
                {s:'yellow',c:'70.2',n:'Platinum Jubilee Fact Find'},
                {s:'yellow',c:'71',n:'Remembering Our Patron'},
                {s:'yellow',c:'72',n:'King\'s Coronation Party Event'},
                {s:'yellow',c:'72.1',n:'King\'s Coronation POM POM Decorations'},
                {s:'yellow',c:'73',n:'Big Help Out - Special Call at a Landmark'},

                // ========== STEM SECTION (42 modules) ==========
                {s:'stem',c:'1',n:'Satellite Intelligence Mission'},
                {s:'stem',c:'2',n:'Egg Drop Challenge: Protecting The Vessels'},
                {s:'stem',c:'3',n:'Sink Or Swim: Tinfoil Boat Float Challenge'},
                {s:'stem',c:'4',n:'Launched Out To Sea: Pom Pom Catapult'},
                {s:'stem',c:'5',n:'Propeller Nation'},
                {s:'stem',c:'6',n:'Steer The Ship: Eco-Friendly Giant Maze'},
                {s:'stem',c:'7',n:'Why It Just Won\'t Work: Salt Pendulum'},
                {s:'stem',c:'8',n:'Amazing Anchors'},
                {s:'stem',c:'9',n:'Setting Sail'},
                {s:'stem',c:'10',n:'Ancient Compasses'},
                {s:'stem',c:'11',n:'Balancing Boats'},
                {s:'stem',c:'12',n:'Carrying Cargo'},
                {s:'stem',c:'13',n:'Electric Engines'},
                {s:'stem',c:'14',n:'Incredible Insulation'},
                {s:'stem',c:'15',n:'Invisible Islands'},
                {s:'stem',c:'16',n:'Luminous Lighthouses'},
                {s:'stem',c:'17',n:'Oceans In A Bottle'},
                {s:'stem',c:'18',n:'Salt In The Seas'},
                {s:'stem',c:'19',n:'Speedy Ships'},
                {s:'stem',c:'20',n:'The World Around Us: Which Metal? Rust!'},
                {s:'stem',c:'21',n:'Special Edition: Somewhere Over The Rainbow'},
                {s:'stem',c:'22',n:'Wind Speed And Pressure: Anemometer'},
                {s:'stem',c:'23',n:'Elastic Band Powered Cars'},
                {s:'stem',c:'24',n:'Propelling Forward'},
                {s:'stem',c:'25',n:'Get Moving - A Chemical Reaction Powered Model Boat!'},
                {s:'stem',c:'26',n:'Weather Warning - Making A Barometer'},
                {s:'stem',c:'27',n:'Underwater Volcano - A Force Of Nature!'},
                {s:'stem',c:'28',n:'Tornado In A Bottle'},
                {s:'stem',c:'29',n:'Cartesian Diver'},
                {s:'stem',c:'30',n:'How Long Is A Minute? - Water Clock'},
                {s:'stem',c:'31',n:'The Science Behind Making The Right Choice!'},
                {s:'stem',c:'32',n:'Up Periscope - Make Your Own Submarine Periscope'},
                {s:'stem',c:'33',n:'Geodesic Domes'},
                {s:'stem',c:'34',n:'Sublime Slime'},
                {s:'stem',c:'35',n:'Air Power: Balloon Car'},
                {s:'stem',c:'36',n:'Ruffle Some Feathers - Mini Vortex Cannon'},
                {s:'stem',c:'37',n:'Paper Roller Coaster - Kinetic & Potential Energy'},
                {s:'stem',c:'38',n:'Moon Dial'},
                {s:'stem',c:'39',n:'Paper Glider'},
                {s:'stem',c:'40',n:'Lava Lamp'},
                {s:'stem',c:'41',n:'Puffer Fish'},
                {s:'stem',c:'42',n:'Waste-Free Lunch'}
            ];
            
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
            
            // Filter modules based on selected section
            const filteredModules = allModules.filter(mod => mod.s === selectedSection);
            
            const sectionTabs = [
                { id: 'red', label: 'Red - Unit', count: allModules.filter(m => m.s === 'red').length, color: 'red' },
                { id: 'blue', label: 'Blue - Waterborne', count: allModules.filter(m => m.s === 'blue').length, color: 'blue' },
                { id: 'green', label: 'Green - Outdoor', count: allModules.filter(m => m.s === 'green').length, color: 'green' },
                { id: 'yellow', label: 'Yellow - Community', count: allModules.filter(m => m.s === 'yellow').length, color: 'yellow' },
                { id: 'stem', label: 'STEM', count: allModules.filter(m => m.s === 'stem').length, color: 'purple' }
            ];
            
            // PDF Export Function
            const exportToPDF = () => {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
                
                const unitName = personnel.length > 0 ? personnel[0].unit : "Unit";
                const sectionName = sectionTabs.find(t => t.id === selectedSection)?.label || selectedSection;
                
                // Section color mapping (RGB values)
                const sectionColors = {
                    'red': [220, 38, 38],      // red-600
                    'blue': [37, 99, 235],     // blue-600
                    'green': [22, 163, 74],    // green-600
                    'yellow': [202, 138, 4],   // yellow-600
                    'stem': [147, 51, 234]     // purple-600
                };
                const fillColor = sectionColors[selectedSection] || [13, 172, 80];
                
                // Header
                doc.setFont("helvetica", "bold");
                doc.setFontSize(16);
                doc.text(`Junior Progress Chart - ${sectionName}`, 148.5, 15, { align: "center" });
                
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.text(unitName, 148.5, 22, { align: "center" });
                doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 148.5, 27, { align: "center" });
                
                // Calculate column width based on number of juniors
                const startY = 35;
                const moduleColWidth = 60;
                const availableWidth = 297 - moduleColWidth - 10;
                const cadetColWidth = Math.min(20, availableWidth / juniors.length);
                
                // Table Headers
                doc.setFontSize(7);
                doc.setFont("helvetica", "bold");
                
                // Module column header
                doc.rect(5, startY, moduleColWidth, 25);
                doc.text("Module", 7, startY + 13);
                
                // Cadet column headers (vertical text)
                juniors.forEach((junior, idx) => {
                    const x = 5 + moduleColWidth + (idx * cadetColWidth);
                    doc.rect(x, startY, cadetColWidth, 25);
                    
                    // Full surname, rotated 90 degrees - centered horizontally, starts from bottom
                    const surname = junior.name.split(',')[0];
                    // Position text at exact center of column width, bottom of header box
                    const centerX = x + (cadetColWidth / 2);
                    const bottomY = startY + 23; // Near bottom of 25mm header
                    doc.text(surname, centerX, bottomY, { 
                        align: "left",
                        angle: 90
                    });
                });
                
                // Table Body
                let currentY = startY + 25;
                doc.setFont("helvetica", "normal");
                doc.setFontSize(7);
                
                filteredModules.forEach((mod, idx) => {
                    // Check if we need a new page
                    if (currentY > 185) {
                        doc.addPage();
                        currentY = 20;
                    }
                    
                    const rowHeight = 6;
                    
                    // Module name
                    doc.rect(5, currentY, moduleColWidth, rowHeight);
                    const moduleText = `${mod.s.toUpperCase()} ${mod.c}: ${mod.n}`;
                    const truncated = moduleText.length > 45 ? moduleText.substring(0, 42) + "..." : moduleText;
                    doc.text(truncated, 7, currentY + 4);
                    
                    // Completion status for each junior
                    juniors.forEach((junior, jIdx) => {
                        const x = 5 + moduleColWidth + (jIdx * cadetColWidth);
                        doc.rect(x, currentY, cadetColWidth, rowHeight);
                        
                        const completion = hasModule(junior.pNumber, mod.s, mod.c);
                        if (completion) {
                            // Draw checkmark in section color
                            doc.setFillColor(...fillColor);
                            doc.rect(x, currentY, cadetColWidth, rowHeight, 'F');
                            doc.setTextColor(255, 255, 255);
                            doc.text("✓", x + cadetColWidth/2, currentY + 4, { align: "center" });
                            doc.setTextColor(0, 0, 0);
                        }
                    });
                    
                    currentY += rowHeight;
                });
                
                // Summary footer
                doc.setFont("helvetica", "bold");
                doc.setFontSize(8);
                currentY += 5;
                if (currentY > 185) {
                    doc.addPage();
                    currentY = 20;
                }
                doc.text("Summary:", 7, currentY);
                currentY += 5;
                
                doc.setFont("helvetica", "normal");
                doc.setFontSize(7);
                juniors.forEach((junior, idx) => {
                    const moduleCount = juniorData.moduleCompletions.filter(m => 
                        m.pNumber === junior.pNumber && m.section === selectedSection
                    ).length;
                    const shortName = junior.name.split(',')[0];
                    doc.text(`${shortName}: ${moduleCount}/${filteredModules.length}`, 7 + (idx * 40), currentY);
                    if ((idx + 1) % 7 === 0) currentY += 4;
                });
                
                doc.save(`Junior_Progress_${sectionName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
            };
            
            return (
                <div className="space-y-4">
                    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-3">
                                <Icon name="BarChart3" className="w-6 h-6 text-purple-700" />
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900">Junior Progress Chart</h1>
                                    <p className="text-sm text-slate-600">{juniors.length} juniors tracked across {allModules.length} modules</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 items-center">
                                <button
                                    onClick={exportToPDF}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-all flex items-center gap-1"
                                >
                                    <Icon name="FileDown" className="w-3 h-3" />
                                    Export PDF
                                </button>
                                {sectionTabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setSelectedSection(tab.id)}
                                        className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                                            selectedSection === tab.id
                                                ? tab.color === 'red' ? 'bg-red-600 text-white' :
                                                  tab.color === 'blue' ? 'bg-blue-600 text-white' :
                                                  tab.color === 'green' ? 'bg-green-600 text-white' :
                                                  tab.color === 'yellow' ? 'bg-yellow-600 text-white' :
                                                  'bg-purple-600 text-white'
                                                : `bg-${tab.color}-50 text-${tab.color}-700 hover:bg-${tab.color}-100`
                                        }`}
                                    >
                                        {tab.label} <span className="opacity-75">({tab.count})</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto" style={{maxHeight: '70vh', overflowY: 'auto'}}>
                            <table className="min-w-full text-xs border-collapse">
                                <thead className="bg-slate-100 sticky top-0 z-20">
                                    <tr>
                                        <th className="sticky left-0 bg-slate-100 px-2 py-2 text-left font-bold text-slate-700 uppercase z-30 border-r text-xs" style={{maxWidth: '200px', width: '200px'}}>
                                            Module / Cadet
                                        </th>
                                        {juniors.map(junior => {
                                            // Calculate module count for this junior in the selected section
                                            const moduleCount = juniorData.moduleCompletions.filter(m => 
                                                m.pNumber === junior.pNumber && m.section === selectedSection
                                            ).length;
                                            return (
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
                                                        <div className="text-[9px] font-bold text-blue-600 leading-tight mt-0.5">{moduleCount} modules</div>
                                                    </div>
                                                </div>
                                            </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredModules.map((mod, idx) => (
                                        <tr key={`${mod.s}-${mod.c}`} className={getSectionBg(mod.s)}>
                                            <td className={`sticky left-0 px-2 py-1 font-semibold border-r border-b z-10 text-xs ${getSectionModuleBg(mod.s)}`} style={{maxWidth: '200px', width: '200px'}}>
                                                <div className="overflow-hidden text-ellipsis whitespace-nowrap" title={`${mod.s.toUpperCase()} ${mod.c}: ${mod.n}`}>
                                                    <span className="font-bold">{mod.s.toUpperCase()} {mod.c}:</span> {mod.n}
                                                </div>
                                            </td>
                                            {juniors.map(junior => {
                                                const completion = hasModule(junior.pNumber, mod.s, mod.c);
                                                return (
                                                    <td key={junior.pNumber} style={{width: '30px'}} className={`px-0 py-1 text-center border-r border-b last:border-r-0 ${completion ? getSectionColor(mod.s) : ''}`} title={completion ? `Completed: ${formatDate(completion.dateCompleted)}` : ''}>
                                                        {completion ? '✓' : ''}
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
        
        const DataUtilitiesView = ({ clearData, wipeAllData, setView, personnel }) => {
            const [uploadStatus, setUploadStatus] = useState('');
            const juniorData = getJuniorData();
            
            const exportJuniorData = () => {
                const dataStr = JSON.stringify(juniorData, null, 2);
                const blob = new Blob([dataStr], {type: 'application/json'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const now = new Date();
                const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
                a.download = `juniors_backup_${timestamp}.json`;
                a.click();
                setUploadStatus('Junior data exported successfully!');
                setTimeout(() => setUploadStatus(''), 3000);
            };
            
            const importJuniorData = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const imported = JSON.parse(event.target.result);
                        if (confirm('Import this data? This will replace all local junior data.')) {
                            saveJuniorData(imported);
                            window.location.reload();
                        }
                    } catch (e) {
                        alert('Error parsing JSON file: ' + e.message);
                    }
                };
                reader.readAsText(file);
            };
            
            return (
                <div className="space-y-6">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-slate-500">
                        <div className="flex items-center gap-3">
                            <Icon name="Database" className="w-8 h-8 text-slate-700" />
                            <div>
                                <h1 className="text-3xl font-extrabold text-slate-900">Data / Utilities</h1>
                                <p className="text-slate-600">Manage all data imports, exports, and system settings</p>
                            </div>
                        </div>
                    </div>
                    
                    {uploadStatus && (
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                            <p className="text-green-800 font-semibold">{uploadStatus}</p>
                        </div>
                    )}
                    
                    {/* Upload New Data Section */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Icon name="Upload" className="w-6 h-6 text-blue-600" />
                            Upload Westminster Data
                        </h2>
                        <p className="text-slate-600 mb-6">
                            Upload fresh Westminster personnel and qualifications CSV files to refresh the dashboard data.
                        </p>
                        <button
                            onClick={() => {
                                if (confirm('Navigate to upload page? This will reload the dashboard. Any unsaved changes will be lost.')) {
                                    window.location.reload();
                                }
                            }}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2"
                        >
                            <Icon name="Upload" className="w-5 h-5" />
                            Reload Dashboard
                        </button>
                    </div>
                    
                    {/* Junior Data Management */}
                    <div className="bg-blue-50 rounded-lg shadow p-6 border-l-4 border-blue-500">
                        <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                            <Icon name="Users" className="w-6 h-6 text-blue-600" />
                            Junior Sea Cadet Data
                        </h2>
                        <p className="text-slate-700 mb-6">
                            Export junior data to share with other JTOs or create backups. Import to load shared data.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-white p-4 rounded-lg border border-blue-200">
                                <h3 className="font-bold text-blue-900 mb-2">Export Data</h3>
                                <p className="text-sm text-slate-600 mb-3">
                                    Download junior module completions as JSON file with timestamp.
                                </p>
                                <button
                                    onClick={exportJuniorData}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold w-full flex items-center justify-center gap-2"
                                >
                                    <Icon name="Download" className="w-4 h-4" />
                                    Export Junior Data
                                </button>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg border border-blue-200">
                                <h3 className="font-bold text-blue-900 mb-2">Import Data</h3>
                                <p className="text-sm text-slate-600 mb-3">
                                    Load junior data from a previously exported JSON file.
                                </p>
                                <label className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold cursor-pointer flex items-center justify-center gap-2 w-full">
                                    <Icon name="Upload" className="w-4 h-4" />
                                    Import Junior Data
                                    <input
                                        type="file"
                                        accept=".json"
                                        className="hidden"
                                        onChange={importJuniorData}
                                    />
                                </label>
                            </div>
                        </div>
                        
                        <div className="bg-blue-100 p-4 rounded-lg">
                            <p className="text-sm text-blue-900">
                                <strong>Current data:</strong> {juniorData.moduleCompletions.length} module completions tracked
                            </p>
                        </div>
                    </div>
                    
                    {/* Bulk Upload Template for Legacy Data */}
                    <div className="bg-amber-50 rounded-lg shadow p-6 border-l-4 border-amber-500">
                        <h2 className="text-2xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                            <Icon name="Upload" className="w-6 h-6 text-amber-600" />
                            Bulk Upload Junior Modules from Legacy System
                        </h2>
                        <p className="text-slate-700 mb-4">
                            Import existing paper-based module records. Download template, fill in completed modules, then upload.
                        </p>
                        
                        <div className="bg-white rounded p-4 mb-4 text-sm border border-amber-200">
                            <p className="font-semibold text-slate-700 mb-2">How it works:</p>
                            <ol className="list-decimal ml-5 space-y-1 text-slate-600">
                                <li>Click "Download Template" - gets CSV grid with all modules and your juniors</li>
                                <li>Open in Excel/Google Sheets</li>
                                <li>Add an "X" in cells where a junior has completed that module</li>
                                <li>Save as CSV</li>
                                <li>Click "Upload Template" to import all completions</li>
                            </ol>
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    const juniors = personnel.filter(c => {
                                        if (!c.dob) return false;
                                        const age = calculateAge(c.dob);
                                        return age >= 9 && age <= 11;
                                    });
                                    
                                    if (juniors.length === 0) {
                                        setUploadStatus('No juniors found to generate template');
                                        setTimeout(() => setUploadStatus(''), 3000);
                                        return;
                                    }
                                    
                                    // Header row: blank cell + junior names with P-Numbers
                                    // Convert "ADKINS, Millie" to "ADKINS Millie" format
                                    let csv = ", " + juniors.map(j => {
                                        const name = j.name.replace(',', '');  // Remove comma from "ADKINS, Millie"
                                        return `${name} - ${j.pNumber}`;
                                    }).join(", ") + "\n";
                                    
                                    // All 335 official junior modules from MSSC syllabus
                                    const allModuleNames = [
                                        "RED 1: Unit Induction: Tour of Unit","RED 1.1: Unit Induction: Unit Fire Drill","RED 1.2: Unit Induction: Map Out Your Unit","RED 1.3: Unit Induction: What's Important?","RED 1.4: Unit Induction: Uniformed Art","RED 1.5: Unit Induction: Badges & Ranks","RED 2: Two Questions & A Funny","RED 2.1: Paper Planes","RED 2.2: Names and Beanbags","RED 2.3: Mini Me","RED 3: Unit Who's Who: Say Cheese","RED 4: Basic Drill","RED 4.1: Unit Calls (Piping)","RED 4.2: Colours & Naval Customs","RED 4.3: Treat Yourself","RED 5: Junior Sea Cadet Uniform","RED 6: Safeguarding: SHOUT","RED 7: Organising Unit Activities","RED 7.1: Unit Activities","RED 7.2: Ready Aye Ready","RED 7.3: Unit Elevator Pitch","RED 7.4: Unit Advert","RED 7.5: Theme Tune","RED 8: How's Your Aim?","RED 9: Royal Marines Cadet Guest","RED 9.1: Royal Marines Cadets","RED 9.2: Royal Marines Activities","RED 10: Scrap Book Memories","RED 11: Passing Messages: Flags","RED 11.1: Lord Nelson's Message","RED 11.2: Codebreaker: Morse","RED 11.3: What's Your Position?","RED 11.4: Turn Up The Radios","RED 11.5: Phonetic Alphabet","RED 12: Chocolate Crispies","RED 12.1: Apple & Ginger","RED 12.2: Chefs' Sweet Tooth","RED 12.3: Chefs Savoury Tooth","RED 12.4: Chefs Cuppa","RED 13: Who Can Help Me?","RED 13.1: Emergency Visits","RED 14: How International Are We?","RED 15: First Aid Basics","RED 15.1: First Aid Relay","RED 15.2: Units Safety Poster","RED 16: Naval Heraldry","RED 17: Throw Yourself a Knot","RED 17.1: Tasty Knots","RED 17.2: Rope and Spoons","RED 17.3: Knot Board","RED 17.4: Paracord Keyrings","RED 17.5: Parts of a Ship","RED 17.6: Ship Ahoy!","RED 18: Planning & Preparation","RED 18.1: Food Storage","RED 18.2: Keeping Germs at Bay","RED 18.3: Missed a Spot!","RED 18.4: Building Bacteria","RED 18.5: Fuzzy Bread","RED 18.6: Clean Hands?","RED 19: Earthshot Challenge","RED 20: Suggestion Box","RED 21: Kindness and Wellbeing","RED 21.1: Kindness and Wellbeing","RED 22: Teamwork Skills","BLUE T1: Dinghy Sailing Taster","BLUE T2: Paddlesport Taster","BLUE T3: Windsurfing Taster","BLUE T4: Rowing Taster","BLUE 1: Safety by the Water","BLUE 1.1: Rescue Line","BLUE 1.2: Help I Need Help!","BLUE 2: Cardinal Marks","BLUE 2.1: Danger Zones","BLUE 3: Royal & Merchant Navy","BLUE 4: Going on a Mission","BLUE 5: Maritime Museum","BLUE 6: Battleships","BLUE 7: Remember The Facts","BLUE 7.1: Famous Figures","BLUE 7.2: Picasso's Nelson","BLUE 8: Boat Construction","BLUE 8.1: Build Boat","BLUE 8.2: Model Raft","BLUE 8.3: Water Raft","BLUE 9: Wise Near Water","BLUE 9.1: What Flag Am I?","BLUE 10: Lifeguards","BLUE 11: Keep Swimming","BLUE 12: Swimathon","BLUE 13: Marco Polo","BLUE 13.1: Synchronised Swim","BLUE 13.2: Water Polo","BLUE 14: Swimming Gala","BLUE 15: Signposts at Sea","BLUE 15.1: Edible Signposts","BLUE 15.2: Ropes on Biscuits","BLUE 16: Saving Sam","BLUE 16.1: Don't Fall Out!","BLUE 17: Go Rowing!","BLUE 17.1: Learn Rowing!","BLUE 18: Go Sailing!","BLUE 18.1: Learn Sailing!","BLUE 19: Go Paddling!","BLUE 19.1: Learn Paddlesport!","BLUE 19.2: Voyage of Discovery","BLUE 20: Learn Windsurfing!","BLUE 20.1: Go Windsurfing!","BLUE 21: Good Look Out","BLUE 21.1: Hazards","BLUE 21.2: Buoyancy","BLUE 21.3: Safe Speeds","BLUE 22: Navigation","BLUE 23: Crossing The Line","BLUE 23.1: Nautical Terms","BLUE 23.2: Sea Shanties","BLUE 23.3: Hornpipe Dance","BLUE 24: Boat Types","BLUE 24.1: RS ZEST Single","BLUE 24.2: RS QUEST Crewed","BLUE 25: Cold Water Shock","BLUE 26: Towpath I Spy","BLUE 27: Flag Etiquette","BLUE 28: Green and Clean","BLUE 29: Big Clean Up","BLUE 29.2: Plastic Eating Machine","GREEN 1: 50 Things","GREEN 2: Mapping It Out","GREEN 2.1: Around the Globe","GREEN 3: Grid References","GREEN 4: Weather","GREEN 4.1: Make it Rain!","GREEN 5: Captain's Coming","GREEN 5.1: Home Made Compass","GREEN 6: Photography","GREEN 7: Pacing It Out","GREEN 7.1: Micro Journey","GREEN 7.2: Unique Monopoly","GREEN 7.3: Navigate Further","GREEN 8: Basic Outdoors","GREEN 8.1: Zero Trace","GREEN 8.2: What to Wear","GREEN 8.3: Keeping Tidy","GREEN 9: Stoves","GREEN 9.1: Open Fires 101","GREEN 9.2: Fire Recipes","GREEN 9.3: Junior Survivor","GREEN 9.4: Master Chef Outdoors","GREEN 10: Practice","GREEN 10.1: Amazing Race Junior","GREEN 11: Country Code","GREEN 11.1: Country Code Guide","GREEN 11.2: Environment","GREEN 12: Tenting Around","GREEN 12.1: Pitching Tent","GREEN 13: Safe Outdoors","GREEN 13.1: Stranger Danger","GREEN 14: Meteorology","GREEN 14.1: Weather on Water","GREEN 14.2: Storm Surge","GREEN 14.3: Low Visibility","GREEN 14.4: Celestial Navigation","GREEN 15: Wind Blowing","GREEN 16: Warming Up","GREEN 16.1: Warm Up Guide","GREEN 17: Keep Fit","GREEN 17.1: Training Games","GREEN 17.2: Competitive","GREEN 17.3: Happy Healthy","GREEN 17.4: Eating Healthy","GREEN 17.5: Games to Start","GREEN 18: Bird Feeder","GREEN 18.1: Bee Bombs","GREEN 18.2: Seed Paper","GREEN 18.3: Carbon Footprint","YELLOW 1: Mardi Gras/Fat Tuesday/Shrove Tuesday","YELLOW 1.1: Parade with Mardi Gras Masks","YELLOW 1.2: Musical Celebration: Jazz Band","YELLOW 2: Celebrating Easter","YELLOW 2.1: Yummy Easter Hot Cross Buns","YELLOW 2.2: Twisted Pretzel: A Food of Lent","YELLOW 2.3: Creative Easter Eggs","YELLOW 3: Festival of Colour Holi","YELLOW 3.1: Colours of Holi","YELLOW 3.2: Nariyal Barfi","YELLOW 4: Happy Diwali (Divali)","YELLOW 4.1: Festival of Lights","YELLOW 4.2: Rangoli Designs","YELLOW 4.3: Karah Parshad","YELLOW 5: Snap It Up With Chinese New Year!","YELLOW 5.1: Taste of China: Sweet Dumplings","YELLOW 5.2: Fortune Cookie Jar","YELLOW 5.3: Prosperity & Good Fortune in Red","YELLOW 5.4: Chinese Dragon Costume (Individual)","YELLOW 5.5: Chinese Dragon Costume (large)","YELLOW 5.6: The Beating Drum","YELLOW 6: Celebrate with an Australian Cork Hat","YELLOW 6.1: Getting to know indigenous Australia","YELLOW 6.2: Didgeridoo: Music Maker","YELLOW 6.3: Australian Bakes: ANZAC Biscuits","YELLOW 7: Everything Christmas: Decorating Time!","YELLOW 7.1: Christmas Bingo!","YELLOW 7.2: A Ginger Christmas","YELLOW 7.3: Chocolate Logs Yule Love!","YELLOW 7.4: Chocolate Logs Made Easy","YELLOW 7.5: Gingerbread Biscuits","YELLOW 7.6: Christmas Gift photo frame","YELLOW 7.7: Seasonal Festive Wreath","YELLOW 7.8: Odd Sock Beanbag Characters","YELLOW 8: Research Time!","YELLOW 8.1: Unit Spookyville","YELLOW 8.2: All Things Spooky","YELLOW 8.3: What Are The Nine Candles?","YELLOW 8.4: Saint Valentine's Day Kindness Box","YELLOW 8.5: Saint Patrick's Day: Shamrock Shake","YELLOW 8.6: A Special Sunday for Mothers & Caregivers","YELLOW 8.7: Celebrating the Iranian New Year","YELLOW 8.8: Halloween Trick or Treats","YELLOW 9: All About The Community","YELLOW 9.1: Community 101","YELLOW 9.2: Community Tree","YELLOW 9.3: Community Mind Map","YELLOW 10: Survey Mania","YELLOW 10.1: Chips Ahoy! Chip Ship Survey","YELLOW 10.2: Shop Surveys","YELLOW 11: Getting Involved: Community Projects","YELLOW 11.1: Junior Cadets of the World!","YELLOW 11.2: Celebrating Diversity in Your Community","YELLOW 12: Welsh Style: Traditional Welsh Cakes","YELLOW 12.1: Welsh Style: Welsh Rarebit","YELLOW 12.2: Yr laith Gymraeg: Welsh Language","YELLOW 12.3: Y Ddraig Goch Flag: The Red Dragon","YELLOW 13: The Scottish Way: Haggis Neeps & Tatties","YELLOW 13.1: The Scottish Way: Cèilidh","YELLOW 13.2: The Scottish Way: The Flag of Scotland","YELLOW 13.3: The Scottish Way: Scots Gàidhlig","YELLOW 13.4: Celebrate Saint Andrews Day: Scottish Kilt Card","YELLOW 13.5: Exploring Burns Night Supper","YELLOW 15: The Arrival of Summer: Maypole Dancing","YELLOW 15.1: Morris Dancing","YELLOW 16: 4 Nations in 1","YELLOW 17: Places of Interest","YELLOW 17.1: Scavenger Hunt","YELLOW 17.2: Town Maps Maps of Your Town","YELLOW 18: Broadening The Horizon","YELLOW 19: We Are Different We are the Same!","YELLOW 19.1: Embrace It: Inclusion & Diversity","YELLOW 19.2: All in a phrase","YELLOW 19.3: Communicating Through Sign Language","YELLOW 19.4: Ditch The Labels!","YELLOW 19.5: Communicating through Braille","YELLOW 20: It's Never the Same!","YELLOW 20.1: The Issue","YELLOW 20.2: Wear It On Your Wrist!","YELLOW 20.3: Activists in Action! Anti-bullying Campaign","YELLOW 20.4: Online: It is Still Not Okay!","YELLOW 21: Ten Keys","YELLOW 22: Remembrance Day Parade","YELLOW 22.1: Cenotaphs In The Community","YELLOW 22.2: Paper Plate Poppies","YELLOW 22.3: Recycled Remembrance Poppies","YELLOW 22.4: Remembrance Art","YELLOW 22.5: Medals to Remember","YELLOW 22.6: Portraits of Boy Seaman John T. Cornwell V.C.","YELLOW 22.7: What is your unit's History?","YELLOW 22.8: Remembrance Light Jars","YELLOW 22.9: Remembrance Day Wreath","YELLOW 23: The Home Front","YELLOW 23.1: Ration It Out","YELLOW 23.2: Re-enactment Time","YELLOW 24: Values and Citizenship: What about Governments?","YELLOW 24.1: Your Local Government: Face to Face","YELLOW 24.2: Who's Who: Mayors or Provosts?","YELLOW 25: Saint George's Day","YELLOW 26: VE Victory Sponge","YELLOW 27: #SCRAPPLASTIC Swap Out Your Plastics","YELLOW 27.1: #SCRAPPLASTIC Plastic Free Day","YELLOW 27.2: #SCRAPPLASTIC Supermarket Challenge","YELLOW 27.3: #SCRAPPLASTIC Share What You Know","YELLOW 28: EARTHSHOT (WFW) - Tote-tally Awesome Up-cycled Bag","YELLOW 28.1: Earthshot (WFW) - Ecobricks","YELLOW 28.2: EARTHSHOT (WFW) - Need v Want","YELLOW 28.3: EARTHSHOT (FOC) - Utilising Technology","YELLOW 28.4: EARTHSHOT (WFW) - Where does our waste go?","YELLOW 29: Junior Sea Cadets Competitions","YELLOW 30: Your Identity Matters - Celebrating PRIDE","YELLOW 70: Special Edition Platinum Jubilee","YELLOW 70.1: The Platinum Thread","YELLOW 70.2: Platinum Jubilee Fact Find","YELLOW 71: Remembering Our Patron","YELLOW 72: King's Coronation Party event","YELLOW 72.1: King's Coronation POM POM decorations","YELLOW 73: Big Help Out - Special Call at a Landmark","STEM 1: Satellite Intelligence Mission","STEM 2: Egg Drop Challenge: Protecting The Vessels","STEM 3: Sink Or Swim: Tinfoil Boat Float Challenge","STEM 4: Launched Out To Sea: Pom Pom Catapult","STEM 5: Propeller Nation","STEM 6: Steer The Ship: Eco-Friendly Giant Maze","STEM 7: Why It Just Won't Work: Salt Pendulum","STEM 8: Amazing Anchors","STEM 9: Setting Sail","STEM 10: Ancient Compasses","STEM 11: Balancing Boats","STEM 12: Carrying Cargo","STEM 13: Electric Engines","STEM 14: Incredible Insulation","STEM 15: Invisible Islands","STEM 16: Luminous Lighthouses","STEM 17: Oceans In A Bottle","STEM 18: Salt In The Seas","STEM 19: Speedy Ships","STEM 20: The World Around Us: Which Metal? Rust!","STEM 21: Special Edition: Somewhere Over The Rainbow","STEM 22: Wind Speed And Pressure: Anemometer","STEM 23: Elastic Band Powered Cars","STEM 24: Propelling Forward","STEM 25: Get Moving - A Chemical Reaction Powered Model Boat!","STEM 26: Weather Warning - Making A Barometer","STEM 27: Underwater Volcano - A Force Of Nature!","STEM 28: Tornado In A Bottle","STEM 29: Cartesian Diver","STEM 30: How Long Is A Minute? - Water Clock","STEM 31: The Science Behind Making The Right Choice!","STEM 32: Up Periscope - Make Your Own Submarine Periscope","STEM 33: Geodesic Domes","STEM 34: Sublime Slime","STEM 35: Air Power: Balloon Car","STEM 36: Ruffle Some Feathers - Mini Vortex Cannon","STEM 37: Paper Roller Coaster - Kinetic & Potential Energy","STEM 38: Moon Dial","STEM 39: Paper Glider","STEM 40: Lava Lamp","STEM 41: Puffer Fish","STEM 42: Waste-Free Lunch"
                                    ];
                                    
                                    // Get existing completions
                                    const juniorData = getJuniorData();
                                    
                                    // Add module rows with X marks for existing completions
                                    allModuleNames.forEach(moduleName => {
                                        // Parse module name to extract section and code
                                        const moduleMatch = moduleName.match(/^(RED|BLUE|GREEN|YELLOW|STEM)\s+([^:]+):/);
                                        if (!moduleMatch) {
                                            // If can't parse, just add blank row
                                            csv += moduleName + ", " + juniors.map(() => "").join(", ") + "\n";
                                            return;
                                        }
                                        
                                        const section = moduleMatch[1].toLowerCase();
                                        const moduleCode = moduleMatch[2].trim();
                                        
                                        // For each junior, check if they've completed this module
                                        const cells = juniors.map(junior => {
                                            const hasCompleted = juniorData.moduleCompletions.some(comp => 
                                                comp.pNumber === junior.pNumber &&
                                                comp.section === section &&
                                                comp.moduleCode === moduleCode
                                            );
                                            return hasCompleted ? "X" : "";
                                        });
                                        
                                        csv += moduleName + ", " + cells.join(", ") + "\n";
                                    });
                                    
                                    const blob = new Blob([csv], {type: 'text/csv'});
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `juniors_grid_template_${new Date().toISOString().split('T')[0]}.csv`;
                                    a.click();
                                    setUploadStatus('Template downloaded successfully!');
                                    setTimeout(() => setUploadStatus(''), 3000);
                                }}
                                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 font-semibold flex items-center gap-2"
                            >
                                <Icon name="Download" className="w-4 h-4" />
                                Download Template
                            </button>
                            
                            <label className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold cursor-pointer flex items-center gap-2">
                                <Icon name="Upload" className="w-4 h-4" />
                                Upload Template
                                <input
                                    type="file"
                                    accept=".csv"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                            try {
                                                const text = event.target.result;
                                                const lines = text.split('\n').filter(line => line.trim());
                                                
                                                if (lines.length < 2) {
                                                    alert('Template appears empty. Add X marks for completed modules and try again.');
                                                    return;
                                                }
                                                
                                                // Parse header row to get juniors
                                                const headerCells = splitCSVLine(lines[0]);
                                                const juniors = [];
                                                
                                                // Skip first cell (blank), then parse each junior cell
                                                for (let i = 1; i < headerCells.length; i++) {
                                                    const cell = headerCells[i].trim();
                                                    if (!cell) continue;
                                                    
                                                    // Format: "Name - PNumber" (e.g., "ADKINS Millie - 11806919")
                                                    const match = cell.match(/(.+?)\s*-\s*(.+)/);
                                                    if (match) {
                                                        juniors.push({
                                                            index: i,
                                                            name: match[1].trim(),
                                                            pNumber: match[2].trim()
                                                        });
                                                    }
                                                }
                                                
                                                if (juniors.length === 0) {
                                                    alert('No juniors found in template header. Use downloaded template.');
                                                    return;
                                                }
                                                
                                                const newCompletions = [];
                                                let imported = 0;
                                                const today = new Date().toISOString().split('T')[0];
                                                
                                                // Parse each module row
                                                for (let rowIdx = 1; rowIdx < lines.length; rowIdx++) {
                                                    const cells = splitCSVLine(lines[rowIdx]);
                                                    if (cells.length < 2) continue;
                                                    
                                                    const moduleCell = cells[0].trim();
                                                    if (!moduleCell) continue;
                                                    
                                                    // Parse module: "SECTION CODE: Name" (e.g., "RED 1: Unit Induction: Tour of Unit")
                                                    const moduleMatch = moduleCell.match(/^(RED|BLUE|GREEN|YELLOW|STEM)\s+([^:]+):\s*(.+)/i);
                                                    if (!moduleMatch) continue;
                                                    
                                                    const section = moduleMatch[1].toLowerCase();
                                                    const moduleCode = moduleMatch[2].trim();
                                                    const moduleName = moduleMatch[3].trim();
                                                    
                                                    // Check each junior's cell for "X"
                                                    juniors.forEach(junior => {
                                                        const cell = (cells[junior.index] || "").trim().toUpperCase();
                                                        if (cell === "X") {
                                                            newCompletions.push({
                                                                pNumber: junior.pNumber,
                                                                section: section,
                                                                moduleCode: moduleCode,
                                                                moduleName: moduleName,
                                                                dateCompleted: today,
                                                                isCore: false
                                                            });
                                                            imported++;
                                                        }
                                                    });
                                                }
                                                
                                                if (imported === 0) {
                                                    alert('No X marks found in template. Add X marks for completed modules.');
                                                    return;
                                                }
                                                
                                                if (confirm(`Import ${imported} module completions for ${juniors.length} juniors? This will ADD to existing data.`)) {
                                                    const currentData = getJuniorData();
                                                    const updatedData = {
                                                        ...currentData,
                                                        moduleCompletions: [...currentData.moduleCompletions, ...newCompletions]
                                                    };
                                                    
                                                    if (saveJuniorData(updatedData)) {
                                                        setUploadStatus(`Successfully imported ${imported} completions!`);
                                                        setTimeout(() => window.location.reload(), 1500);
                                                    }
                                                }
                                            } catch (err) {
                                                console.error('Template upload error:', err);
                                                alert('Error processing template: ' + err.message);
                                            }
                                        };
                                        reader.readAsText(file);
                                    }}
                                />
                            </label>
                        </div>
                        
                        <div className="mt-4 p-3 bg-amber-100 rounded text-xs text-amber-900">
                            <p className="mb-1"><strong>CSV Format:</strong> Grid with modules in rows, juniors in columns, X marks for completions</p>
                            <p><strong>Sections:</strong> red (Unit), blue (Waterborne), green (Outdoor), yellow (Community), stem (STEM)</p>
                        </div>
                    </div>
                    
                    {/* Data Management Actions */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Icon name="Settings" className="w-6 h-6 text-slate-600" />
                            Data Management
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Reset Cadet Data */}
                            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                                <div className="flex items-start gap-3 mb-4">
                                    <Icon name="RefreshCw" className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-bold text-blue-900 text-lg mb-2">Reset Cadet Data</h3>
                                        <p className="text-sm text-slate-700 mb-4">
                                            Clears personnel, qualifications, and junior module data. <strong>Keeps logos and settings.</strong>
                                        </p>
                                        <p className="text-xs text-blue-800 mb-4">
                                            Use this when you want to upload fresh Westminster data without losing your unit logo.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        if (confirm('Reset cadet data? This will clear personnel, qualifications, and junior module completions. Logos will be preserved.')) {
                                            clearData();
                                            setUploadStatus('Cadet data reset successfully!');
                                            setTimeout(() => setUploadStatus(''), 3000);
                                        }
                                    }}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold w-full flex items-center justify-center gap-2"
                                >
                                    <Icon name="RefreshCw" className="w-4 h-4" />
                                    Reset Cadet Data
                                </button>
                            </div>
                            
                            {/* Wipe All Data */}
                            <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
                                <div className="flex items-start gap-3 mb-4">
                                    <Icon name="Trash2" className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-bold text-red-900 text-lg mb-2">Wipe All Data</h3>
                                        <p className="text-sm text-slate-700 mb-4">
                                            Completely clears <strong>everything</strong> including logos, settings, and all cadet data.
                                        </p>
                                        <p className="text-xs text-red-800 mb-4">
                                            <strong>Warning:</strong> This action cannot be undone. Use only when starting fresh.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        if (confirm('WIPE ALL DATA? This will delete EVERYTHING including logos. This cannot be undone!')) {
                                            if (confirm('Are you absolutely sure? This is your last chance to cancel.')) {
                                                wipeAllData();
                                                setUploadStatus('All data wiped. Redirecting to upload...');
                                                setTimeout(() => window.location.reload(), 2000);
                                            }
                                        }
                                    }}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold w-full flex items-center justify-center gap-2"
                                >
                                    <Icon name="Trash2" className="w-4 h-4" />
                                    Wipe All Data
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* System Information */}
                    <div className="bg-slate-50 rounded-lg shadow p-6 border border-slate-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">System Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-slate-600 font-semibold">Dashboard Version</p>
                                <p className="text-slate-900 font-mono">{DATA_VERSION}</p>
                            </div>
                            <div>
                                <p className="text-slate-600 font-semibold">Junior Completions</p>
                                <p className="text-slate-900">{juniorData.moduleCompletions.length} records</p>
                            </div>
                            <div>
                                <p className="text-slate-600 font-semibold">Storage Used</p>
                                <p className="text-slate-900">~{Math.round(JSON.stringify(juniorData).length / 1024)}KB</p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        // ============================================================================
        // JUNIORS VIEW COMPONENT
        // ============================================================================
        
        const JuniorsView = ({ personnel, qualifications }) => {
            const juniorData = getJuniorData();
            
            // Filter personnel to only juniors (under 12 or 12 with junior modules/rank)
            const juniors = personnel.filter(cadet => isJunior(cadet.dob, cadet.pNumber, cadet.rank));
            
            const [selectedJuniorPNum, setSelectedJuniorPNum] = useState(juniors.length > 0 ? juniors[0].pNumber : "");
            
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
                    {/* Header with Junior Selector */}
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
                            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
                                <div className="w-full md:w-64">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Junior</label>
                                    <select 
                                        value={selectedJuniorPNum}
                                        onChange={(e) => setSelectedJuniorPNum(e.target.value)}
                                        className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    >
                                        {juniors.map(junior => {
                                            // Calculate progress for this junior
                                            const juniorMods = juniorData.moduleCompletions.filter(m => m.pNumber === junior.pNumber);
                                            const redCount = juniorMods.filter(m => m.section === 'red').length;
                                            const blueCount = juniorMods.filter(m => m.section === 'blue').length;
                                            const greenCount = juniorMods.filter(m => m.section === 'green').length;
                                            const yellowCount = juniorMods.filter(m => m.section === 'yellow').length;
                                            const stemCount = juniorMods.filter(m => m.section === 'stem').length;
                                            
                                            // Check for near-completion
                                            const nearCompletion = [redCount, blueCount, greenCount, yellowCount, stemCount].some(count => count >= 13 && count < 15);
                                            const veryClose = [redCount, blueCount, greenCount, yellowCount, stemCount].some(count => count === 14);
                                            
                                            return (
                                                <option key={junior.pNumber} value={junior.pNumber}>
                                                    {junior.name} {veryClose ? '🎯' : nearCompletion ? '⭐' : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <p className="text-xs text-slate-500 mt-1">🎯 = 1 module away | ⭐ = 2 modules away</p>
                                </div>
                                <button
                                    onClick={() => {
                                        try {
                                            const selectedJunior = juniors.find(j => j.pNumber === selectedJuniorPNum) || juniors[0];
                                            const { jsPDF } = window.jspdf;
                                            const doc = new jsPDF();
                                            
                                            // Calculate needed values
                                            const age = calculateAge(selectedJunior.dob);
                                            const daysTo12 = daysTo12thBirthday(selectedJunior.dob);
                                            const currentRank = selectedJunior.rank || "Junior Cadet";
                                            const juniorModules = juniorData.moduleCompletions.filter(m => m.pNumber === selectedJunior.pNumber);
                                            const redModules = juniorModules.filter(m => m.section === 'red').length;
                                            const blueModules = juniorModules.filter(m => m.section === 'blue').length;
                                            const greenModules = juniorModules.filter(m => m.section === 'green').length;
                                            const yellowModules = juniorModules.filter(m => m.section === 'yellow').length;
                                            const stemModules = juniorModules.filter(m => m.section === 'stem').length;
                                            
                                            const pageWidth = doc.internal.pageSize.getWidth();
                                            const pageHeight = doc.internal.pageSize.getHeight();
                                            let yPos = 20;
                                            
                                            // Header
                                            doc.setFontSize(20);
                                            doc.setFont(undefined, 'bold');
                                            doc.text('Junior Sea Cadet Progress Report', pageWidth / 2, yPos, { align: 'center' });
                                            
                                            yPos += 15;
                                            doc.setFontSize(10);
                                            doc.setFont(undefined, 'normal');
                                            doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth / 2, yPos, { align: 'center' });
                                            
                                            // Junior Details
                                            yPos += 15;
                                            doc.setFontSize(14);
                                            doc.setFont(undefined, 'bold');
                                            doc.text('Cadet Information', 20, yPos);
                                            
                                            yPos += 8;
                                            doc.setFontSize(11);
                                            doc.setFont(undefined, 'normal');
                                            doc.text(`Name: ${selectedJunior.name}`, 20, yPos);
                                            yPos += 6;
                                            doc.text(`P-Number: ${selectedJunior.pNumber}`, 20, yPos);
                                            yPos += 6;
                                            doc.text(`Current Rank: ${currentRank}`, 20, yPos);
                                            yPos += 6;
                                            doc.text(`Age: ${age} years old`, 20, yPos);
                                            yPos += 6;
                                            doc.text(`Days to 12th Birthday: ${daysTo12}`, 20, yPos);
                                            
                                            // Section Progress
                                            yPos += 12;
                                            doc.setFontSize(14);
                                            doc.setFont(undefined, 'bold');
                                            doc.text('Section Progress', 20, yPos);
                                            
                                            yPos += 8;
                                            doc.setFontSize(10);
                                            doc.setFont(undefined, 'normal');
                                            
                                            const sections = [
                                                { name: 'RED - Unit Activities', count: redModules, color: [220, 38, 38] },
                                                { name: 'BLUE - Waterborne', count: blueModules, color: [37, 99, 235] },
                                                { name: 'GREEN - Outdoor', count: greenModules, color: [22, 163, 74] },
                                                { name: 'YELLOW - Community', count: yellowModules, color: [234, 179, 8] },
                                                { name: 'STEM', count: stemModules, color: [147, 51, 234] }
                                            ];
                                            
                                            sections.forEach(section => {
                                                doc.text(`${section.name}: ${section.count}/15 modules`, 25, yPos);
                                                
                                                // Progress bar
                                                const barWidth = 100;
                                                const barHeight = 4;
                                                const barX = 120;
                                                const barY = yPos - 3;
                                                
                                                // Background
                                                doc.setFillColor(240, 240, 240);
                                                doc.rect(barX, barY, barWidth, barHeight, 'F');
                                                
                                                // Progress
                                                const progressWidth = (section.count / 15) * barWidth;
                                                doc.setFillColor(section.color[0], section.color[1], section.color[2]);
                                                doc.rect(barX, barY, progressWidth, barHeight, 'F');
                                                
                                                yPos += 8;
                                            });
                                            
                                            // Completed Modules
                                            yPos += 8;
                                            doc.setFontSize(14);
                                            doc.setFont(undefined, 'bold');
                                            doc.text(`Completed Modules (${juniorModules.length} total)`, 20, yPos);
                                            
                                            yPos += 8;
                                            doc.setFontSize(9);
                                            doc.setFont(undefined, 'normal');
                                            
                                            if (juniorModules.length === 0) {
                                                doc.text('No modules completed yet.', 25, yPos);
                                            } else {
                                                // Sort by section and code
                                                const sortedModules = [...juniorModules].sort((a, b) => {
                                                    if (a.section !== b.section) return a.section.localeCompare(b.section);
                                                    return a.moduleCode.localeCompare(b.moduleCode);
                                                });
                                                
                                                let currentSection = '';
                                                sortedModules.forEach(mod => {
                                                    // Check if we need a new page
                                                    if (yPos > pageHeight - 20) {
                                                        doc.addPage();
                                                        yPos = 20;
                                                    }
                                                    
                                                    // Section header
                                                    if (mod.section !== currentSection) {
                                                        currentSection = mod.section;
                                                        doc.setFont(undefined, 'bold');
                                                        doc.text(`${mod.section.toUpperCase()}:`, 25, yPos);
                                                        yPos += 5;
                                                        doc.setFont(undefined, 'normal');
                                                    }
                                                    
                                                    // Module entry
                                                    const dateStr = formatDate(mod.dateCompleted);
                                                    doc.text(`  • ${mod.section.toUpperCase()} ${mod.moduleCode}: ${mod.moduleName}`, 27, yPos);
                                                    doc.text(dateStr, pageWidth - 30, yPos, { align: 'right' });
                                                    yPos += 5;
                                                });
                                            }
                                            
                                            // Awards Section
                                            if (yPos > pageHeight - 40) {
                                                doc.addPage();
                                                yPos = 20;
                                            }
                                            
                                            yPos += 8;
                                            doc.setFontSize(14);
                                            doc.setFont(undefined, 'bold');
                                            doc.text('Awards & Qualifications', 20, yPos);
                                            
                                            yPos += 8;
                                            doc.setFontSize(9);
                                            doc.setFont(undefined, 'normal');
                                            
                                            const cadetQuals = qualifications.filter(q => q.pNumber === selectedJunior.pNumber);
                                            if (cadetQuals.length === 0) {
                                                doc.text('No awards recorded yet.', 25, yPos);
                                            } else {
                                                cadetQuals.forEach(qual => {
                                                    if (yPos > pageHeight - 20) {
                                                        doc.addPage();
                                                        yPos = 20;
                                                    }
                                                    const dateStr = qual.date ? formatDate(qual.date) : 'No date';
                                                    doc.text(`  • ${qual.module}`, 25, yPos);
                                                    doc.text(dateStr, pageWidth - 30, yPos, { align: 'right' });
                                                    yPos += 5;
                                                });
                                            }
                                            
                                            // Footer
                                            const footerY = pageHeight - 10;
                                            doc.setFontSize(8);
                                            doc.setTextColor(128, 128, 128);
                                            doc.text('Sea Cadet Training Dashboard - Junior Progress Report', pageWidth / 2, footerY, { align: 'center' });
                                            
                                            // Save
                                            const filename = `${selectedJunior.name.replace(/\s+/g, '_')}_Progress_Report_${new Date().toISOString().split('T')[0]}.pdf`;
                                            doc.save(filename);
                                            
                                        } catch (error) {
                                            console.error('PDF Export Error:', error);
                                            alert('Error generating PDF. Please try again or check the console for details.');
                                        }
                                    }}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md transition-colors whitespace-nowrap"
                                    aria-label="Export progress report as PDF"
                                >
                                    <Icon name="FileDown" className="w-4 h-4" />
                                    Export PDF
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Progress Alert Summary */}
                    {(() => {
                        const juniorsWithAlerts = juniors.filter(junior => {
                            const juniorMods = juniorData.moduleCompletions.filter(m => m.pNumber === junior.pNumber);
                            const counts = [
                                juniorMods.filter(m => m.section === 'red').length,
                                juniorMods.filter(m => m.section === 'blue').length,
                                juniorMods.filter(m => m.section === 'green').length,
                                juniorMods.filter(m => m.section === 'yellow').length,
                                juniorMods.filter(m => m.section === 'stem').length
                            ];
                            return counts.some(count => count >= 13 && count < 15);
                        });
                        
                        if (juniorsWithAlerts.length === 0) return null;
                        
                        return (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4 shadow">
                                <div className="flex items-center gap-3">
                                    <Icon name="Bell" className="w-6 h-6 text-green-600" />
                                    <div>
                                        <p className="font-bold text-green-900">
                                            {juniorsWithAlerts.length} junior{juniorsWithAlerts.length !== 1 ? 's are' : ' is'} close to earning badges!
                                        </p>
                                        <p className="text-sm text-green-800">
                                            {juniorsWithAlerts.map(j => j.name).join(', ')} {juniorsWithAlerts.length === 1 ? 'needs' : 'need'} just 1-2 more modules
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                    
                    {/* Junior Detail */}
                    <JuniorDetail junior={selectedJunior} juniorData={juniorData} personnel={personnel} qualifications={qualifications} />
                </div>
            );
        };
        
        // --- 3.10 JUNIOR DETAIL COMPONENT ---
        const JuniorDetail = ({ junior, juniorData, personnel, qualifications }) => {
            const [section, setSection] = useState('red');
            const [moduleCode, setModuleCode] = useState('');
            const [dateCompleted, setDateCompleted] = useState(new Date().toISOString().split('T')[0]);
            const [showSuccess, setShowSuccess] = useState(false);
            
            const age = calculateAge(junior.dob);
            const daysTo12 = daysTo12thBirthday(junior.dob);
            
            // Get this junior's completed modules
            const juniorModules = juniorData.moduleCompletions.filter(m => m.pNumber === junior.pNumber);
            
            // Get section progress
            const redModules = juniorModules.filter(m => m.section === 'red').length;
            const blueModules = juniorModules.filter(m => m.section === 'blue').length;
            const greenModules = juniorModules.filter(m => m.section === 'green').length;
            const yellowModules = juniorModules.filter(m => m.section === 'yellow').length;
            const stemModules = juniorModules.filter(m => m.section === 'stem').length;
            
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
            
            const handleModuleSubmit = () => {
                if (!moduleCode.trim()) {
                    alert("Please enter a module code");
                    return;
                }
                
                // Remove support for comma-separated (one at a time for validation)
                const code = moduleCode.trim();
                
                // Basic validation: check format (should be number or number.number)
                const validFormat = /^\d+(\.\d+)?$/.test(code);
                if (!validFormat) {
                    alert(`Invalid module code format: "${code}"\nPlease enter a valid code like "1" or "1.1"`);
                    return;
                }
                
                // Warning for unusual codes (over 100 or with many decimals)
                const numericCode = parseFloat(code);
                if (numericCode > 100) {
                    if (!confirm(`Module code "${code}" seems unusual. Are you sure this is correct?`)) {
                        return;
                    }
                }
                
                // Create module object
                const newModule = {
                    pNumber: junior.pNumber,
                    section: section,
                    moduleCode: code.toUpperCase(),
                    moduleName: `${section.toUpperCase()} ${code}`,
                    dateCompleted: dateCompleted,
                    isCore: false
                };
                
                const updatedData = {
                    ...juniorData,
                    moduleCompletions: [...juniorData.moduleCompletions, newModule]
                };
                
                if (saveJuniorData(updatedData)) {
                    setShowSuccess(true);
                    setModuleCode('');
                    setTimeout(() => {
                        setShowSuccess(false);
                        window.location.reload(); // Refresh to show new data
                    }, 1500);
                } else {
                    alert("Error saving module completions");
                }
            };
            
            const handleModuleDelete = (moduleToDelete) => {
                const confirmMessage = `Are you sure you want to delete this module?\n\n${moduleToDelete.section.toUpperCase()} ${moduleToDelete.moduleCode}: ${moduleToDelete.moduleName}\nCompleted: ${formatDate(moduleToDelete.dateCompleted)}\n\nThis action cannot be undone.`;
                
                if (!confirm(confirmMessage)) {
                    return;
                }
                
                // Filter out the module to delete
                const updatedCompletions = juniorData.moduleCompletions.filter(m => 
                    !(m.pNumber === moduleToDelete.pNumber && 
                      m.section === moduleToDelete.section && 
                      m.moduleCode === moduleToDelete.moduleCode &&
                      m.dateCompleted === moduleToDelete.dateCompleted)
                );
                
                const updatedData = {
                    ...juniorData,
                    moduleCompletions: updatedCompletions
                };
                
                if (saveJuniorData(updatedData)) {
                    alert("Module deleted successfully");
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
                                        {RANK_IMG_MAP[currentRank] || currentRank === "Able Junior Cadet" ? (
                                            <>
                                                {currentRank === "Able Junior Cadet" || RANK_IMG_MAP[currentRank]?.count === 2 ? (
                                                    <div className="flex gap-1">
                                                        <img src="media/scc_junior_star.webp" className="h-10 w-auto object-contain shadow-sm" alt="Rank Star 1" onError={(e) => e.target.style.display = 'none'} />
                                                        <img src="media/scc_junior_star.webp" className="h-10 w-auto object-contain shadow-sm" alt="Rank Star 2" onError={(e) => e.target.style.display = 'none'} />
                                                    </div>
                                                ) : (
                                                    <>
                                                        {RANK_IMG_MAP[currentRank]?.sleeve && <img src={`media/${RANK_IMG_MAP[currentRank].sleeve}`} className="h-10 w-auto object-contain shadow-sm" alt="Sleeve Rank" title="Sleeve Badge" onError={(e) => e.target.style.display = 'none'} />}
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            <div className="h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
                                                <Icon name="Shield" className="w-5 h-5"/>
                                            </div>
                                        )}
                                        <p className="font-bold text-2xl text-blue-600 leading-tight">{currentRank}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600 mb-2">Next Rank</p>
                                <p className="text-sm font-semibold text-slate-700 mb-2">{nextRank}</p>
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
                                    const redBadge = qualifications?.find(q => q.pNumber === junior.pNumber && q.module.includes("JSC Red Unit Activities Badge"));
                                    if (redBadge && redBadge.date) {
                                        return <p className="text-xs font-semibold text-red-900 mt-2 bg-red-100 py-1 px-2 rounded">Awarded on {formatDate(redBadge.date)}</p>;
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
                                    const blueBadge = qualifications?.find(q => q.pNumber === junior.pNumber && q.module.includes("JSC Blue Waterborne Activities Badge"));
                                    if (blueBadge && blueBadge.date) {
                                        return <p className="text-xs font-semibold text-blue-900 mt-2 bg-blue-100 py-1 px-2 rounded">Awarded on {formatDate(blueBadge.date)}</p>;
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
                                    const greenBadge = qualifications?.find(q => q.pNumber === junior.pNumber && q.module.includes("JSC Green Outdoor & Recreation Activities Badge"));
                                    if (greenBadge && greenBadge.date) {
                                        return <p className="text-xs font-semibold text-green-900 mt-2 bg-green-100 py-1 px-2 rounded">Awarded on {formatDate(greenBadge.date)}</p>;
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
                                    const yellowBadge = qualifications?.find(q => q.pNumber === junior.pNumber && q.module.includes("JSC Yellow Community & Citizenship Activities Badge"));
                                    if (yellowBadge && yellowBadge.date) {
                                        return <p className="text-xs font-semibold text-yellow-900 mt-2 bg-yellow-100 py-1 px-2 rounded">Awarded on {formatDate(yellowBadge.date)}</p>;
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
                                    const stemBadge = qualifications?.find(q => q.pNumber === junior.pNumber && q.module.includes("JSC STEM Unit Activities Badge"));
                                    if (stemBadge && stemBadge.date) {
                                        return <p className="text-xs font-semibold text-purple-900 mt-2 bg-purple-100 py-1 px-2 rounded">STEM Awarded on {formatDate(stemBadge.date)}</p>;
                                    } else if (stemModules >= 15) {
                                        return <p className="text-xs font-bold text-purple-900 mt-2 bg-purple-100 py-1 px-2 rounded">STEM AWARD DUE</p>;
                                    } else if (stemModules >= 8 && !qualifications?.some(q => q.pNumber === junior.pNumber && q.module.includes("JSC Crest Award"))) {
                                        return <p className="text-xs font-bold text-purple-900 mt-2 bg-purple-100 py-1 px-2 rounded">CREST AWARD DUE</p>;
                                    }
                                    return null;
                                })()}
                            </div>
                        </div>
                        
                        {/* Progress Alerts - NEW: Show when close to earning badges */}
                        {(() => {
                            const alerts = [];
                            
                            // Check each section for near-completion (13 or 14 modules)
                            const sections = [
                                { 
                                    name: 'RED - Unit', 
                                    count: redModules, 
                                    icon: 'Home',
                                    colors14: { bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-900', icon: 'text-red-600' },
                                    colors13: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-800', icon: 'text-red-500' }
                                },
                                { 
                                    name: 'BLUE - Waterborne', 
                                    count: blueModules, 
                                    icon: 'Waves',
                                    colors14: { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-900', icon: 'text-blue-600' },
                                    colors13: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-800', icon: 'text-blue-500' }
                                },
                                { 
                                    name: 'GREEN - Outdoor', 
                                    count: greenModules, 
                                    icon: 'Trees',
                                    colors14: { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-900', icon: 'text-green-600' },
                                    colors13: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-800', icon: 'text-green-500' }
                                },
                                { 
                                    name: 'YELLOW - Community', 
                                    count: yellowModules, 
                                    icon: 'Users',
                                    colors14: { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-900', icon: 'text-yellow-600' },
                                    colors13: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-800', icon: 'text-yellow-500' }
                                },
                                { 
                                    name: 'STEM', 
                                    count: stemModules, 
                                    icon: 'Atom',
                                    colors14: { bg: 'bg-purple-50', border: 'border-purple-400', text: 'text-purple-900', icon: 'text-purple-600' },
                                    colors13: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-800', icon: 'text-purple-500' }
                                }
                            ];
                            
                            sections.forEach(section => {
                                if (section.count === 14) {
                                    alerts.push({
                                        ...section,
                                        urgency: 'high',
                                        message: 'Just 1 more module for badge!',
                                        bgColor: section.colors14.bg,
                                        borderColor: section.colors14.border,
                                        textColor: section.colors14.text,
                                        iconColor: section.colors14.icon
                                    });
                                } else if (section.count === 13) {
                                    alerts.push({
                                        ...section,
                                        urgency: 'medium',
                                        message: 'Only 2 more modules needed!',
                                        bgColor: section.colors13.bg,
                                        borderColor: section.colors13.border,
                                        textColor: section.colors13.text,
                                        iconColor: section.colors13.icon
                                    });
                                }
                            });
                            
                            if (alerts.length === 0) return null;
                            
                            return (
                                <div className="mt-4 space-y-2">
                                    {alerts.map((alert, idx) => (
                                        <div key={idx} className={`p-3 ${alert.bgColor} border-2 ${alert.borderColor} rounded-lg`}>
                                            <div className="flex items-center gap-3">
                                                <Icon name={alert.icon} className={`w-6 h-6 ${alert.iconColor}`} />
                                                <div className="flex-1">
                                                    <p className={`font-bold text-sm ${alert.textColor}`}>
                                                        {alert.name}: {alert.count}/15 modules completed
                                                    </p>
                                                    <p className={`text-xs ${alert.textColor}`}>
                                                        {alert.message} {alert.urgency === 'high' ? '🎯' : '⭐'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                        
                        {/* Commodore's Broad Pennant Alert - CORRECTED LOGIC: All 4 badges awarded + 8 extra modules each (23 total) */}
                        {(() => {
                            const hasRedBadge = qualifications?.some(q => q.pNumber === junior.pNumber && q.module.includes("JSC Red Unit Activities Badge"));
                            const hasBlueBadge = qualifications?.some(q => q.pNumber === junior.pNumber && q.module.includes("JSC Blue Waterborne Activities Badge"));
                            const hasGreenBadge = qualifications?.some(q => q.pNumber === junior.pNumber && q.module.includes("JSC Green Outdoor & Recreation Activities Badge"));
                            const hasYellowBadge = qualifications?.some(q => q.pNumber === junior.pNumber && q.module.includes("JSC Yellow Community & Citizenship Activities Badge"));
                            const hasPennant = qualifications?.some(q => q.pNumber === junior.pNumber && q.module.includes("JSC Commodores Broad Pennant"));
                            
                            const meetsRequirements = hasRedBadge && hasBlueBadge && hasGreenBadge && hasYellowBadge && 
                                                      redModules >= 23 && blueModules >= 23 && greenModules >= 23 && yellowModules >= 23;
                            
                            if (meetsRequirements && !hasPennant) {
                                return (
                                    <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Icon name="Award" className="w-8 h-8 text-amber-600" />
                                            <div>
                                                <p className="font-bold text-amber-900 text-lg">COMMODORE'S BROAD PENNANT DUE!</p>
                                                <p className="text-sm text-amber-800">All four core badges awarded + 8 extra modules from each section completed</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </div>
                    {/* Junior Proficiencies and Commodore's Pennant - Side by Side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        {/* Junior Proficiencies - LEFT */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Icon name="Award" className="w-5 h-5 text-purple-600"/> Junior Proficiencies</h3>
                            {(() => {
                                const cadetQuals = qualifications.filter(q => q.pNumber === junior.pNumber && q.module);
                                const awardedProficiencies = [];
                                
                                // Swim Test (always show, required)
                                const swimQual = cadetQuals.find(q => {
                                    const m = q.module.toLowerCase();
                                    return m.includes("swim test") || m.includes("swimming test") || m.includes("water safety");
                                });

                                if (swimQual) {
                                    awardedProficiencies.push({ name: "Swim Test / Water Safety", key: "Swim Test", date: swimQual.date });
                                } else {
                                    awardedProficiencies.push({ name: "Swim Test Required", key: "No Swim Test", date: null });
                                }

                                // Check for waterborne profs
                                const profNames = [
                                    { search: ["Rowing Coxswain", "Row 3"], key: "Rowing Coxswain" },
                                    { search: ["Paddle Explore"], key: "Paddle Explore Award" },
                                    { search: ["Paddle Discover"], key: "Paddle Discover Award" },
                                    { search: ["YSS Stage 2", "Sail - RYA YSS Stage 2"], key: "Sailing Stage 2 / Level 1" },
                                    { search: ["YSS Stage 3"], key: "Sailing Stage 3 / Level 2" },
                                    { search: ["YSS Stage 4"], key: "Sailing Stage 4 / Level 3" },
                                    { search: ["Powerboat Level 1"], key: "RYA Powerboat Level 1" },
                                    { search: ["Powerboat Level 2"], key: "RYA Powerboat Level 2" },
                                    { search: ["Go Row 2"], key: "Rowing Competent Crew" }
                                ];

                                profNames.forEach(prof => {
                                    const found = cadetQuals.find(q => prof.search.some(s => q.module.includes(s)));
                                    if (found) {
                                        awardedProficiencies.push({ name: found.module, key: prof.key, date: found.date });
                                    }
                                });
                                
                                // Check for JSC STEM Award (8+ STEM modules OR explicit qualification)
                                const stemAwardQual = cadetQuals.find(q => q.module.includes("JSC STEM") || q.module.includes("STEM Unit Activities Badge"));
                                if (stemAwardQual) {
                                    awardedProficiencies.push({ name: "JSC STEM Award", key: "JSC STEM Unit Activities Badge", date: stemAwardQual.date });
                                } else if (stemModules >= 8) {
                                    // Award is due but not yet recorded in qualifications
                                    awardedProficiencies.push({ name: "JSC STEM Award (DUE)", key: "JSC STEM Unit Activities Badge", date: null });
                                }

                                return awardedProficiencies.length === 0 ? (
                                    <div className="w-full text-center py-4 text-slate-400 italic bg-slate-50 rounded border border-dashed">No proficiencies found for this junior.</div>
                                ) : (
                                    <div className="flex gap-4 overflow-x-auto pb-4">
                                        {awardedProficiencies.map((prof, idx) => (
                                            <div key={idx} className="flex-shrink-0 flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-lg p-3 min-w-[120px] text-center">
                                                <div className="h-24 flex items-center justify-center mb-2">
                                                    <BadgeImage name={prof.key} className="h-24 w-auto object-contain" fallbackIcon="Award"/>
                                                </div>
                                                <p className="text-xs font-bold text-slate-700 leading-tight">{prof.name}</p>
                                                <p className="text-[10px] text-slate-500 mt-1">{formatDate(prof.date)}</p>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>
                        
                        {/* Commodore's Broad Pennant - RIGHT */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <h3 className="text-xl font-bold text-purple-900">Commodore's Broad Pennant</h3>
                                <span className="text-sm text-purple-600 font-semibold">Highest Junior Achievement</span>
                            </div>
                            {(() => {
                                // Check if awarded
                                const hasPennant = qualifications?.find(q => 
                                    q.pNumber === junior.pNumber && 
                                    (q.module.includes("Commodore") || q.module.includes("Pennant"))
                                );
                                
                                if (hasPennant) {
                                    return (
                                        <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-300 text-center">
                                            <img 
                                                src="scc_award_commodores_pennant.webp" 
                                                alt="Commodore's Broad Pennant"
                                                className="w-32 h-32 mx-auto mb-3"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            />
                                            <div style={{display: 'none'}} className="text-5xl mb-3">🏆</div>
                                            <p className="text-lg font-bold text-purple-900 mb-1">AWARDED</p>
                                            {hasPennant.date && <p className="text-sm text-purple-700">on {formatDate(hasPennant.date)}</p>}
                                        </div>
                                    );
                                }
                                
                                // Calculate what's still needed
                                const remaining = [];
                                
                                // Check badges (15+ modules needed)
                                if (redModules < 15) remaining.push(`${15 - redModules} more RED module${15 - redModules > 1 ? 's' : ''} for badge (currently ${redModules}/15)`);
                                if (blueModules < 15) remaining.push(`${15 - blueModules} more BLUE module${15 - blueModules > 1 ? 's' : ''} for badge (currently ${blueModules}/15)`);
                                if (greenModules < 15) remaining.push(`${15 - greenModules} more GREEN module${15 - greenModules > 1 ? 's' : ''} for badge (currently ${greenModules}/15)`);
                                if (yellowModules < 15) remaining.push(`${15 - yellowModules} more YELLOW module${15 - yellowModules > 1 ? 's' : ''} for badge (currently ${yellowModules}/15)`);
                                
                                // Check extra modules (23+ total needed)
                                if (redModules >= 15 && redModules < 23) remaining.push(`${23 - redModules} more RED module${23 - redModules > 1 ? 's' : ''} for 8 extra (currently ${redModules}/23)`);
                                if (blueModules >= 15 && blueModules < 23) remaining.push(`${23 - blueModules} more BLUE module${23 - blueModules > 1 ? 's' : ''} for 8 extra (currently ${blueModules}/23)`);
                                if (greenModules >= 15 && greenModules < 23) remaining.push(`${23 - greenModules} more GREEN module${23 - greenModules > 1 ? 's' : ''} for 8 extra (currently ${greenModules}/23)`);
                                if (yellowModules >= 15 && yellowModules < 23) remaining.push(`${23 - yellowModules} more YELLOW module${23 - yellowModules > 1 ? 's' : ''} for 8 extra (currently ${yellowModules}/23)`);
                                
                                if (remaining.length === 0) {
                                    return (
                                        <div className="bg-green-50 p-6 rounded-lg border-2 border-green-300 text-center">
                                            <p className="text-lg font-bold text-green-900 mb-2">✓ ALL REQUIREMENTS MET</p>
                                            <p className="text-sm text-green-700">Ready to be awarded the Commodore's Broad Pennant!</p>
                                        </div>
                                    );
                                }
                                
                                return (
                                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                        <p className="text-sm font-semibold text-purple-700 mb-3">Still needed:</p>
                                        <ul className="text-sm text-slate-700 space-y-2">
                                            {remaining.map((req, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span className="text-purple-600 font-bold">•</span>
                                                    <span>{req}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })()}
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
                                    placeholder="e.g. 1 or 1.1 (will validate against official list)"
                                    className="w-full p-2 border border-slate-300 rounded-lg"
                                    aria-label="Enter module code"
                                    list="module-codes"
                                />
                                <datalist id="module-codes">
                                    <option value="1" />
                                    <option value="1.1" />
                                    <option value="1.2" />
                                    <option value="1.3" />
                                    <option value="1.4" />
                                    <option value="1.5" />
                                    <option value="2" />
                                    <option value="2.1" />
                                    <option value="2.2" />
                                    <option value="3" />
                                    <option value="4" />
                                    <option value="5" />
                                </datalist>
                                <p className="text-xs text-slate-500 mt-1">Enter one code at a time. Code will be validated.</p>
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
                                        <div className="flex-1">
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
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-slate-500">{formatDate(mod.dateCompleted)}</span>
                                            <button
                                                onClick={() => handleModuleDelete(mod)}
                                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs font-semibold transition-colors"
                                                aria-label={`Delete module ${mod.section.toUpperCase()} ${mod.moduleCode}`}
                                                title="Delete this module"
                                            >
                                                Delete
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
                                            <p className="text-[10px] text-slate-500 mt-1">{formatDate(award.date)}</p>
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
        
        // --- GLOBAL IMPORT WARNINGS BANNER ---
        const ImportWarningsBanner = () => {
            const [warnings, setWarnings] = useState(null);
            
            useEffect(() => {
                const stored = localStorage.getItem('importWarnings');
                if (stored) {
                    try {
                        setWarnings(JSON.parse(stored));
                    } catch (e) {
                        console.error('Error parsing import warnings', e);
                    }
                }
            }, []);
            
            const downloadWarnings = () => {
                if (!warnings || !warnings.warnings) return;
                
                const csvContent = "data:text/csv;charset=utf-8," 
                    + "Row,Warning\n"
                    + warnings.warnings.map(err => {
                        const match = err.match(/Row (\d+): (.+)/);
                        if (match) {
                            return `${match[1]},"${match[2].replace(/"/g, '""')}"`;
                        }
                        return `,"${err.replace(/"/g, '""')}"`;
                    }).join("\n");
                
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `validation_warnings_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };
            
            const dismiss = () => {
                localStorage.removeItem('importWarnings');
                setWarnings(null);
            };
            
            if (!warnings || !warnings.warnings || warnings.warnings.length === 0) {
                return null;
            }
            
            return (
                <div className="fixed top-0 left-0 right-0 z-50 bg-amber-50 border-b-4 border-amber-500 shadow-lg">
                    <div className="max-w-7xl mx-auto p-4">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <p className="font-bold text-amber-900 flex items-center gap-2 mb-2">
                                    <Icon name="AlertTriangle" className="w-5 h-5" />
                                    {warnings.warnings.length} Validation Warning{warnings.warnings.length !== 1 ? 's' : ''} from Recent Import
                                </p>
                                <div className="text-sm text-amber-800 max-h-32 overflow-y-auto space-y-1 mb-2">
                                    {warnings.warnings.slice(0, 5).map((err, idx) => (
                                        <div key={idx} className="pl-2 border-l-2 border-amber-300">• {err}</div>
                                    ))}
                                    {warnings.warnings.length > 5 && (
                                        <p className="font-semibold">...and {warnings.warnings.length - 5} more warnings</p>
                                    )}
                                </div>
                                <p className="text-xs text-amber-700">
                                    Imported {warnings.personnelCount} personnel and {warnings.qualsCount} qualifications with some data quality issues.
                                </p>
                            </div>
                            <div className="flex gap-2 ml-4">
                                <button 
                                    onClick={downloadWarnings}
                                    className="text-amber-700 hover:text-amber-900 flex items-center gap-1 text-sm font-semibold px-3 py-1 bg-amber-100 rounded hover:bg-amber-200"
                                    title="Download warnings as CSV"
                                >
                                    <Icon name="Download" className="w-4 h-4" />
                                    Download CSV
                                </button>
                                <button 
                                    onClick={dismiss} 
                                    className="text-amber-600 hover:text-amber-800"
                                    title="Dismiss warnings"
                                >
                                    <Icon name="X" className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };
        
        const App = () => {
            const [view, setView] = useState('upload'); 
            const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
            const [personnelData, setPersonnelData] = useState([]);
            const [qualsData, setQualsData] = useState([]);
            // NEW STATE for Drill Down Feature
            const [drillDownInfo, setDrillDownInfo] = useState(null); 

            // Icon Render - run when view changes or sidebar collapses/expands

            useEffect(() => {
                const savedVersion = localStorage.getItem('scc_version');
                if (savedVersion !== DATA_VERSION) {
                    localStorage.clear();
                    localStorage.setItem('scc_version', DATA_VERSION);
                } else {
                    const savedP = localStorage.getItem('scc_personnel');
                    const savedQ = localStorage.getItem('scc_quals');
                    if (savedP && savedQ) {
                        try {
                            const parsedP = JSON.parse(savedP);
                            const parsedQ = JSON.parse(savedQ);
                            
                            // Rehydrate Date objects
                            const hydratedQ = parsedQ.map(q => ({
                                ...q,
                                date: q.date ? new Date(q.date) : null
                            }));
                            
                            setPersonnelData(parsedP);
                            setQualsData(hydratedQ);
                            // Set to 'home' view when data is loaded from storage
                            setView('home'); 
                        } catch (e) {
                            console.error("Error rehydrating data", e);
                            localStorage.clear();
                        }
                    }
                }
            }, []);

            const handleDataLoaded = (pData, qData) => {
                setPersonnelData(pData);
                setQualsData(qData);
                localStorage.setItem('scc_personnel', JSON.stringify(pData));
                localStorage.setItem('scc_quals', JSON.stringify(qData));
                // Set to 'home' view when data is freshly loaded
                setView('home'); 
            };

            const clearData = () => {
                // Only clear cadet data, preserve logos
                localStorage.removeItem('scc_personnel');
                localStorage.removeItem('scc_quals');
                localStorage.removeItem('scc_version');
                window.location.reload();
            };

            const wipeAllData = () => {
                // Clear everything including logos
                localStorage.clear();
                window.location.reload();
            };

            // NEW: Handler for Module Drill-Down
            const handleModuleDrillDown = (module, targetRank, cadetsNeeding) => {
                setDrillDownInfo({ module, targetRank, cadetsNeeding });
            };

            // Memoized progress calculation to prevent unnecessary recalculations
            const getCadetProgress = useCallback((cadet) => {
                 const isRMC = RMC_RANK_ORDER.includes(cadet.rank);
                 const syllabus = isRMC ? RMC_SYLLABUS : SCC_SYLLABUS;
                 const currentRankSyllabus = syllabus[cadet.rank];
                 if (!currentRankSyllabus) return { percentage: 0 };
                 let total = 0, passed = 0;
                 Object.values(currentRankSyllabus).forEach(cat => cat.forEach(m => {
                     total++;
                     if(qualsData.some(q => q.pNumber === cadet.pNumber && q.module.includes(m.code))) passed++;
                 }));
                 return { percentage: total === 0 ? 100 : Math.round((passed/total)*100) };
            }, [qualsData]);

            const NavItem = ({ id, icon, label }) => (
                <button onClick={() => setView(id)} className={`flex items-center gap-2 w-full p-2 rounded-lg transition-all text-sm ${view === id ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-800/50'}`}>
                    <Icon name={icon} className="w-4 h-4" />
                    {!sidebarCollapsed && <span className="text-sm">{label}</span>}
                </button>
            );

            if (view === 'upload' && personnelData.length === 0) {
                return (
                    <div>
                        <ImportWarningsBanner />
                        <div className="min-h-screen flex flex-col items-center pt-5 pb-10">
                        <img src="media/ts_dashboard.webp" alt="TS Dashboard" className="w-[300px] h-auto mb-2 object-contain" />
                        <h1 className="text-4xl font-extrabold text-blue-900 mb-1">Sea Cadet Training Dashboard</h1>
                        <FileUploader onDataLoaded={handleDataLoaded} hasData={personnelData.length > 0} clearData={clearData} wipeAllData={wipeAllData} />
                        
                        {/* Disclaimer Section when no data loaded */}
                        <div className="mt-8 max-w-2xl text-center text-xs text-slate-400 p-4 border-t border-slate-200">
                            <p className="font-semibold mb-1">Disclaimer</p>
                            <p>This has been created independently of the MSSC and no warranty of offered or implied etc. Feature requests and bug fixes should be addressed to James Harbidge - jharbidge@mhseacadets.org</p>
                            <p className="mt-3 text-[10px] text-slate-300">Version {DATA_VERSION}</p>
                        </div>
                        </div>
                    </div>
                );
            }

            return (
                <ErrorBoundary>
                    <ImportWarningsBanner />
                    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-900">
                        <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-blue-900 text-white flex flex-col shadow-2xl fixed h-full z-10 transition-all duration-300`}>
                            <div className="p-4 border-b border-blue-800 flex flex-col items-center relative">
                                {!sidebarCollapsed && (
                                    <div className="flex flex-col items-center mb-2 w-full">
                                        <img src="media/ts_dashboard.webp" alt="TS Dashboard" className="object-contain w-full h-auto mb-2" />
                                        <p className="text-xs text-blue-300 truncate font-semibold text-center w-full">{personnelData.length > 0 ? personnelData[0].unit : 'Unit Dashboard'}</p>
                                    </div>
                                )}
                                <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} title="Toggle Sidebar" className={`p-1 hover:bg-blue-800 rounded absolute top-2 right-2 ${sidebarCollapsed ? 'static mt-2' : ''}`}>
                                    <Icon name={sidebarCollapsed ? "ChevronRight" : "ChevronLeft"} className="w-5 h-5"/>
                                </button>
                            </div>
                            <nav className="flex-1 p-3 space-y-0.5 overflow-hidden">
                                <NavItem id="home" icon="Home" label="Home" />
                                <NavItem id="juniors" icon="Users" label="Junior Focus" />
                                <NavItem id="junior_progress" icon="BarChart3" label="Junior Progress" />
                                <NavItem id="cadet_focus" icon="User" label="Cadet Focus" />
                                <NavItem id="planner" icon="ShipWheel" label="SCC CTP Progress" />
                                <NavItem id="rmc_planner" icon="Target" label="RMC CTS Progress" />
                                <NavItem id="waterborne" icon="Anchor" label="Waterborne" />
                                <NavItem id="awards" icon="Award" label="Awards" />
                                <NavItem id="suggestions" icon="ChartGantt" label="Training Plan" />
                                <NavItem id="data_utilities" icon="Database" label="Data / Utilities" />
                            </nav>
                            <div className="p-3 border-t border-blue-800">
                                {!sidebarCollapsed && (
                                    <div>
                                        <p className="text-[9px] text-blue-500 text-center">v{DATA_VERSION}</p>
                                    </div>
                                )}
                            </div>
                        </aside>
                        <main className={`flex-1 ${sidebarCollapsed ? 'ml-20' : 'ml-64'} p-8 overflow-y-auto transition-all duration-300`}>
                            {view === 'home' && <HomeView personnel={personnelData} />} 
                            {view === 'cadet_focus' && <CadetFocus personnel={personnelData} qualsData={qualsData} />}
                            {view === 'juniors' && <JuniorsView personnel={personnelData} qualifications={qualsData} />}
                            {view === 'junior_progress' && <JuniorProgressView personnel={personnelData} />}
                            {view === 'awards' && <AwardsView personnel={personnelData} quals={qualsData} />}
                            {(view === 'waterborne') && <WaterborneView personnel={personnelData} qualsData={qualsData} />}
                            {(view === 'planner') && <TrainingPlanner personnel={personnelData} getCadetProgress={getCadetProgress} qualsData={qualsData} title="SCC CTP Progress" rankOrder={SCC_RANK_ORDER} syllabus={SCC_SYLLABUS} iconName="ShipWheel" onModuleClick={handleModuleDrillDown} />}
                            {(view === 'rmc_planner') && <TrainingPlanner personnel={personnelData} getCadetProgress={getCadetProgress} qualsData={qualsData} title="RMC CTS Progress" rankOrder={RMC_RANK_ORDER} syllabus={RMC_SYLLABUS} colorTheme="green" iconName="Target" onModuleClick={handleModuleDrillDown} />}
                            {(view === 'suggestions') && <TrainingSuggestions personnel={personnelData} getCadetProgress={getCadetProgress} qualsData={qualsData} />}
                            {view === 'data_utilities' && <DataUtilitiesView clearData={clearData} wipeAllData={wipeAllData} setView={setView} personnel={personnelData} />}
                        </main>
                    </div>
                    {/* Render the Drill Down Modal */}
                    <ModuleDrillDown info={drillDownInfo} onClose={() => setDrillDownInfo(null)} />
                </ErrorBoundary>
            );
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
        
        console.log(`RC2.68e loaded successfully! Version: ${DATA_VERSION}`);
        console.log("RC2.68e FEATURE: JSC STEM Award displayed in Junior Proficiencies box 🔬");
        console.log("RC2.68d IMPROVED: Junior Proficiencies and Commodore's Pennant side-by-side (saves vertical space)");
        console.log("RC2.68c IMPROVED: Alert boxes match section colours, Pennant moved below Section Progress");
        console.log("RC2.68b IMPROVED: Pennant box moved below age section, shows only remaining requirements");
        console.log("RC2.68a CORRECTED: Commodore's Broad Pennant requirements - 4 coloured badges + 8 extra modules each");
        console.log("RC2.68 NEW FEATURE: Commodore's Pennant requirements display on Junior Focus view");
        console.log("RC2.67d FEATURE: Template now pre-filled with existing completions (X marks) ✓");
        console.log("RC2.67c BUGFIX: Fixed CSV header format - names properly formatted ✓");
        console.log("RC2.67b BUGFIX: Fixed template download with all 335 official junior modules ✓");
        console.log("RC2.67a BUGFIX: Fixed template download button (corrected constant name)");
        console.log("RC2.67 BUG FIXES:");
        console.log("  - Waterborne page now shows cadets only (adults excluded)");
        console.log("  - Text updated: 'Bulk Upload Junior Modules from Legacy System'");
        console.log("  - Template format: Grid with X marks (modules down, cadets across)");
        console.log("RC2.66 FIXED: Recognize numeric-only P-Number format (7-8 digits like 11806919)");
        console.log("RC2.65 FIXED: Recognize adult volunteer P-Number formats (CV##### and L######L) - no more false warnings!");
        console.log("RC2.65 FIXED: Missing rank now treated as 'Unit Assistant (UA)' for adult volunteers");
        console.log("RC2.64 NEW: Persistent warnings banner - Validation warnings now stay visible after import and can be dismissed");
        console.log("RC2.63 NEW: Download validation warnings as CSV + More lenient validation for Westminster data");
        console.log("RC2.62a BUGFIX: Fixed duplicate function declaration error");
        console.log("RC2.62 NEW FEATURE: Enhanced Bulk Upload - Row-by-row validation, error reporting, and import summary ✓");
        console.log("RC2.62 ADJUSTMENT: PDF Export button moved to header next to junior selector");
        console.log("RC2.61 NEW FEATURE: Individual PDF Reports - Export professional progress reports with 'Export PDF Report' button 📄");
        console.log("RC2.60 NEW FEATURE: Progress Alerts - Shows when juniors are 1-2 modules away from earning badges 🎯⭐");
        console.log("RC2.59a BUGFIX: Fixed ReferenceError in isJunior function");
        console.log("RC2.59 HIGH PRIORITY FIXES: Module deletion, validation, 12-year-old boundary, checkmarks, ARIA labels");
        console.log("RC2.58: CRITICAL FIX - Corrected 341 official Junior modules from MSSC syllabus");
        console.log("Features: Home → Cadet Focus → Juniors → Junior Progress (GRID) → CTP → CTS → Waterborne → Awards → Training Plan");

export default App;
