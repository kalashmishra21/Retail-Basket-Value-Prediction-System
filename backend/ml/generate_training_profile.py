"""
Generate Training Profile - Feature Statistics

Extracts feature statistics from training data to use during inference
for proper confidence calculation and outlier detection.

Run this after training to generate training_profile.json
"""

import pandas as pd
import numpy as np
import json
from pathlib import Path
from sklearn.preprocessing import StandardScaler


def generate_training_profile():
    """
    Generate training profile with feature statistics.
    This should be run after model training to capture the training data distribution.
    """
    
    print("="*80)
    print("GENERATING TRAINING PROFILE")
    print("="*80)
    
    # Load training data
    data_path = Path(__file__).parent.parent / 'Data' / 'Online Retail.csv'
    print(f"\n[1/5] Loading dataset from: {data_path}")
    
    df = pd.read_csv(data_path, encoding='latin1')
    print(f"✅ Dataset loaded: {len(df):,} rows")
    
    # Clean data (same as training)
    print("\n[2/5] Cleaning data...")
    df = df.dropna(subset=['CustomerID'])
    df = df[df['Quantity'] > 0]
    df = df[df['UnitPrice'] > 0]
    df = df.dropna(subset=['InvoiceNo'])
    print(f"✅ Clean dataset: {len(df):,} rows")
    
    # Feature engineering (same as training)
    print("\n[3/5] Engineering features...")
    df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'])
    df['hour_of_day'] = df['InvoiceDate'].dt.hour
    df['day_of_week'] = df['InvoiceDate'].dt.dayofweek
    df['month'] = df['InvoiceDate'].dt.month
    df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
    df['basket_value'] = df['Quantity'] * df['UnitPrice']
    
    # Remove outliers (99th percentile)
    percentile_99 = df.groupby('InvoiceNo')['basket_value'].sum().quantile(0.99)
    
    # Build feature dataset
    features_list = []
    for invoice_no, group in df.groupby('InvoiceNo'):
        basket_total = group['basket_value'].sum()
        if basket_total > percentile_99 or basket_total <= 0:
            continue
        
        features = {
            'basket_value': basket_total,
            'total_items': len(group),
            'unique_items': group['StockCode'].nunique(),
            'avg_item_price': group['UnitPrice'].mean(),
            'max_item_price': group['UnitPrice'].max(),
            'total_quantity': group['Quantity'].sum(),
            'hour_of_day': group['hour_of_day'].iloc[0],
            'day_of_week': group['day_of_week'].iloc[0],
            'is_weekend': group['is_weekend'].iloc[0],
            'month': group['month'].iloc[0],
            'customer_id': group['CustomerID'].iloc[0],
            'category_diversity': group['Description'].str[0].nunique() if 'Description' in group.columns else 1,
            'has_high_value_item': int(group['UnitPrice'].max() > group['UnitPrice'].quantile(0.75)),
        }
        features_list.append(features)
    
    features_df = pd.DataFrame(features_list)
    
    # Customer-level features
    customer_stats = features_df.groupby('customer_id').agg({
        'basket_value': ['count', 'mean']
    }).reset_index()
    customer_stats.columns = ['customer_id', 'customer_frequency', 'customer_avg_spend']
    features_df = features_df.merge(customer_stats, on='customer_id', how='left')
    features_df['is_repeat_customer'] = (features_df['customer_frequency'] > 1).astype(int)
    features_df = features_df.drop('customer_id', axis=1)
    
    print(f"✅ Features engineered: {len(features_df):,} samples")
    
    # Calculate statistics
    print("\n[4/5] Calculating feature statistics...")
    
    X = features_df.drop('basket_value', axis=1)
    feature_names = X.columns.tolist()
    
    # Calculate statistics for each feature
    feature_stats = {}
    for col in feature_names:
        feature_stats[col] = {
            'mean': float(X[col].mean()),
            'std': float(X[col].std()),
            'min': float(X[col].min()),
            'max': float(X[col].max()),
            'q25': float(X[col].quantile(0.25)),
            'q50': float(X[col].quantile(0.50)),
            'q75': float(X[col].quantile(0.75)),
            'q95': float(X[col].quantile(0.95)),
            'q99': float(X[col].quantile(0.99)),
        }
    
    # Calculate scaled statistics (after StandardScaler)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Calculate prediction interval statistics from training
    # This helps set realistic confidence thresholds
    y = features_df['basket_value']
    prediction_stats = {
        'target_mean': float(y.mean()),
        'target_std': float(y.std()),
        'target_min': float(y.min()),
        'target_max': float(y.max()),
        'target_q95': float(y.quantile(0.95)),
        'target_q99': float(y.quantile(0.99)),
    }
    
    # Build training profile
    training_profile = {
        'version': '1.0.0',
        'generated_date': pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S'),
        'n_samples': len(features_df),
        'feature_names': feature_names,
        'feature_stats': feature_stats,
        'prediction_stats': prediction_stats,
        'scaler_params': {
            'mean': scaler.mean_.tolist(),
            'scale': scaler.scale_.tolist(),
        },
        'confidence_thresholds': {
            'high': 0.85,  # CV < 0.15
            'medium': 0.70,  # CV < 0.30
            'low': 0.50,  # CV >= 0.30
        },
        'outlier_thresholds': {
            'z_score_threshold': 3.0,  # Standard 3-sigma rule
            'cv_threshold': 0.50,  # CV > 50% indicates high uncertainty
            'min_outlier_features': 3,  # At least 3 features must be outliers
        }
    }
    
    # Save profile
    print("\n[5/5] Saving training profile...")
    save_path = Path(__file__).parent / 'training_profile.json'
    with open(save_path, 'w') as f:
        json.dump(training_profile, f, indent=2)
    
    print(f"✅ Training profile saved: {save_path}")
    
    # Print summary
    print("\n" + "="*80)
    print("TRAINING PROFILE SUMMARY")
    print("="*80)
    print(f"Total samples: {training_profile['n_samples']:,}")
    print(f"Features: {len(feature_names)}")
    print(f"\nTarget statistics:")
    print(f"  Mean: £{prediction_stats['target_mean']:.2f}")
    print(f"  Std:  £{prediction_stats['target_std']:.2f}")
    print(f"  Range: £{prediction_stats['target_min']:.2f} - £{prediction_stats['target_max']:.2f}")
    print("\n" + "="*80)


if __name__ == '__main__':
    generate_training_profile()
