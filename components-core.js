/**
 * Sea Cadet Training Dashboard - Core Components Module
 * Version: 1.0-RC2.40
 * Contains: Icon, BadgeImage, ErrorBoundary, FileUploader, ModuleDrillDown
 */

// Icon Component
window.Icon = ({ name, className }) => {
    return <i data-lucide={name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()} className={className}></i>;
};

// BadgeImage Component
window.BadgeImage = ({ name, fallbackIcon, className }) => {
    const [error, setError] = React.useState(false);
    let filename = window.BADGE_MAP[name];
    if (!filename) {
        const cleanName = name.replace(/\(.*\)/, "").trim(); 
        const matchingKey = Object.keys(window.BADGE_MAP).find(k => k.includes(cleanName) || cleanName.includes(k));
        if(matchingKey) filename = window.BADGE_MAP[matchingKey];
    }
    if (!filename) filename = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + ".png";
    const src = `media/${filename}`;
    
    if (error) {
        return (
            <div className={`${className} bg-slate-100 border border-slate-300 rounded flex items-center justify-center text-center p-1`}>
                <span className="text-[9px] text-slate-400 font-mono leading-tight">Missing Image<br/><span className="text-[7px] opacity-50">{name}</span></span>
            </div>
        );
    }
    
    return <img src={src} alt={name} className={`object-contain ${className}`} onError={() => setError(true)} title={name} />;
};

// ErrorBoundary Component
window.ErrorBoundary = class extends React.Component {
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
};

console.log("✓ Core components module loaded (Icon, BadgeImage, ErrorBoundary)");
        window.FileUploader = ({ onDataLoaded, hasData, clearData, wipeAllData }) => {
            const [personnelFile, setPersonnelFile] = useState(null);
            const [qualsFile, setQualsFile] = useState(null);
            const [loading, setLoading] = useState(false);
            const [error, setError] = useState(null);
            const [showVideoModal, setShowVideoModal] = useState(false);
            
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

            const processPersonnelFile = async (text) => {
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
                    type: findCol("Type"),
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
                    
                    // Skip adults - only import cadets
                    if (idx.type !== -1 && row[idx.type] && row[idx.type].toLowerCase().trim() === 'adult') continue;
                    
                    personnelData.push({
                        pNumber: sanitizeText(row[idx.pnum] || "").trim(),
                        rank: normalizeRank(sanitizeText(row[idx.rank] || "Unknown")),
                        name: `${sanitizeText(row[idx.surname] || "").trim()}, ${sanitizeText(row[idx.firstname] || "").trim()}`,
                        unit: sanitizeText(row[idx.unit] || "").trim(),
                        dob: row[idx.dob],
                        tos: row[idx.tos],
                        rankDate: row[idx.rankDate],
                        cvqo: sanitizeText(row[idx.cvqo])
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
                        date: window.parseDate(row[idx.date]),
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

                try {
                    const personnelText = await readFile(personnelFile);
                    const qualsText = await readFile(qualsFile);
                    
                    const personnelData = await processPersonnelFile(personnelText);
                    const qualsData = await processQualsFile(qualsText);
                    
                    onDataLoaded(personnelData, qualsData);
                } catch (err) {
                    console.error(err);
                    setError(err.message);
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
                            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                                <Icon name="X" className="w-4 h-4" />
                            </button>
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
                                    <button onClick={() => setShowVideoModal(false)} className="p-2 rounded-full hover:bg-blue-100 text-slate-600">
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

        window.ModuleDrillDown = ({ info, onClose }) => {
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


console.log("✓ FileUploader and ModuleDrillDown loaded");
