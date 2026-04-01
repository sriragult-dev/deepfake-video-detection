import os
import cv2
import tempfile
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from transformers import pipeline
from PIL import Image

app = FastAPI(title="Deepfake Detection API")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Model (Lazy loading recommended, but here we load at startup for simplicity)
print("Loading model...")
try:
    # Using a generic deepfake detection model from HF or a similar image classification model
    # For this demo, we can use a known model. 
    # NOTE: 'dima806/deepfake_vs_real_image_detection' is a popular one for images.
    classifier = pipeline("image-classification", model="dima806/deepfake_vs_real_image_detection", framework="pt")
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    classifier = None


def analyze_frame(frame):
    if not classifier:
        return None
    
    # Convert CV2 frame (BGR) to PIL Image (RGB)
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    pil_image = Image.fromarray(rgb_frame)
    
    # Run inference
    results = classifier(pil_image)
    return results

@app.post("/detect")
async def detect_deepfake(file: UploadFile = File(...)):
    # Some devices/browsers send wrong or empty MIME type, so also check by extension
    VALID_VIDEO_EXTENSIONS = {'.mp4', '.avi', '.mov', '.mkv', '.webm', '.ogv', '.mpeg', '.mpg', '.3gp', '.flv', '.wmv'}
    file_ext = os.path.splitext(file.filename or "")[1].lower()
    is_video_mime = file.content_type and file.content_type.startswith("video/")
    is_video_ext = file_ext in VALID_VIDEO_EXTENSIONS

    if not is_video_mime and not is_video_ext:
        raise HTTPException(status_code=400, detail=f"File must be a video. Received type: '{file.content_type}', extension: '{file_ext}'")

    # Create a temp file to store the uploaded video
    import shutil
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
        shutil.copyfileobj(file.file, temp_video)
        temp_video_path = temp_video.name

    try:
        cap = cv2.VideoCapture(temp_video_path)
        if not cap.isOpened():
            raise HTTPException(status_code=500, detail="Could not open video file.")

        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        video_duration = frame_count / fps if fps > 0 else 0

        # Analysis config
        max_frames_to_analyze = 20 # Limit to avoid timeouts
        frame_interval = max(1, frame_count // max_frames_to_analyze)
        
        results_summary = {"real_score": 0, "fake_score": 0, "frames_analyzed": 0}
        timeline = []
        
        current_frame = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            if current_frame % frame_interval == 0:
                frame_result = analyze_frame(frame)
                if frame_result:
                    # Debug: log the raw labels from the model on the first frame
                    if results_summary["frames_analyzed"] == 0:
                        print(f"[DEBUG] Raw model output: {frame_result}")

                    fake_prob = 0
                    real_prob = 0

                    for res in frame_result:
                        label = res['label'].lower()
                        # Robust matching: covers 'fake', 'FAKE', 'Fake', 'AI-Generated', etc.
                        if 'fake' in label or 'artificial' in label or 'generated' in label or 'deepfake' in label:
                            fake_prob = res['score']
                        elif 'real' in label or 'authentic' in label or 'genuine' in label:
                            real_prob = res['score']

                    # Fallback: if only two labels and neither matched, use index-based assignment
                    if fake_prob == 0 and real_prob == 0 and len(frame_result) == 2:
                        print(f"[WARN] Labels did not match known patterns: {[r['label'] for r in frame_result]}. Using index 0=fake, 1=real fallback.")
                        fake_prob = frame_result[0]['score']
                        real_prob = frame_result[1]['score']

                    timeline.append({
                        "timestamp": current_frame / fps if fps else 0,
                        "frame_index": current_frame,
                        "fake_prob": fake_prob,
                        "real_prob": real_prob
                    })
                    
                    results_summary["real_score"] += real_prob
                    results_summary["fake_score"] += fake_prob
                    results_summary["frames_analyzed"] += 1
            
            current_frame += 1
            if results_summary["frames_analyzed"] >= max_frames_to_analyze:
                break

        cap.release()

        # Aggregate results
        count = results_summary["frames_analyzed"]
        avg_fake = 0.0
        avg_real = 0.0
        if count > 0:
            avg_fake = results_summary["fake_score"] / count
            avg_real = results_summary["real_score"] / count
            
            final_verdict = "FAKE" if avg_fake > avg_real else "REAL"
            confidence = avg_fake if final_verdict == "FAKE" else avg_real
        else:
            final_verdict = "UNKNOWN"
            confidence = 0

        print(f"[RESULT] Verdict: {final_verdict} | Confidence: {confidence:.2f} | Frames: {count} | AvgFake: {avg_fake:.2f} | AvgReal: {avg_real:.2f}")

        return {
            "filename": file.filename,
            "duration": video_duration,
            "verdict": final_verdict,
            "confidence": round(confidence, 4),
            "frames_analyzed": count,
            "avg_fake_score": round(avg_fake, 4),
            "avg_real_score": round(avg_real, 4),
            "timeline": timeline,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)

# Mount built React static files
try:
    app.mount("/", StaticFiles(directory="static", html=True), name="static")
except Exception:
    print("Frontend folder not found - starting backend only.")

# Add a catch-all to serve index.html for React Router
@app.exception_handler(404)
async def custom_404_handler(request, __):
    return FileResponse("static/index.html")

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
