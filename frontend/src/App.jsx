import React, { useState } from 'react';
import VideoUpload from './components/VideoUpload';
import ResultsDashboard from './components/ResultsDashboard';
import { ShieldCheck, Cpu, Eye, Zap } from 'lucide-react';

const FEATURES = [
  { icon: Cpu,        label: 'Vision Transformer', desc: 'ViT model frame analysis' },
  { icon: Eye,        label: 'Frame Extraction',   desc: 'Up to 20 key frames' },
  { icon: Zap,        label: 'Instant Results',    desc: 'Real-time probability' },
  { icon: ShieldCheck,label: 'Authenticity Check', desc: 'FAKE vs REAL verdict' },
];

function App() {
  const [loading, setLoading]       = useState(false);
  const [results, setResults]       = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [error, setError]           = useState(null);

  const handleUploadStart   = (file) => { setLoading(true); setResults(null); setError(null); setCurrentFile(file); };
  const handleUploadSuccess = (data) => { setLoading(false); setResults(data); };
  const handleUploadError   = (msg)  => { setLoading(false); setError(msg); };
  const handleReset         = ()     => { setResults(null); setError(null); setCurrentFile(null); };

  return (
    <div className="relative min-h-screen" style={{ background: '#020409' }}>

      {/* ── Ambient background ── */}
      <div className="bg-grid" />
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      {/* ── Navbar ── */}
      <nav className="sticky z-10 top-0" style={{
        background: 'rgba(2,4,9,0.8)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-md opacity-50 rounded-xl" />
              <div className="relative bg-linear-to-br from-blue-500 to-indigo-600 p-2 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <span className="text-lg font-bold gradient-text">DeepGuard AI</span>
              <div className="text-xs text-slate-500 -mt-0.5 font-mono">v2.0 · Powered by ViT</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              System Online
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pb-24">

        {/* Hero */}
        {!results && !loading && !error && (
          <div className="pt-20 pb-12 text-center space-y-6">
            <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-2"
              style={{ background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)', color:'#93c5fd' }}>
              <Zap className="w-3 h-3" />
              Advanced Deepfake Detection Engine
            </div>
            <h1 className="animate-fade-up delay-100 text-5xl md:text-7xl font-black text-white leading-none tracking-tight">
              Is Your Video<br />
              <span className="gradient-text text-glow-blue">Real or Fake?</span>
            </h1>
            <p className="animate-fade-up delay-200 text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
              Upload any video and our AI model will analyze frames to detect manipulation,
              deepfakes, and synthetic content — in seconds.
            </p>

            {/* Feature chips */}
            <div className="animate-fade-up delay-300 flex flex-wrap justify-center gap-3 pt-2">
              {/* eslint-disable-next-line no-unused-vars */}
              {FEATURES.map(({ icon: IconComponent, label, desc }) => (
                <div key={label} className="glass glass-hover flex items-center gap-2.5 px-4 py-2.5 rounded-xl cursor-default">
                  <div className="p-1.5 rounded-lg" style={{ background:'rgba(59,130,246,0.12)' }}>
                    <IconComponent className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-slate-200">{label}</div>
                    <div className="text-xs text-slate-500">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload */}
        {!results && !loading && (
          <div className={error ? 'pt-8' : ''}>
            <VideoUpload
              onUploadStart={handleUploadStart}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="animate-scale-in max-w-lg mx-auto mt-6 p-5 rounded-2xl"
            style={{ background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.2)' }}>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg shrink-0" style={{ background:'rgba(239,68,68,0.15)' }}>
                <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-300">Analysis Failed</p>
                <p className="text-xs text-red-400/80 mt-1 leading-relaxed">{error}</p>
              </div>
            </div>
            <button onClick={handleReset}
              className="mt-4 w-full py-2 rounded-xl text-sm font-medium text-red-300 transition-all"
              style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh] space-y-8">
            {/* Outer rings */}
            <div className="relative flex items-center justify-center w-40 h-40">
              <div className="absolute inset-0 rounded-full animate-pulse-ring"
                style={{ border:'1px solid rgba(59,130,246,0.3)' }} />
              <div className="absolute inset-4 rounded-full animate-pulse-ring delay-300"
                style={{ border:'1px solid rgba(139,92,246,0.3)' }} />
              {/* Scanner core */}
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden"
                style={{ background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.3)' }}>
                <div className="scan-line" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck className="w-10 h-10 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">
                Analyzing <span className="gradient-text">{currentFile?.name}</span>
              </h2>
              <p className="text-slate-400 text-sm">
                Extracting frames · Running Vision Transformer · Computing probabilities
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-72">
              <div className="h-1 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full relative overflow-hidden"
                  style={{ background:'linear-gradient(90deg,#3b82f6,#8b5cf6)', width:'100%' }}>
                  <div className="animate-shimmer absolute inset-0 w-1/3"
                    style={{ background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)' }} />
                </div>
              </div>
              <p className="text-center text-xs text-slate-600 mt-2 font-mono">Processing frames...</p>
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-6 pt-8">
            <ResultsDashboard results={results} />
            <div className="text-center">
              <button onClick={handleReset}
                className="text-slate-500 hover:text-slate-300 text-sm transition-colors underline underline-offset-4 decoration-slate-700 hover:decoration-slate-500">
                ← Analyze another video
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      {!results && !loading && (
        <footer className="relative z-10 text-center pb-8 text-xs text-slate-700">
          DeepGuard AI · Built with Vision Transformers · For educational use only
        </footer>
      )}
    </div>
  );
}

export default App;
