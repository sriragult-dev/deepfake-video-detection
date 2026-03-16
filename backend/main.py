import os
import cv2
import tempfile
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
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
    classifier = pipeline("image-classification", model="dima806/deepfake_vs_real_image_detection")
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    classifier = None

@app.get("/")
def read_root():
    return {"message": "Deepfake Detection API is running"}

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
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video.")

    # Create a temp file to store the uploaded video
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
        temp_video.write(await file.read())
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
                    # Example result: [{'label': 'real', 'score': 0.9}, {'label': 'fake', 'score': 0.1}]
                    # We map this to our summary
                    fake_prob = 0
                    real_prob = 0
                    
                    for res in frame_result:
                        if res['label'].lower() == 'fake':
                            fake_prob = res['score']
                        elif res['label'].lower() == 'real':
                            real_prob = res['score']
                    
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
        if count > 0:
            avg_fake = results_summary["fake_score"] / count
            avg_real = results_summary["real_score"] / count
            
            final_verdict = "FAKE" if avg_fake > avg_real else "REAL"
            confidence = avg_fake if final_verdict == "FAKE" else avg_real
        else:
            final_verdict = "UNKNOWN"
            confidence = 0

        return {
            "filename": file.filename,
            "duration": video_duration,
            "verdict": final_verdict,
            "confidence": confidence,
            "timeline": timeline,
            # "analysis_summary": f"Analyzed {count} frames. Average Fake Score: {avg_fake:.2f}, Average Real Score: {avg_real:.2f}"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
