from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import router
import os

app = FastAPI(
    title="Equipment Inventory AI Service",
    description="AI microservice for consumption prediction and low stock alerts",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(router, prefix="/api", tags=["predictions"])

@app.get("/")
async def root():
    return {
        "message": "Equipment Inventory AI Service",
        "version": "1.0.0",
        "endpoints": {
            "health": "/api/health",
            "predict": "/api/predict_consumption",
            "get_predictions": "/api/predictions/{equipment_id}",
            "check_low_stock": "/api/check_low_stock"
        }
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

