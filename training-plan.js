/**
 * Sea Cadet Training Dashboard - Training Suggestions Module  
 * Version: 1.0-RC2.40
 */

        window.TrainingSuggestions = ({ personnel, getCadetProgress, qualsData }) => {
            const [selectedRank, setSelectedRank] = useState(window.SCC_RANK_ORDER[0]);
            const ALL_RANKS = [...window.SCC_RANK_ORDER, ...window.RMC_RANK_ORDER];
            const cadetsAtRank = useMemo(() => personnel.filter(p => p.rank === selectedRank), [personnel, selectedRank]);
            
            const suggestions = useMemo(() => {
                if (!cadetsAtRank.length) return [];
                const isRMC = window.RMC_RANK_ORDER.includes(selectedRank);
                const syllabus = isRMC ? window.RMC_SYLLABUS : window.SCC_SYLLABUS;
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
                    <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
                        <h2 className="text-xl font-bold text-purple-900 mb-2">Training Suggestions</h2>
                        <p className="text-sm text-purple-700 mb-3">Shows the 12 most-needed modules for cadets at the selected rank.</p>
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-semibold text-purple-800">Target Rank:</label>
                            <select value={selectedRank} onChange={(e) => setSelectedRank(e.target.value)} className="p-2 border border-purple-200 rounded shadow-sm text-sm">{ALL_RANKS.map(r => <option key={r} value={r}>{r}</option>)}</select>
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


console.log("✓ Training plan module loaded");
