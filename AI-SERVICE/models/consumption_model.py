import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Tuple
from datetime import datetime, timedelta

class ConsumptionPredictor:
    """ML model for predicting equipment consumption"""
    
    def __init__(self):
        self.model = LinearRegression()
        self.scaler = StandardScaler()
        self.is_trained = False
    
    def prepare_features(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """
        Prepare features from consumption data
        
        Features:
        - Day of week (0-6)
        - Day of month (1-31)
        - Month (1-12)
        - Rolling average (7 days)
        - Rolling average (30 days)
        """
        if df.empty or len(df) < 7:
            return np.array([]), np.array([])
        
        df = df.copy()
        df['day_of_week'] = df['date'].dt.dayofweek
        df['day_of_month'] = df['date'].dt.day
        df['month'] = df['date'].dt.month
        
        # Calculate rolling averages
        df['rolling_7d'] = df['quantity_used'].rolling(window=7, min_periods=1).mean()
        df['rolling_30d'] = df['quantity_used'].rolling(window=30, min_periods=1).mean()
        
        # Fill NaN values
        df['rolling_7d'] = df['rolling_7d'].fillna(df['quantity_used'].mean())
        df['rolling_30d'] = df['rolling_30d'].fillna(df['quantity_used'].mean())
        
        # Aggregate by date (sum quantities per day)
        daily_consumption = df.groupby('date').agg({
            'quantity_used': 'sum',
            'day_of_week': 'first',
            'day_of_month': 'first',
            'month': 'first',
            'rolling_7d': 'mean',
            'rolling_30d': 'mean'
        }).reset_index()
        
        # Prepare features and target
        feature_cols = ['day_of_week', 'day_of_month', 'month', 'rolling_7d', 'rolling_30d']
        X = daily_consumption[feature_cols].values
        y = daily_consumption['quantity_used'].values
        
        return X, y
    
    def train(self, df: pd.DataFrame) -> Dict[str, float]:
        """
        Train the model on consumption data
        
        Returns:
            Dictionary with training metrics
        """
        X, y = self.prepare_features(df)
        
        if len(X) == 0:
            return {'error': 'Insufficient data for training'}
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        self.model.fit(X_scaled, y)
        self.is_trained = True
        
        # Calculate R² score
        score = self.model.score(X_scaled, y)
        
        return {
            'r2_score': float(score),
            'samples': len(X),
            'trained': True
        }
    
    def predict(self, days: int = 7) -> List[Dict[str, any]]:
        """
        Predict consumption for next N days
        
        Args:
            days: Number of days to predict
            
        Returns:
            List of predictions with dates and quantities
        """
        if not self.is_trained:
            raise ValueError("Model not trained. Call train() first.")
        
        predictions = []
        base_date = datetime.now()
        
        for i in range(days):
            prediction_date = base_date + timedelta(days=i)
            
            # Prepare features for this date
            day_of_week = prediction_date.weekday()
            day_of_month = prediction_date.day
            month = prediction_date.month
            
            # Use recent averages as rolling features (simplified)
            # In production, you'd maintain state or use historical averages
            rolling_7d = 0  # Would be calculated from recent data
            rolling_30d = 0  # Would be calculated from recent data
            
            features = np.array([[day_of_week, day_of_month, month, rolling_7d, rolling_30d]])
            features_scaled = self.scaler.transform(features)
            
            predicted_quantity = self.model.predict(features_scaled)[0]
            predicted_quantity = max(0, int(predicted_quantity))  # Ensure non-negative
            
            predictions.append({
                'date': prediction_date.date().isoformat(),
                'predicted_consumption': predicted_quantity,
                'confidence_score': 0.75  # Simplified confidence score
            })
        
        return predictions
    
    def predict_with_data(self, df: pd.DataFrame, days: int = 7) -> List[Dict[str, any]]:
        """
        Train and predict in one step
        
        Args:
            df: Consumption history DataFrame
            days: Number of days to predict
            
        Returns:
            List of predictions
        """
        # Train on available data
        train_result = self.train(df)
        
        if 'error' in train_result:
            # Fallback: use simple average if insufficient data
            if not df.empty:
                avg_consumption = df['quantity_used'].mean()
                predictions = []
                base_date = datetime.now()
                
                for i in range(days):
                    prediction_date = base_date + timedelta(days=i)
                    predictions.append({
                        'date': prediction_date.date().isoformat(),
                        'predicted_consumption': int(avg_consumption),
                        'confidence_score': 0.5
                    })
                return predictions
            return []
        
        return self.predict(days)

