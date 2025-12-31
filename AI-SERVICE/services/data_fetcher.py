from typing import List, Dict, Any
from datetime import datetime, timedelta
from src.utils.database import supabase
import pandas as pd

class DataFetcher:
    """Fetches consumption data from Supabase for ML model training"""
    
    def fetch_consumption_history(self, equipment_id: str = None, days: int = 90) -> pd.DataFrame:
        """
        Fetch consumption history for equipment(s)
        
        Args:
            equipment_id: Specific equipment ID, or None for all equipment
            days: Number of days of history to fetch
            
        Returns:
            DataFrame with consumption data
        """
        start_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        query = supabase.table('equipment_consumption').select('*').gte('date', start_date)
        
        if equipment_id:
            query = query.eq('equipment_id', equipment_id)
        
        response = query.order('date', desc=False).execute()
        
        if not response.data:
            return pd.DataFrame()
        
        df = pd.DataFrame(response.data)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        return df
    
    def fetch_equipments(self) -> List[Dict[str, Any]]:
        """Fetch all equipments"""
        response = supabase.table('equipments').select('*').execute()
        return response.data if response.data else []
    
    def fetch_equipment_by_id(self, equipment_id: str) -> Dict[str, Any]:
        """Fetch specific equipment"""
        response = supabase.table('equipments').select('*').eq('id', equipment_id).single().execute()
        return response.data if response.data else None

