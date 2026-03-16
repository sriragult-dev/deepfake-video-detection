import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Play } from 'lucide-react';

const ResultsDashboard = ({ results, file }) => {
    if (!results) return null;

    const isFake = results.verdict === 'FAKE';
    const confidencePercent = (results.confidence * 100).toFixed(1);

    return (
        <div className="w-full max-w-4xl mx-auto mt-10 p-6 bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header Result */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-700">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Detection Result</h2>
                    <p className="text-slate-400 text-sm">File: {results.filename} • Duration: {results.duration.toFixed(1)}s</p>
                </div>
                <div className={`px-6 py-2 rounded-full border flex items-center gap-2 ${isFake ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-green-500/10 border-green-500/50 text-green-500'}`}>
                    {isFake ? <XCircle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                    <span className="text-xl font-bold tracking-wider">{results.verdict}</span>
                </div>
            </div>

            {/* Main Metric */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700 flex flex-col items-center justify-center">
                    <span className="text-slate-400 mb-2">Confidence Score</span>
                    <div className={`text-5xl font-bold ${isFake ? 'text-red-500' : 'text-green-500'}`}>
                        {confidencePercent}%
                    </div>
                    <span className="text-xs text-slate-500 mt-2">Probability of {results.verdict.toLowerCase()}</span>
                </div>

                <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Analysis Summary</h3>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3 text-sm text-slate-300">
                            <div className="mt-1"><Play className="w-3 h-3 text-blue-400" /></div>
                            <span>Frame-by-frame temporal analysis completed using Vision Transformer.</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-slate-300">
                            <div className="mt-1"><AlertTriangle className="w-3 h-3 text-yellow-400" /></div>
                            <span>{results.timeline.length} key frames extracted and analyzed for manipulation artifacts.</span>
                        </li>
                        {isFake && (
                            <li className="flex items-start gap-3 text-sm text-red-300 bg-red-900/10 p-2 rounded">
                                <span>High likelihood of manipulation detected in video stream features.</span>
                            </li>
                        )}
                        {!isFake && (
                            <li className="flex items-start gap-3 text-sm text-green-300 bg-green-900/10 p-2 rounded">
                                <span>No significant manipulation artifacts detected. Video appears authentic.</span>
                            </li>
                        )}
                    </ul>
                </div>
            </div>

            {/* Timeline Visualization */}
            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Analysis Timeline</h3>
                <div className="h-24 bg-slate-900 rounded-lg border border-slate-700 relative overflow-hidden flex items-end">
                    {results.timeline.map((frame, idx) => (
                        <div
                            key={idx}
                            className="flex-1 bg-blue-500/20 hover:bg-blue-500/40 transition-colors relative group"
                            style={{ height: '100%' }}
                        >
                            <div
                                className={`absolute bottom-0 w-full transition-all ${frame.fake_prob > 0.5 ? 'bg-red-500' : 'bg-green-500'}`}
                                style={{ height: `${frame.fake_prob * 100}%` }}
                            />
                            {/* Tooltip */}
                            <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-xs text-white p-2 rounded whitespace-nowrap z-10 border border-slate-600">
                                Frame: {frame.frame_index} <br /> Fake Prob: {(frame.fake_prob * 100).toFixed(0)}%
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                    <span>0:00</span>
                    <span>Video Duration</span>
                </div>
            </div>
        </div>
    );
};

export default ResultsDashboard;
