"""
Machine Learning Module for Retail Basket Value Prediction

This module contains:
- train_model.py: XGBoost model training script
- model_loader.py: Singleton model loader for inference
- feature_extractor.py: Feature extraction from CSV files

Usage:
    from backend.ml.model_loader import ml_model
    from backend.ml.feature_extractor import extract_features_from_csv
    
    features = extract_features_from_csv('path/to/data.csv')
    prediction = ml_model.predict(features)
"""

__version__ = '1.0.0'
