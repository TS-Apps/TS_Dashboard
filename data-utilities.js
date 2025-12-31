/**
 * Sea Cadet Training Dashboard - Data Utilities Module
 * Version: 1.0-RC2.40
 * Data management, import/export, bulk upload
 */


// Destructure React hooks
const { useState, useEffect, useMemo, useCallback } = React;

        window.DataUtilitiesView = ({ clearData, wipeAllData, setView, personnel }) => {
            const [uploadStatus, setUploadStatus] = useState('');
            const juniorData = window.getJuniorData();
            
            // Filter juniors for bulk award
            const juniors = personnel.filter(cadet => isJunior(cadet.dob));
            
            // Bulk Award State
            const [selectedCadets, setSelectedCadets] = useState(new Set());
            const [selectedModules, setSelectedModules] = useState(new Set());
            const [activeSection, setActiveSection] = useState('red');
            const [bulkAwardDate, setBulkAwardDate] = useState(new Date().toISOString().split('T')[0]);
            const [showBulkSuccess, setShowBulkSuccess] = useState(false);
            
            // All 336 modules for bulk award
            
            // Bulk Award Handlers
            const toggleCadetSelection = (pNumber) => {
                const newSet = new Set(selectedCadets);
                if (newSet.has(pNumber)) {
                    newSet.delete(pNumber);
                } else {
                    newSet.add(pNumber);
                }
                setSelectedCadets(newSet);
            };
            
            const toggleAllCadets = () => {
                if (selectedCadets.size === juniors.length) {
                    setSelectedCadets(new Set());
                } else {
                    setSelectedCadets(new Set(juniors.map(j => j.pNumber)));
                }
            };
            
            const toggleModuleSelection = (moduleId) => {
                const newSet = new Set(selectedModules);
                if (newSet.has(moduleId)) {
                    newSet.delete(moduleId);
                } else {
                    newSet.add(moduleId);
                }
                setSelectedModules(newSet);
            };
            
            const toggleAllModules = () => {
                const sectionModules = allModules.filter(m => m.s === activeSection);
                const sectionIds = sectionModules.map(m => `${m.s}-${m.c}`);
                const allSelected = sectionIds.every(id => selectedModules.has(id));
                
                const newSet = new Set(selectedModules);
                if (allSelected) {
                    sectionIds.forEach(id => newSet.delete(id));
                } else {
                    sectionIds.forEach(id => newSet.add(id));
                }
                setSelectedModules(newSet);
            };
            
            const handleBulkAward = () => {
                if (selectedCadets.size === 0) {
                    alert("Please select at least one cadet");
                    return;
                }
                if (selectedModules.size === 0) {
                    alert("Please select at least one module");
                    return;
                }
                
                const newCompletions = [];
                selectedCadets.forEach(pNumber => {
                    selectedModules.forEach(moduleId => {
                        const [section, code] = moduleId.split('-');
                        const module = allModules.find(m => m.s === section && m.c === code);
                        if (module) {
                            newCompletions.push({
                                pNumber: pNumber,
                                section: section,
                                moduleCode: code,
                                moduleName: module.n,
                                dateCompleted: bulkAwardDate,
                                isCore: false
                            });
                        }
                    });
                });
                
                const currentData = window.getJuniorData();
                const updatedData = {
                    ...currentData,
                    moduleCompletions: [...currentData.moduleCompletions, ...newCompletions]
                };
                
                if (window.saveJuniorData(updatedData)) {
                    setShowBulkSuccess(true);
                    setSelectedCadets(new Set());
                    setSelectedModules(new Set());
                    setUploadStatus(`Successfully awarded ${newCompletions.length} modules!`);
                    setTimeout(() => {
                        setShowBulkSuccess(false);
                        window.location.reload();
                    }, 1500);
                } else {
                    alert("Error saving bulk awards");
                }
            };
            
            const filteredModules = allModules.filter(m => m.s === activeSection);
            
            
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
                            window.saveJuniorData(imported);
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
                    
                    {/* Bulk Module Award Section */}
                    {juniors.length > 0 && (
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-xl p-6 border-2 border-purple-200">
                            <div className="flex items-center gap-3 mb-4">
                                <Icon name="Award" className="w-6 h-6 text-purple-700" />
                                <h2 className="text-2xl font-bold text-purple-900">Bulk Module Award</h2>
                            </div>
                            <p className="text-slate-700 mb-6">
                                Award multiple modules to multiple juniors at once. Quick entry for parade nights.
                            </p>
                            
                            {showBulkSuccess && (
                                <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
                                    ✓ {selectedCadets.size} cadet(s) × {selectedModules.size} module(s) = {selectedCadets.size * selectedModules.size} awards saved successfully!
                                </div>
                            )}
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left: Cadet Selection */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-bold text-slate-700">Select Cadets</label>
                                        <button
                                            onClick={toggleAllCadets}
                                            className="text-xs text-purple-600 hover:text-purple-800 font-semibold"
                                        >
                                            {selectedCadets.size === juniors.length ? 'Deselect All' : `Select All (${juniors.length})`}
                                        </button>
                                    </div>
                                    <div className="bg-white rounded-lg border border-purple-200 p-3 max-h-64 overflow-y-auto">
                                        {juniors.map(junior => (
                                            <label key={junior.pNumber} className="flex items-center gap-2 p-2 hover:bg-purple-50 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCadets.has(junior.pNumber)}
                                                    onChange={() => toggleCadetSelection(junior.pNumber)}
                                                    className="w-4 h-4 text-purple-600 rounded"
                                                />
                                                <span className="text-sm flex-1">{junior.name}</span>
                                                <span className="text-xs text-slate-500">({window.calculateAge(junior.dob)}) {junior.rank}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Right: Module Selection */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Select Modules</label>
                                    
                                    {/* Section Tabs */}
                                    <div className="flex gap-1 mb-3">
                                        {[
                                            {id: 'red', label: 'RED', bg: 'bg-red-100', active: 'bg-red-600', text: 'text-red-800'},
                                            {id: 'blue', label: 'BLUE', bg: 'bg-blue-100', active: 'bg-blue-600', text: 'text-blue-800'},
                                            {id: 'green', label: 'GREEN', bg: 'bg-green-100', active: 'bg-green-600', text: 'text-green-800'},
                                            {id: 'yellow', label: 'YELLOW', bg: 'bg-yellow-100', active: 'bg-yellow-600', text: 'text-yellow-800'},
                                            {id: 'stem', label: 'STEM', bg: 'bg-purple-100', active: 'bg-purple-600', text: 'text-purple-800'}
                                        ].map(section => (
                                            <button
                                                key={section.id}
                                                onClick={() => setActiveSection(section.id)}
                                                className={`flex-1 py-2 px-3 rounded text-xs font-bold transition-all ${
                                                    activeSection === section.id 
                                                        ? `${section.active} text-white shadow-md` 
                                                        : `${section.bg} ${section.text} hover:shadow`
                                                }`}
                                            >
                                                {section.label}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-slate-600">{filteredModules.length} modules in {activeSection.toUpperCase()} section</span>
                                        <button
                                            onClick={toggleAllModules}
                                            className="text-xs text-purple-600 hover:text-purple-800 font-semibold"
                                        >
                                            {filteredModules.every(m => selectedModules.has(`${m.s}-${m.c}`)) ? 'Deselect All' : 'Select All'}
                                        </button>
                                    </div>
                                    
                                    <div className="bg-white rounded-lg border border-purple-200 p-3 max-h-48 overflow-y-auto">
                                        {filteredModules.map(mod => {
                                            const moduleId = `${mod.s}-${mod.c}`;
                                            return (
                                                <label key={moduleId} className="flex items-start gap-2 p-2 hover:bg-purple-50 rounded cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedModules.has(moduleId)}
                                                        onChange={() => toggleModuleSelection(moduleId)}
                                                        className="w-4 h-4 text-purple-600 rounded mt-0.5"
                                                    />
                                                    <span className="text-xs flex-1">
                                                        <span className="font-bold text-purple-700">{mod.s.toUpperCase()} {mod.c}:</span> {mod.n}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Bottom: Date and Award Button */}
                            <div className="mt-6 flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-1">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Date Completed</label>
                                    <input
                                        type="date"
                                        value={bulkAwardDate}
                                        onChange={(e) => setBulkAwardDate(e.target.value)}
                                        className="w-full p-2 border border-slate-300 rounded-lg"
                                    />
                                </div>
                                <div className="flex-1 text-center">
                                    <p className="text-sm text-slate-600 mb-2">
                                        <span className="font-bold text-purple-700">{selectedCadets.size}</span> cadet(s) × 
                                        <span className="font-bold text-purple-700"> {selectedModules.size}</span> module(s) = 
                                        <span className="font-bold text-lg text-purple-900"> {selectedCadets.size * selectedModules.size}</span> awards
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedCadets(new Set());
                                            setSelectedModules(new Set());
                                        }}
                                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-semibold"
                                    >
                                        Clear Selections
                                    </button>
                                    <button
                                        onClick={handleBulkAward}
                                        disabled={selectedCadets.size === 0 || selectedModules.size === 0}
                                        className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 ${
                                            selectedCadets.size > 0 && selectedModules.size > 0
                                                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg'
                                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        }`}
                                    >
                                        <Icon name="Award" className="w-4 h-4" />
                                        Award Modules →
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    
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
                            Bulk Upload Legacy Modules
                        </h2>
                        <p className="text-slate-700 mb-4">
                            Import existing paper-based module records using an Excel-friendly grid format.
                        </p>
                        
                        <div className="bg-white rounded p-4 mb-4 text-sm border border-amber-200">
                            <p className="font-semibold text-slate-700 mb-2">How it works:</p>
                            <ol className="list-decimal ml-5 space-y-1 text-slate-600">
                                <li>Click "Download Template" - exports grid with all 336 modules and your juniors</li>
                                <li>Open in Excel/Google Sheets - see existing completions marked with X</li>
                                <li>Add X in cells where juniors have completed modules (visual grid format)</li>
                                <li>Save as CSV</li>
                                <li>Click "Upload Template" - imports all X marks as completions (upload date used)</li>
                            </ol>
                            <p className="text-xs text-amber-800 mt-2">
                                <strong>Note:</strong> Export shows existing data. Import only updates cells with X marks.
                            </p>
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    const juniors = personnel.filter(c => {
                                        if (!c.dob) return false;
                                        const age = window.calculateAge(c.dob);
                                        return age >= 9 && age <= 11;
                                    });
                                    
                                    if (juniors.length === 0) {
                                        alert('No junior cadets found (ages 9-11)');
                                        return;
                                    }
                                    
                                    // Get existing completions
                                    const juniorData = window.getJuniorData();
                                    
                                    // All 336 modules in order
                                    
                                    // Build CSV grid
                                    let csv = ', '; // Empty top-left corner
                                    
                                    // Header row: Junior names and PNumbers
                                    juniors.forEach(j => {
                                        const name = j.name.replace(/,/g, ''); // Remove commas from name
                                        csv += `${name} - ${j.pNumber}, `;
                                    });
                                    csv = csv.slice(0, -2) + '\n'; // Remove last comma+space, add newline
                                    
                                    // Data rows: Module codes and X marks
                                    allModules.forEach(mod => {
                                        csv += `${mod.s.toUpperCase()} ${mod.c}: ${mod.n.replace(/,/g, '')}, `; // Module label
                                        
                                        juniors.forEach(j => {
                                            // Check if this junior has completed this module
                                            const hasCompleted = juniorData.moduleCompletions.some(m => 
                                                m.pNumber === j.pNumber && 
                                                m.section === mod.s && 
                                                m.moduleCode === mod.c
                                            );
                                            csv += hasCompleted ? 'X, ' : ', ';
                                        });
                                        csv = csv.slice(0, -2) + '\n'; // Remove last comma+space, add newline
                                    });
                                    
                                    const blob = new Blob([csv], {type: 'text/csv'});
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `juniors_grid_template_${new Date().toISOString().split('T')[0]}.csv`;
                                    a.click();
                                    setUploadStatus('Grid template downloaded successfully!');
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
                                                    alert('Template appears empty.');
                                                    return;
                                                }
                                                
                                                // Parse header row (cadet names and PNumbers)
                                                const headerRow = lines[0].split(',');
                                                const cadets = [];
                                                
                                                for (let i = 1; i < headerRow.length; i++) {
                                                    const cell = headerRow[i].trim();
                                                    if (!cell) continue;
                                                    
                                                    // Format: "Name - PNumber"
                                                    const match = cell.match(/(.+?)\s*-\s*(\d+)/);
                                                    if (match) {
                                                        cadets.push({
                                                            name: match[1].trim(),
                                                            pNumber: match[2].trim(),
                                                            columnIndex: i
                                                        });
                                                    }
                                                }
                                                
                                                if (cadets.length === 0) {
                                                    alert('No cadets found in header row. Check format: "Name - PNumber"');
                                                    return;
                                                }
                                                
                                                // Parse module rows
                                                const newCompletions = [];
                                                const uploadDate = new Date().toISOString().split('T')[0];
                                                
                                                for (let i = 1; i < lines.length; i++) {
                                                    const row = lines[i].split(',');
                                                    const moduleLabel = row[0]?.trim();
                                                    
                                                    if (!moduleLabel) continue;
                                                    
                                                    // Parse module: "SECTION CODE: Module Name"
                                                    const moduleMatch = moduleLabel.match(/^(RED|BLUE|GREEN|YELLOW|STEM)\s+([\w.]+):\s*(.+)$/i);
                                                    if (!moduleMatch) continue;
                                                    
                                                    const section = moduleMatch[1].toLowerCase();
                                                    const code = moduleMatch[2].toUpperCase();
                                                    const moduleName = moduleMatch[3];
                                                    
                                                    // Check each cadet column for X mark
                                                    cadets.forEach(cadet => {
                                                        const cellValue = row[cadet.columnIndex]?.trim().toUpperCase();
                                                        if (cellValue === 'X') {
                                                            newCompletions.push({
                                                                pNumber: cadet.pNumber,
                                                                section: section,
                                                                moduleCode: code,
                                                                moduleName: moduleName,
                                                                dateCompleted: uploadDate,
                                                                isCore: false
                                                            });
                                                        }
                                                    });
                                                }
                                                
                                                if (newCompletions.length === 0) {
                                                    alert('No module completions found (no X marks detected).');
                                                    return;
                                                }
                                                
                                                // Remove duplicates and only add NEW completions
                                                const currentData = window.getJuniorData();
                                                const existingKeys = new Set(
                                                    currentData.moduleCompletions.map(m => 
                                                        `${m.pNumber}-${m.section}-${m.moduleCode}`
                                                    )
                                                );
                                                
                                                const trulyNew = newCompletions.filter(nc => 
                                                    !existingKeys.has(`${nc.pNumber}-${nc.section}-${nc.moduleCode}`)
                                                );
                                                
                                                if (trulyNew.length === 0) {
                                                    alert(`All ${newCompletions.length} completions already exist in database. No new data to import.`);
                                                    return;
                                                }
                                                
                                                const skipped = newCompletions.length - trulyNew.length;
                                                const message = skipped > 0 
                                                    ? `Import ${trulyNew.length} NEW completions? (${skipped} duplicates will be skipped)`
                                                    : `Import ${trulyNew.length} module completions?`;
                                                
                                                if (confirm(message)) {
                                                    const updatedData = {
                                                        ...currentData,
                                                        moduleCompletions: [...currentData.moduleCompletions, ...trulyNew]
                                                    };
                                                    
                                                    if (window.saveJuniorData(updatedData)) {
                                                        setUploadStatus(`Successfully imported ${trulyNew.length} completions!`);
                                                        setTimeout(() => window.location.reload(), 1500);
                                                    }
                                                }
                                            } catch (err) {
                                                alert('Error processing template: ' + err.message);
                                            }
                                        };
                                        reader.readAsText(file);
                                    }}
                                />
                            </label>
                        </div>
                        
                        <div className="mt-4 p-3 bg-amber-100 rounded text-xs text-amber-900">
                            <p className="mb-1"><strong>Grid Format:</strong> Row 1 = Cadets (Name - PNumber), Column A = Modules (SECTION CODE: Name), Cells = X for completed</p>
                            <p><strong>Sections:</strong> RED, BLUE, GREEN, YELLOW, STEM</p>
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
                                <p className="text-slate-900 font-mono">{window.DATA_VERSION}</p>
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

console.log("✓ Data utilities module loaded");
