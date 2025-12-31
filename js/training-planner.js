/**
 * Sea Cadet Training Dashboard - Training Planner Module
 * Version: 1.0-RC2.40
 * Used for both SCC CTP and RMC CTS progress views
 */


// Destructure React hooks
const { useState, useEffect, useMemo, useCallback } = React;

        window.TrainingPlanner = ({ personnel, getCadetProgress, qualsData, title, rankOrder, syllabus, colorTheme = "indigo", iconName, onModuleClick }) => {
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
                        <div className={`p-6 rounded-lg border ${colorTheme === "green" ? "bg-green-50 border-green-100" : "bg-indigo-50 border-indigo-100"}`}>
                            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
                            <p className="text-sm">Select target rank: 
                                <select value={selectedRank} onChange={(e) => setSelectedRank(e.target.value)} className="p-2 border rounded shadow-sm ml-2">
                                    {rankOrder.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </p>
                        </div>
                        <div className="text-center py-12 bg-white rounded border border-dashed border-slate-300 text-slate-400">
                             No syllabus defined for {selectedRank}.
                        </div>
                    </div>
                );
            }

            return (
                <div className="space-y-6">
                    <div className={`p-6 rounded-lg border ${colorTheme === "green" ? "bg-green-50 border-green-100" : "bg-indigo-50 border-indigo-100"}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-3 rounded-full ${colorTheme === "green" ? "bg-green-200 text-green-800" : "bg-indigo-200 text-indigo-800"}`}>
                                <Icon name={iconName || "FileText"} className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
                        </div>
                       <div className="flex items-center gap-4">
                            <label className="text-sm font-semibold">Plan training for cadets currently ranked:</label>
                            <select value={selectedRank} onChange={(e) => setSelectedRank(e.target.value)} className="p-2 border rounded shadow-sm">
                                {rankOrder.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                    </div>
                        <div className="bg-white rounded-lg shadow overflow-hidden border border-slate-200">
                            <div className="planner-container">
                                <table className="planner-table w-full text-xs text-left border-collapse">
                                    <thead>
                                            <tr>
                                                <th className="px-2 py-2 bg-slate-100 border-b border-r border-slate-200 sticky left-0 z-10 w-48 min-w-[150px] font-bold text-slate-700">Module / Cadet</th>
                                                {cadetsForColumns.map(c => {
                                                    const ageClass = window.getCadetAgeColor(c.dob); // Apply age color to header cell
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
                                                            <span className="text-[10px] text-white font-bold block leading-tight">{record.date ? window.formatDate(record.date) : 'Done'}</span>
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


console.log("✓ Training planner module loaded");
