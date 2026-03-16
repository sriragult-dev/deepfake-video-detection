# Deepfake Video Detection

This is a full-stack Deepfake Video Detection application using **FastAPI** (Backend) and **React** (Frontend).
It uses a pre-trained Vision Transformer model from HuggingFace to analyze videos frame-by-frame.

## Features
- **Video Upload**: Drag & drop support.
- **Deepfake Detection**: Uses AI to detect manipulation artifacts.
- **Frame-by-Frame Analysis**: Highlights suspicious timeline segments.
- **Privacy Focused**: No videos are stored permanently; processing is done in temporary storage.

## Setup Instructions

### Backend
1. Navigate to the **backend** directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the FastAPI server:
   ```bash
   python main.py
   ```
   ✅ Server runs on **`http://localhost:8000`**

### Frontend
1. Navigate to the **frontend** directory:
   ```bash
   cd frontend
   ```
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
   ✅ App runs on **`http://localhost:5173`**

## Quick Start (From Project Root)

**Terminal 1 - Backend:**
```bash
cd backend
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.

## Important Notes

> **⚠️ Use `localhost`, NOT `0.0.0.0`**  
> The backend binds to `0.0.0.0:8000` internally, but you must access it via **`http://localhost:8000`** in your browser. The address `0.0.0.0` is not a valid browser URL.

> **⏱️ Model Loading**  
> The backend may take 30-60 seconds to load the AI model on first startup. Wait for the "Model loaded successfully" message before uploading videos.

## API Documentation

- **`POST /detect`**: Upload a video file for deepfake analysis. Returns JSON with verdict, confidence, and timeline.
- **`GET /`**: Health check endpoint.
- **`GET /docs`**: Interactive API documentation (Swagger UI) at `http://localhost:8000/docs`

## Model
Uses **`dima806/deepfake_vs_real_image_detection`** from HuggingFace Transformers for frame-by-frame analysis.
