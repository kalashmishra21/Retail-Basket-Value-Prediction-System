"""
Model Loader - Singleton Pattern

Loads trained XGBoost models once and keeps them in memory for fast inference.
"""

import joblib
import json
from pathlib import Path
import numpy as np


class ModelLoader:
    """
    Singleton class to load and manage ML models.
    Models are loaded once on first instantiation and reused.
    """
    
    _instance = None
    _models_loaded = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not ModelLoader._models_loaded:
            self.load_models()
    
    def load_models(self):
        """Load all models and artifacts from disk."""
        base_path = Path(__file__).parent
        
        try:
            print("🔄 Loading ML models...")
            
            # Load XGBoost models
            self.model_main = joblib.load(base_path / 'xgboost_main.pkl')
            print("  ✅ Main model loaded")
            
            self.model_lower = joblib.load(base_path / 'xgboost_lower.pkl')
            print("  ✅ Lower bound model loaded")
            
            self.model_upper = joblib.load(base_path / 'xgboost_upper.pkl')
            print("  ✅ Upper bound model loaded")
            
            # Load scaler
            self.scaler = joblib.load(base_path / 'scaler.pkl')
            print("  ✅ Feature scaler loaded")
            
            # Load feature names
            with open(base_path / 'feature_names.json', 'r') as f:
                self.feature_names = json.load(f)
            print(f"  ✅ Feature names loaded ({len(self.feature_names)} features)")
            
            # Load metrics
            with open(base_path / 'model_metrics.json', 'r') as f:
                self.metrics = json.load(f)
            print(f"  ✅ Model metrics loaded (R²={self.metrics['test']['r2']:.4f})")
            
            ModelLoader._models_loaded = True
            print("✅ All ML models loaded successfully!\n")
            
        except FileNotFoundError as e:
            print(f"❌ Model files not found: {e}")
            print("Please run 'python backend/ml/train_model.py' first to train models.")
            raise
        except Exception as e:
            print(f"❌ Failed to load models: {e}")
            raise
    
    def predict(self, features_dict):
        """
        Make prediction using loaded models.
        
        Args:
            features_dict (dict): Dictionary of features
                Example: {
                    'total_items': 10,
                    'unique_items': 8,
                    'avg_item_price': 5.50,
                    ...
                }
        
        Returns:
            dict: Prediction results
                {
                    'predicted_value': 99.60,
                    'lower_bound': 96.81,
                    'upper_bound': 102.39,
                    'confidence': 85.30,
                    'margin_of_error': 2.79
                }
        """
        
        # Validate features
        missing_features = set(self.feature_names) - set(features_dict.keys())
        if missing_features:
            raise ValueError(f"Missing features: {missing_features}")
        
        # Convert dict to array in correct order
        X = np.array([[features_dict[name] for name in self.feature_names]])
        
        # Scale features
        X_scaled = self.scaler.transform(X)
        
        # Make predictions
        pred_main = float(self.model_main.predict(X_scaled)[0])
        pred_lower = float(self.model_lower.predict(X_scaled)[0])
        pred_upper = float(self.model_upper.predict(X_scaled)[0])
        
        # Calculate confidence based on prediction interval width relative to prediction
        # Better formula: confidence increases as interval narrows
        interval_width = pred_upper - pred_lower
        
        # Use coefficient of variation (CV) for confidence
        # CV = (interval_width / 2) / pred_main
        # Lower CV = higher confidence
        cv = (interval_width / 2) / abs(pred_main) if pred_main != 0 else 1.0
        
        # Convert CV to confidence score (0-100%)
        # CV < 0.1 (10%) → confidence > 90%
        # CV < 0.2 (20%) → confidence > 80%
        # CV < 0.3 (30%) → confidence > 70%
        if cv < 0.05:
            confidence = 95.0
        elif cv < 0.10:
            confidence = 90.0
        elif cv < 0.15:
            confidence = 85.0
        elif cv < 0.20:
            confidence = 80.0
        elif cv < 0.25:
            confidence = 75.0
        elif cv < 0.30:
            confidence = 70.0
        elif cv < 0.40:
            confidence = 65.0
        elif cv < 0.50:
            confidence = 60.0
        else:
            confidence = 55.0
        
        # Calculate margin of error (half of interval width)
        margin_of_error = interval_width / 2
        
        # Outlier detection using prediction interval width
        # If interval is very wide (high uncertainty), it's likely an outlier
        # Use coefficient of variation (CV) threshold
        is_outlier = cv > 0.50  # CV > 50% indicates high uncertainty/outlier
        
        # Outlier confidence score (0-100%)
        # Higher score = more likely to be an outlier
        if cv > 0.80:
            outlier_score = 95.0
        elif cv > 0.70:
            outlier_score = 85.0
        elif cv > 0.60:
            outlier_score = 75.0
        elif cv > 0.50:
            outlier_score = 65.0
        else:
            outlier_score = 0.0  # Not an outlier
        
        return {
            'predicted_value': round(pred_main, 2),
            'lower_bound': round(pred_lower, 2),
            'upper_bound': round(pred_upper, 2),
            'confidence': round(confidence, 2),
            'margin_of_error': round(margin_of_error, 2),
            'is_outlier': is_outlier,
            'outlier_score': round(outlier_score, 2)
        }
    
    def get_metrics(self):
        """Return model performance metrics."""
        return self.metrics
    
    def get_feature_names(self):
        """Return list of feature names."""
        return self.feature_names


# Global singleton instance
# Import this in views.py: from backend.ml.model_loader import ml_model
try:
    ml_model = ModelLoader()
except Exception as e:
    print(f"⚠️  Warning: Could not load ML models: {e}")
    print("The system will not be able to make predictions until models are trained.")
    ml_model = None
