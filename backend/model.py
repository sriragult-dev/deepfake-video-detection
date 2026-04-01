from fastapi import FastAPI, UploadFile, File
from .model import DeepfakeDetector  # <-- Import your class here!
import numpy as np

app = FastAPI()

# Initialize the model once when the server starts
detector = DeepfakeDetector()

@app.post("/predict")
async def predict_video(file: UploadFile = File(...)):
    # 1. Read the video file
    # 2. Extract the frames and preprocess them into the shape (20, 224, 224, 3)
    # 3. Pass the frames to the model
    
    # Example prediction call (assuming 'processed_frames' is ready):
    # prediction = detector.model.predict(np.expand_dims(processed_frames, axis=0))
    # score = prediction[0][0]
    
    return {"filename": file.filename, "fake_probability": "..."}