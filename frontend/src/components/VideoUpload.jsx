import React, { useState, useRef } from 'react';
import { Upload, FileVideo, AlertCircle } from 'lucide-react';

// Supported video MIME types — explicit list for cross-device compatibility
const ACCEPTED_MIME_TYPES = [
    'video/mp4', 'video/mpeg', 'video/ogg', 'video/webm',
    'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
    'video/3gpp', 'video/3gpp2', 'video/x-flv', 'video/x-ms-wmv',
];

// Supported extensions fallback (for devices that return empty MIME type)
const ACCEPTED_EXTENSIONS = ['mp4', 'avi', 'mov', 'mkv', 'webm', 'ogv', 'mpeg', 'mpg', '3gp', 'flv', 'wmv'];

const isValidVideoFile = (file) => {
    // Check by MIME type first
    if (file.type && ACCEPTED_MIME_TYPES.includes(file.type.toLowerCase())) return true;
    // Fallback: check file extension (some mobile browsers return empty MIME type)
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext && ACCEPTED_EXTENSIONS.includes(ext)) return true;
    // Last resort: check if MIME type starts with video/
    if (file.type && file.type.startsWith('video/')) return true;
    return false;
};

const VideoUpload = ({ onUploadStart, onUploadSuccess, onUploadError }) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files[0]);
        }
    };

    const handleFiles = async (file) => {
        if (!isValidVideoFile(file)) {
            onUploadError(`"${file.name}" is not a supported video format. Please upload MP4, MOV, AVI, MKV, or WebM.`);
            return;
        }

        setSelectedFile(file);
        onUploadStart(file);

        const formData = new FormData();
        formData.append('file', file);

        // IMPORTANT: When VITE_API_URL is empty string (""), use relative URL (same-origin).
        // Empty string is falsy in JS so we CANNOT use || operator here.
        const envUrl = import.meta.env.VITE_API_URL;
        const API_URL = (envUrl === undefined || envUrl === null)
            ? 'http://localhost:8000'   // local dev fallback
            : envUrl;                   // use env value (even empty string = same-origin)
        try {
            const response = await fetch(`${API_URL}/detect`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.detail || `Server Error: ${response.statusText}`);
            }

            const data = await response.json();
            onUploadSuccess(data);
        } catch (error) {
            onUploadError(error.message);
        }
    };

    const onButtonClick = () => {
        inputRef.current.click();
    };

    return (
        <div
            className={`w-full max-w-2xl mx-auto p-10 mt-10 border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer ${
                dragActive
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-600 bg-slate-800/50 hover:border-blue-400 hover:bg-slate-800'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
        >
            {/* Hidden file input — explicit MIME types + wildcard for max compatibility */}
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                multiple={false}
                accept="video/mp4,video/quicktime,video/x-msvideo,video/webm,video/ogg,video/x-matroska,video/3gpp,video/mpeg,video/*"
                onChange={handleChange}
                onClick={(e) => e.stopPropagation()}
            />

            <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className={`p-4 rounded-full transition-colors ${dragActive ? 'bg-blue-500/20' : 'bg-slate-700/50'}`}>
                    <Upload className={`w-10 h-10 transition-colors ${dragActive ? 'text-blue-300' : 'text-blue-400'}`} />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Upload Video for Analysis</h3>
                    <p className="text-slate-400 mb-2">Drag and drop your video here, or click anywhere to browse</p>
                    <p className="text-xs text-slate-500">Supported: MP4, MOV, AVI, MKV, WebM, 3GP &amp; more</p>
                </div>
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onButtonClick(); }}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                >
                    Select Video
                </button>
            </div>
        </div>
    );
};

export default VideoUpload;
