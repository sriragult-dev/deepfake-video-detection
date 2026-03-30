# Stage 1: Build React Frontend
FROM node:18-alpine as build-frontend
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
# We set the API URL to root since both will run on the same port on HF
RUN VITE_API_URL="" npm run build

# Stage 2: Build FastAPI Backend
FROM python:3.10-slim
WORKDIR /app

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./

# Copy built frontend from Stage 1
COPY --from=build-frontend /frontend/dist ./static

# Expose port 7860 (Hugging Face default)
ENV PORT=7860
EXPOSE 7860

# Start command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
