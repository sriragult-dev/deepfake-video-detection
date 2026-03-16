import React, { useState } from 'react';
import VideoUpload from './components/VideoUpload';
import ResultsDashboard from './components/ResultsDashboard';
import { ShieldCheck, Loader2 } from 'lucide-react';

function App() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [error, setError] = useState(null);

  const handleUploadStart = (file) => {
    setLoading(true);
    setResults(null);
    setError(null);
    setCurrentFile(file);
  };

  const handleUploadSuccess = (data) => {
    setLoading(false);
    setResults(data);
  };

  const handleUploadError = (msg) => {
    setLoading(false);
    setError(msg);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500 selection:text-white pb-20">

      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              DeepGuard AI
            </h1>
          </div>
          <div className="text-sm text-slate-400">
            Deepfake Detection System
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">

        {/* Hero Section */}
        {!results && !loading && (
          <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
              Verify Video Authenticity <br />
              <span className="text-blue-500">Instantly</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Advanced AI-powered deepfake detection. Upload any video to analyze suspicious frames, manipulation artifacts, and authenticity probability.
            </p>
          </div>
        )}

        {/* Upload Area */}
        {!results && !loading && (
          <VideoUpload
            onUploadStart={handleUploadStart}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[400px] animate-in fade-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin relative z-10" />
            </div>
            <h2 className="mt-8 text-2xl font-bold text-white">Analyzing Video Stream...</h2>
            <p className="text-slate-400 mt-2">Extracting frames and running Vision Transformer models</p>
            <div className="w-64 h-1 bg-slate-800 rounded-full mt-6 overflow-hidden">
              <div className="h-full bg-blue-500 w-1/2 animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto mt-8 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200 text-center">
            <p className="font-semibold">Analysis Failed</p>
            <p className="text-sm opacity-80">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-4 px-4 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-8">
            <ResultsDashboard results={results} file={currentFile} />
            <div className="text-center">
              <button
                onClick={() => setResults(null)}
                className="text-slate-400 hover:text-white text-sm underline underline-offset-4 decoration-slate-700 hover:decoration-white transition-all"
              >
                Analyze Another Video
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
