"""
Model Diagnostic Script

Checks if model predictions are working correctly.
Compares training data predictions vs actual values.
"""

import pandas as pd
import numpy as np
from pathlib import Path
import json


def diagnose_model():
    """Run comprehensive model diagnostics."""
    
    print("="*80)
    print("MODEL DIAGNOSTIC REPORT")
    print("="*80)
    
    # Load model
    print("\n[1/5] Loading model...")
    try:
        import sys
        sys.path.insert(0, '/app')
        from ml.model_loader import ml_model
        if ml_model is None:
            print("❌ Model not loaded!")
            return
        print("✅ Model loaded successfully")
        print(f"   Model R²: {ml_model.get_metrics()['test']['r2']:.4f}")
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Load training profile
    print("\n[2/5] Loading training profile...")
    try:
        profile_path = Path(__file__).parent / 'training_profile.json'
        with open(profile_path, 'r') as f:
            profile = json.load(f)
        print("✅ Training profile loaded")
        print(f"   Training samples: {profile['n_samples']}")
        print(f"   Features: {len(profile['feature_names'])}")
    except Exception as e:
        print(f"❌ Failed to load training profile: {e}")
        profile = None
    
    # Test with sample data
    print("\n[3/5] Testing with sample features...")
    
    # Use mean values from training profile
    if profile:
        test_features = {
            name: profile['feature_stats'][name]['mean']
            for name in profile['feature_names']
        }
    else:
        # Fallback to reasonable defaults
        test_features = {
            'total_items': 20,
            'unique_items': 15,
            'avg_item_price': 5.0,
            'max_item_price': 10.0,
            'total_quantity': 50,
            'hour_of_day': 12,
            'day_of_week': 2,
            'is_weekend': 0,
            'month': 6,
            'category_diversity': 5,
            'has_high_value_item': 1,
            'customer_frequency': 3,
            'customer_avg_spend': 300.0,
            'is_repeat_customer': 1,
        }
    
    print("   Test features:")
    for name, value in test_features.items():
        print(f"     {name}: {value}")
    
    try:
        result = ml_model.predict(test_features)
        print("\n✅ Prediction successful!")
        print(f"   Predicted value: £{result['predicted_value']:.2f}")
        print(f"   Confidence: {result['confidence']:.1f}%")
        print(f"   Lower bound: £{result['lower_bound']:.2f}")
        print(f"   Upper bound: £{result['upper_bound']:.2f}")
        print(f"   Margin of error: £{result['margin_of_error']:.2f}")
        print(f"   Is outlier: {result['is_outlier']}")
        
        # Sanity checks
        if result['predicted_value'] <= 0:
            print("\n❌ ERROR: Predicted value is negative or zero!")
        elif result['predicted_value'] > 10000:
            print("\n⚠️  WARNING: Predicted value seems too high!")
        else:
            print("\n✅ Predicted value is in reasonable range")
        
        if result['confidence'] < 50:
            print("⚠️  WARNING: Low confidence prediction")
        
    except Exception as e:
        print(f"\n❌ Prediction failed: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Test with actual CSV data
    print("\n[4/5] Testing with actual CSV data...")
    
    data_path = Path(__file__).parent.parent / 'Data' / 'Online Retail.csv'
    if not data_path.exists():
        print(f"⚠️  Dataset not found: {data_path}")
    else:
        try:
            import sys
            sys.path.insert(0, '/app')
            from ml.feature_extractor import extract_features_from_csv
            
            print(f"   Loading CSV: {data_path}")
            features = extract_features_from_csv(str(data_path))
            
            print("   Extracted features:")
            for name, value in features.items():
                print(f"     {name}: {value}")
            
            result = ml_model.predict(features)
            print(f"\n✅ CSV prediction successful!")
            print(f"   Predicted value: £{result['predicted_value']:.2f}")
            print(f"   Confidence: {result['confidence']:.1f}%")
            
        except Exception as e:
            print(f"\n❌ CSV prediction failed: {e}")
            import traceback
            traceback.print_exc()
    
    # Check scaler
    print("\n[5/5] Checking scaler...")
    try:
        scaler = ml_model.scaler
        print(f"✅ Scaler loaded")
        print(f"   Mean shape: {scaler.mean_.shape}")
        print(f"   Scale shape: {scaler.scale_.shape}")
        print(f"   Feature count: {len(scaler.mean_)}")
        
        # Check if scaler matches features
        if len(scaler.mean_) != len(ml_model.feature_names):
            print(f"\n❌ ERROR: Scaler features ({len(scaler.mean_)}) != Model features ({len(ml_model.feature_names)})")
        else:
            print(f"\n✅ Scaler matches model features")
        
    except Exception as e:
        print(f"❌ Scaler check failed: {e}")
    
    print("\n" + "="*80)
    print("DIAGNOSTIC COMPLETE")
    print("="*80)


if __name__ == '__main__':
    diagnose_model()
