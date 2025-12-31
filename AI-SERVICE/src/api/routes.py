from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from pydantic import BaseModel
from src.models.prediction_service import PredictionService
from src.services.notification_creator import NotificationCreator
from src.services.data_fetcher import DataFetcher
from src.utils.database import supabase

router = APIRouter()
prediction_service = PredictionService()
notification_creator = NotificationCreator()
data_fetcher = DataFetcher()

class PredictionRequest(BaseModel):
    equipment_id: str = None
    days: int = 7

class LowStockCheckResponse(BaseModel):
    alerts: List[Dict[str, Any]]

@router.post("/predict_consumption")
async def predict_consumption(request: PredictionRequest) -> Dict[str, Any]:
    """
    Generate consumption predictions for equipment(s)
    
    If equipment_id is provided, predicts for that equipment only.
    Otherwise, predicts for all equipments.
    """
    try:
        if request.equipment_id:
            predictions = prediction_service.predict_for_equipment(
                request.equipment_id,
                request.days
            )
            return {
                "success": True,
                "equipment_id": request.equipment_id,
                "predictions": predictions
            }
        else:
            all_predictions = prediction_service.predict_for_all_equipments(request.days)
            return {
                "success": True,
                "predictions": all_predictions
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/predictions/{equipment_id}")
async def get_predictions(equipment_id: str, days: int = 7) -> Dict[str, Any]:
    """Get predictions for a specific equipment"""
    try:
        predictions = prediction_service.predict_for_equipment(equipment_id, days)
        return {
            "success": True,
            "equipment_id": equipment_id,
            "predictions": predictions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/check_low_stock")
async def check_low_stock() -> Dict[str, Any]:
    """
    Check for low stock predictions and create notifications
    """
    try:
        alerts = prediction_service.check_low_stock_predictions()
        
        # Create notifications for each alert
        notifications_created = []
        for alert in alerts:
            notification = notification_creator.create_prediction_notification(
                alert['equipment_id'],
                alert['equipment_name'],
                alert['days_until_shortage']
            )
            if notification:
                notifications_created.append(notification)
        
        return {
            "success": True,
            "alerts": alerts,
            "notifications_created": len(notifications_created)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint"""
    return {"status": "ok", "service": "ai-prediction-service"}

