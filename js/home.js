/**
 * Sea Cadet Training Dashboard - Home View Module
 * Version: 1.0-RC2.40
 */

        window.HomeView = ({ personnel }) => {
            const unitName = personnel.length > 0 ? cleanUnitName(personnel[0].unit) : "Sea Cadets";

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
                            This app was built independently by volunteers and is not an an official MSSC product. It’s provided “as is”, with no warranty or guarantees offered or implied, and you use it at your own risk. The code is open source, and parts of the solution, documentation, or content may be AI-generated. Always review outputs for accuracy.
                        </p>
                        <p>
                            If you spot a bug, have a feature idea, or make an improvement, please share it so others can benefit. 
                            You can contact James Harbidge at <a href="mailto:jharbidge@mhseacadets.org?subject=TS Dashboard" className="text-blue-500 hover:text-blue-600 underline">jharbidge@mhseacadets.org</a>.
                        </p>
                    </div>
                </div>
            );
        };


console.log("✓ Home view module loaded");
