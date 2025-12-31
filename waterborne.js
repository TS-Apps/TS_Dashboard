/**
 * Sea Cadet Training Dashboard - Waterborne View Module
 * Version: 1.0-RC2.40
 */

        window.WaterborneView = ({ personnel, qualsData }) => {
            const [filterActivity, setFilterActivity] = useState("Swim");
            const activityOptions = ["Swim", "Paddle", "Row", "Sail", "Power", "Windsurf", "Shorebased", "Offshore"];
            const sortedCadets = useMemo(() => [...personnel].sort((a, b) => a.name.localeCompare(b.name)), [personnel]);
            
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
                    <div className="bg-sky-50 p-6 rounded-lg border border-sky-100">
                        <h2 className="text-xl font-bold text-sky-900 mb-2">Waterborne Qualifications</h2>
                           <div className="flex items-center gap-4">
                                <label className="text-sm font-semibold text-sky-800">Filter Activity:</label>
                                <select value={filterActivity} onChange={(e) => setFilterActivity(e.target.value)} className="p-2 border border-sky-200 rounded shadow-sm text-sm">
                                    {activityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
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
                                        {Object.entries(window.WATER_SYLLABUS).filter(([c]) => c === filterActivity).map(([c, m]) => <React.Fragment key={c}>{m.map((mod, i) => <th key={mod.code} className="px-2 py-2 bg-slate-50 border-b border-slate-200 text-center font-semibold text-slate-600 min-w-[80px]" title={mod.title}><div className="flex flex-col items-center"><span className="text-[10px] text-slate-500 uppercase mb-1">{c}</span><span className="truncate max-w-[90px]">{mod.code}</span></div></th>)}</React.Fragment>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedCadets.map(cadet => (
                                        <tr key={cadet.pNumber} className="hover:bg-slate-50 border-b border-slate-100 last:border-0 h-8">
                                            <td className={`px-2 py-1 border-r border-slate-200 font-medium text-slate-700 sticky left-0 z-10 ${getCadetStatusColor(cadet)}`}>{cadet.name} <span className="text-[9px] opacity-75 ml-1">({cadet.rank})</span></td>
                                            {Object.entries(window.WATER_SYLLABUS).filter(([c]) => c === filterActivity).map(([c, m]) => (
                                                <React.Fragment key={c}>
                                                    {m.map(mod => {
                                                        const record = getWaterborneRecord(cadet, mod);
                                                        const passed = !!record;
                                                        return (
                                                            <td key={mod.code} className={`px-1 py-1 text-center border-r border-slate-50 last:border-0 ${passed ? 'bg-passed' : ''}`}>
                                                                {passed && (
                                                                    <span className="text-xs text-white font-bold block leading-tight">
                                                                        {record.date ? window.formatDate(record.date) : 'Done'}
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
        

console.log("✓ Waterborne view module loaded");
