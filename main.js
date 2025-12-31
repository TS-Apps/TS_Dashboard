/**
 * Sea Cadet Training Dashboard - Main Application Module
 * Version: 1.0-RC2.40
 * Main App component with navigation, state management, and routing
 */

        window.App = () => {
            const [view, setView] = useState('upload'); 
            const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
            const [personnelData, setPersonnelData] = useState([]);
            const [qualsData, setQualsData] = useState([]);
            // NEW STATE for Drill Down Feature
            const [drillDownInfo, setDrillDownInfo] = useState(null); 

            // Icon Render - run when view changes or sidebar collapses/expands
            useEffect(() => { lucide.createIcons(); }, [view, sidebarCollapsed]);

            useEffect(() => {
                const savedVersion = localStorage.getItem('scc_version');
                if (savedVersion !== window.DATA_VERSION) {
                    localStorage.clear();
                    localStorage.setItem('scc_version', window.DATA_VERSION);
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
                            // Check for saved view (from module add/delete), otherwise default to home
                            const tempView = localStorage.getItem('scc_temp_view');
                            if (tempView) {
                                setView(tempView);
                                localStorage.removeItem('scc_temp_view'); // Clean up
                            } else {
                                setView('home');
                            } 
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
            const handlewindow.ModuleDrillDown = (module, targetRank, cadetsNeeding) => {
                setDrillDownInfo({ module, targetRank, cadetsNeeding });
            };

            // Memoized progress calculation to prevent unnecessary recalculations
            const getCadetProgress = useCallback((cadet) => {
                 const isRMC = window.RMC_RANK_ORDER.includes(cadet.rank);
                 const syllabus = isRMC ? window.RMC_SYLLABUS : window.SCC_SYLLABUS;
                 const currentRankSyllabus = syllabus[cadet.rank];
                 if (!currentRankSyllabus) return { percentage: 0 };
                 let total = 0, passed = 0;
                 Object.values(currentRankSyllabus).forEach(cat => cat.forEach(m => {
                     total++;
                     if(qualsData.some(q => q.pNumber === cadet.pNumber && q.module.includes(m.code))) passed++;
                 }));
                 return { percentage: total === 0 ? 100 : Math.round((passed/total)*100) };
            }, [qualsData]);

            // Detect unit capabilities based on personnel data
            const unitCapabilities = useMemo(() => {
                if (personnelData.length === 0) return { hasSCC: true, hasRMC: false, hasJSC: false };
                
                const hasRMC = personnelData.some(p => 
                    window.RMC_RANK_ORDER.includes(p.rank) || 
                    (p.unit && p.unit.includes('(RMCD)'))
                );
                
                const hasJSC = personnelData.some(p => {
                    if (!p.dob) return false;
                    const age = window.calculateAge(p.dob);
                    return age !== "Unknown" && age >= 9 && age < 12;
                });
                
                return { hasSCC: true, hasRMC, hasJSC };
            }, [personnelData]);

            const NavItem = ({ id, icon, label }) => (
                <button onClick={() => setView(id)} className={`flex items-center gap-3 w-full p-2 rounded-lg transition-all ${view === id ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-800/50'}`}>
                    <Icon name={icon} className="w-5 h-5" />
                    {!sidebarCollapsed && <span className="text-sm">{label}</span>}
                </button>
            );

            if (view === 'upload' && personnelData.length === 0) {
                return (
                    <div className="min-h-screen flex flex-col items-center pt-5 pb-10">
                        <img src="media/ts_dashboard.webp" alt="TS Dashboard" className="w-[300px] h-auto mb-2 object-contain" />
                        <h1 className="text-4xl font-extrabold text-blue-900 mb-1">Sea Cadet Training Dashboard</h1>
                        <window.FileUploader onDataLoaded={handleDataLoaded} hasData={personnelData.length > 0} clearData={clearData} wipeAllData={wipeAllData} />
                        
                        {/* Disclaimer Section when no data loaded */}
                        <div className="mt-8 max-w-2xl text-center text-xs text-slate-400 p-4 border-t border-slate-200">
                            <p className="font-semibold mb-1">Disclaimer</p>
                            <p>This has been created independently of the MSSC and no warranty of offered or implied etc. Feature requests and bug fixes should be addressed to James Harbidge - jharbidge@mhseacadets.org</p>
                            <p className="mt-3 text-[10px] text-slate-300">Version {window.DATA_VERSION}</p>
                        </div>
                    </div>
                );
            }

            return (
                <window.ErrorBoundary>
                    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-900">
                        <aside className={`${sidebarCollapsed ? 'w-20' : 'w-80'} bg-blue-900 text-white flex flex-col shadow-2xl fixed h-full z-10 transition-all duration-300`}>
                            <div className="p-4 border-b border-blue-800 flex flex-col items-center relative">
                                {!sidebarCollapsed && (
                                    <div className="flex flex-col items-center mb-1 w-full">
                                        <img src="media/ts_dashboard.webp" alt="TS Dashboard" className="object-contain w-[300px] h-auto mb-1" />
                                        <p className="text-xs text-blue-300 truncate font-semibold text-center w-full">{personnelData.length > 0 ? cleanUnitName(personnelData[0].unit) : 'Unit Dashboard'}</p>
                                    </div>
                                )}
                                <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} title="Toggle Sidebar" className={`p-1 hover:bg-blue-800 rounded absolute top-4 right-4 ${sidebarCollapsed ? 'static mt-2' : ''}`}>
                                    <Icon name={sidebarCollapsed ? "ChevronRight" : "ChevronLeft"} className="w-5 h-5"/>
                                </button>
                            </div>
                            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                                <NavItem id="home" icon="Home" label="Home" />
                                {unitCapabilities.hasJSC && <NavItem id="juniors" icon="Users" label="Junior Focus" />}
                                {unitCapabilities.hasJSC && <NavItem id="junior_progress" icon="BarChart3" label="Junior Progress" />}
                                <NavItem id="cadet_focus" icon="User" label="Cadet Focus" />
                                {unitCapabilities.hasSCC && <NavItem id="planner" icon="ShipWheel" label="SCC CTP Progress" />}
                                {unitCapabilities.hasRMC && <NavItem id="rmc_planner" icon="Target" label="RMC CTS Progress" />}
                                <NavItem id="waterborne" icon="Anchor" label="Waterborne" />
                                <NavItem id="awards" icon="Award" label="Awards" />
                                <NavItem id="suggestions" icon="ChartGantt" label="Training Plan" />
                                <NavItem id="data_utilities" icon="Database" label="Data / Utilities" />
                            </nav>
                            <div className="p-3 border-t border-blue-800">
                                {!sidebarCollapsed && (
                                    <div>
                                        <p className="text-[9px] text-blue-500 text-center">v{window.DATA_VERSION}</p>
                                    </div>
                                )}
                            </div>
                        </aside>
                        <main className={`flex-1 ${sidebarCollapsed ? 'ml-20' : 'ml-80'} p-8 overflow-y-auto transition-all duration-300`}>
                            {view === 'home' && <window.HomeView personnel={personnelData} />} 
                            {view === 'cadet_focus' && <window.CadetFocus personnel={personnelData} qualsData={qualsData} />}
                            {view === 'juniors' && <window.JuniorsView personnel={personnelData} qualifications={qualsData} />}
                            {view === 'junior_progress' && <window.JuniorProgressView personnel={personnelData} />}
                            {view === 'awards' && <window.AwardsView personnel={personnelData} quals={qualsData} />}
                            {(view === 'waterborne') && <window.WaterborneView personnel={personnelData} qualsData={qualsData} />}
                            {(view === 'planner') && <window.TrainingPlanner personnel={personnelData} getCadetProgress={getCadetProgress} qualsData={qualsData} title="SCC CTP Progress" rankOrder={window.SCC_RANK_ORDER} syllabus={window.SCC_SYLLABUS} iconName="ShipWheel" onModuleClick={handlewindow.ModuleDrillDown} />}
                            {(view === 'rmc_planner') && <window.TrainingPlanner personnel={personnelData} getCadetProgress={getCadetProgress} qualsData={qualsData} title="RMC CTS Progress" rankOrder={window.RMC_RANK_ORDER} syllabus={window.RMC_SYLLABUS} colorTheme="green" iconName="Target" onModuleClick={handlewindow.ModuleDrillDown} />}
                            {(view === 'suggestions') && <window.TrainingSuggestions personnel={personnelData} getCadetProgress={getCadetProgress} qualsData={qualsData} />}
                            {view === 'data_utilities' && <window.DataUtilitiesView clearData={clearData} wipeAllData={wipeAllData} setView={setView} personnel={personnelData} />}
                        </main>
                    </div>
                    {/* Render the Drill Down Modal */}
                    <window.ModuleDrillDown info={drillDownInfo} onClose={() => setDrillDownInfo(null)} />
                </window.ErrorBoundary>
            );
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
        
        console.log(`RC2.37 loaded successfully! Version: ${window.DATA_VERSION}`);
        console.log("RC2.28: Duplicate modules now count only once in progress calculations");
    </script>

console.log("✓ Main app module loaded");
console.log("🚀 RC2.40 Dashboard ready!");
