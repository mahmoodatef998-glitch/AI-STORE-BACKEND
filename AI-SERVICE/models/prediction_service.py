from typing import List, Dict, Any
from datetime import datetime, timedelta
from src.services.data_fetcher import DataFetcher
from src.models.consumption_model import ConsumptionPredictor
from src.utils.database import supabase

class PredictionService:
    """Service for generating and storing predictions"""
    
    def __init__(self):
        self.data_fetcher = DataFetcher()
        self.predictor = ConsumptionPredictor()
    
    def predict_for_equipment(
        self,
        equipment_id: str,
        days: int = 7
    ) -> List[Dict[str, Any]]:
        """
        Generate predictions for a specific equipment
        
        Args:
            equipment_id: Equipment ID
            days: Number of days to predict
            
        Returns:
            List of predictions
        """
        # Fetch consumption history
        df = self.data_fetcher.fetch_consumption_history(equipment_id, days=90)
        
        if df.empty:
            # No historical data, return empty predictions
            return []
        
        # Generate predictions
        predictions = self.predictor.predict_with_data(df, days)
        
        # Store predictions in database
        self._store_predictions(equipment_id, predictions)
        
        return predictions
    
    def predict_for_all_equipments(self, days: int = 7) -> Dict[str, List[Dict[str, Any]]]:
        """
        Generate predictions for all equipments
        
        Args:
            days: Number of days to predict
            
        Returns:
            Dictionary mapping equipment_id to predictions
        """
        equipments = self.data_fetcher.fetch_equipments()
        all_predictions = {}
        
        for equipment in equipments:
            equipment_id = equipment['id']
            try:
                predictions = self.predict_for_equipment(equipment_id, days)
                all_predictions[equipment_id] = predictions
            except Exception as e:
                print(f"Error predicting for equipment {equipment_id}: {e}")
                continue
        
        return all_predictions
    
    def _store_predictions(
        self,
        equipment_id: str,
        predictions: List[Dict[str, Any]]
    ) -> None:
        """Store predictions in the database"""
        for pred in predictions:
            prediction_record = {
                'equipment_id': equipment_id,
                'predicted_consumption': pred['predicted_consumption'],
                'prediction_date': pred['date'],
                'confidence_score': pred.get('confidence_score', 0.5)
            }
            
            # Upsert prediction (update if exists, insert if not)
            supabase.table('predictions').upsert(
                prediction_record,
                on_conflict='equipment_id,prediction_date'
            ).execute()
    
    def check_low_stock_predictions(self) -> List[Dict[str, Any]]:
        """
        Check if any equipment is predicted to run out of stock
        within the next 7 days
        
        Returns:
            List of equipment that need reordering
        """
        equipments = self.data_fetcher.fetch_equipments()
        alerts = []
        
        for equipment in equipments:
            equipment_id = equipment['id']
            available = equipment['quantity_available']
            threshold = equipment['minimum_threshold']
            
            # Get predictions for next 7 days
            predictions = self.predict_for_equipment(equipment_id, days=7)
            
            if not predictions:
                continue
            
            # Calculate total predicted consumption
            total_predicted = sum(p['predicted_consumption'] for p in predictions)
            
            # Check if predicted to run out
            if available - total_predicted < threshold:
                days_until_shortage = self._calculate_days_until_shortage(
                    available,
                    threshold,
                    predictions
                )
                
                alerts.append({
                    'equipment_id': equipment_id,
                    'equipment_name': equipment['name'],
                    'current_available': available,
                    'predicted_consumption': total_predicted,
                    'days_until_shortage': days_until_shortage,
                    'recommended_reorder': max(threshold * 2, total_predicted)
                })
        
        return alerts
    
    def _calculate_days_until_shortage(
        self,
        available: int,
        threshold: int,
        predictions: List[Dict[str, Any]]
    ) -> int:
        """Calculate how many days until stock falls below threshold"""
        current = available
        
        for i, pred in enumerate(predictions):
            current -= pred['predicted_consumption']
            if current < threshold:
                return i + 1
        
        return len(predictions) + 1  # Beyond prediction window

