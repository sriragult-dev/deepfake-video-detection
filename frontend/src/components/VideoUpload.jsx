import React, { useState, useRef, useCallback } from 'react';
import { Upload, Film, FileVideo } from 'lucide-react';

const ACCEPTED_MIME_TYPES = [
  'video/mp4','video/mpeg','video/ogg','video/webm','video/quicktime',
  'video/x-msvideo','video/x-matroska','video/3gpp','video/3gpp2',
  'video/x-flv','video/x-ms-wmv',
];
const ACCEPTED_EXTENSIONS = ['mp4','avi','mov','mkv','webm','ogv','mpeg','mpg','3gp','flv','wmv'];

const isValidVideoFile = (file) => {
  if (file.type && ACCEPTED_MIME_TYPES.includes(file.type.toLowerCase())) return true;
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext && ACCEPTED_EXTENSIONS.includes(ext)) return true;
  if (file.type && file.type.startsWith('video/')) return true;
  return false;
};



const VideoUpload = ({ onUploadStart, onUploadSuccess, onUploadError }) => {
  const [dragActive, setDragActive]   = useState(false);
  const inputRef                      = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleChange = (e) => { if (e.target.files?.[0]) handleFiles(e.target.files[0]); };

  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFiles(e.dataTransfer.files[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiles = async (file) => {
    if (!isValidVideoFile(file)) {
      onUploadError(`"${file.name}" is not a supported video format.\nPlease upload MP4, MOV, AVI, MKV, or WebM.`);
      return;
    }

    // Show thumb preview
    // const url = URL.createObjectURL(file);
    onUploadStart(file);
    // URL.revokeObjectURL(url);

    const formData = new FormData();
    formData.append('file', file);

    const envUrl = import.meta.env.VITE_API_URL;
    const API_URL = (envUrl === undefined || envUrl === null) ? 'http://localhost:8000' : envUrl;

    try {
      const response = await fetch(`${API_URL}/detect`, { method: 'POST', body: formData });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error: ${response.statusText}`);
      }
      const data = await response.json();
      onUploadSuccess(data);
    } catch (err) {
      onUploadError(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Drop zone */}
      <div
        className={`upload-zone rounded-3xl p-1 cursor-pointer select-none ${dragActive ? 'drag-active' : ''}`}
        style={{
          background: dragActive
            ? 'rgba(59,130,246,0.06)'
            : 'rgba(255,255,255,0.02)',
          border: `2px dashed ${dragActive ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.1)'}`,
          transition: 'all 0.25s ease',
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="video/mp4,video/quicktime,video/x-msvideo,video/webm,video/ogg,video/x-matroska,video/3gpp,video/mpeg,video/*"
          onChange={handleChange}
          onClick={(e) => e.stopPropagation()}
        />

        <div className="p-10 md:p-16 flex flex-col items-center text-center space-y-6">
          {/* Icon cluster */}
          <div className="relative">
            {/* Orbit rings */}
            <div className={`absolute inset-0 rounded-full transition-all duration-500 ${dragActive ? 'scale-150 opacity-100' : 'scale-100 opacity-0'}`}
              style={{ border:'1px solid rgba(59,130,246,0.3)', margin:'-20px' }} />
            <div className={`absolute inset-0 rounded-full transition-all duration-700 ${dragActive ? 'scale-200 opacity-100' : 'scale-100 opacity-0'}`}
              style={{ border:'1px solid rgba(59,130,246,0.15)', margin:'-40px' }} />

            <div className={`relative p-6 rounded-2xl transition-all duration-300 ${dragActive ? 'scale-110' : 'scale-100'}`}
              style={{
                background: dragActive ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
              {dragActive
                ? <Film className="w-12 h-12 text-blue-400 animate-pulse" />
                : <Upload className="w-12 h-12 text-slate-400" />
              }
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">
              {dragActive ? 'Drop to analyze' : 'Upload your video'}
            </h3>
            <p className="text-sm text-slate-500">
              Drag & drop anywhere, or click to browse
            </p>
          </div>

          {/* CTA button */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
            className="btn-primary px-8 py-3 rounded-2xl font-semibold text-sm text-white flex items-center gap-2"
          >
            <FileVideo className="w-4 h-4" />
            Choose Video File
          </button>

          {/* Supported formats */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {['MP4','MOV','AVI','MKV','WebM','3GP'].map(fmt => (
              <span key={fmt} className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium"
                style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', color:'#64748b' }}>
                {fmt}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Info strip */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-slate-600 inline-block" />
          Max recommended: 50 MB
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-slate-600 inline-block" />
          Analyzes up to 20 frames
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-slate-600 inline-block" />
          Results in ~30s
        </span>
      </div>
    </div>
  );
};

export default VideoUpload;
