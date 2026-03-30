import React, { useState, useRef } from 'react';
import { Upload, FileVideo, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const VideoUpload = ({ onUploadStart, onUploadSuccess, onUploadError }) => {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
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
        if (!file.type.startsWith('video/')) {
            onUploadError("Please upload a valid video file.");
            return;
        }

        onUploadStart(file);

        const formData = new FormData();
        formData.append('file', file);

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        try {
            const response = await fetch(`${API_URL}/detect`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Server Error: ${response.statusText}`);
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
            className={`w-full max-w-2xl mx-auto p-10 mt-10 border-2 border-dashed rounded-xl transition-all duration-300 ${dragActive ? "border-blue-500 bg-blue-500/10" : "border-slate-600 bg-slate-800/50 hover:border-blue-400"}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                multiple={false}
                accept="video/*"
                onChange={handleChange}
            />

            <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-4 bg-slate-700/50 rounded-full">
                    <Upload className="w-10 h-10 text-blue-400" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Upload Video for Analysis</h3>
                    <p className="text-slate-400 mb-4">Drag and drop your video file here, or click to browse</p>
                    <p className="text-xs text-slate-500">Supported formats: MP4, AVI, MOV (Max 50MB recommended)</p>
                </div>
                <button
                    onClick={onButtonClick}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                >
                    Select Video
                </button>
            </div>
        </div>
    );
};

export default VideoUpload;
