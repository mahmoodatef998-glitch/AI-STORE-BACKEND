from typing import Dict, Any
from src.utils.database import supabase

class NotificationCreator:
    """Creates notifications in the database"""
    
    def create_low_stock_notification(
        self,
        equipment_id: str,
        equipment_name: str,
        available: int,
        threshold: int
    ) -> Dict[str, Any]:
        """Create a low stock notification"""
        message = (
            f"Low stock alert: {equipment_name} has only {available} units available "
            f"(threshold: {threshold})"
        )
        
        notification = {
            'type': 'dashboard',
            'message': message,
            'equipment_id': equipment_id,
            'sent': False
        }
        
        response = supabase.table('notifications').insert(notification).execute()
        return response.data[0] if response.data else None
    
    def create_prediction_notification(
        self,
        equipment_id: str,
        equipment_name: str,
        predicted_shortage_days: int
    ) -> Dict[str, Any]:
        """Create a prediction-based notification"""
        message = (
            f"AI Prediction: {equipment_name} is predicted to run out of stock "
            f"within {predicted_shortage_days} days"
        )
        
        notification = {
            'type': 'dashboard',
            'message': message,
            'equipment_id': equipment_id,
            'sent': False
        }
        
        response = supabase.table('notifications').insert(notification).execute()
        return response.data[0] if response.data else None

