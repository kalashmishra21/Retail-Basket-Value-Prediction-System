"""
XGBoost Model Training Script for Retail Basket Value Prediction

This script:
1. Loads Online Retail dataset
2. Engineers features from transaction data
3. Trains 3 XGBoost models (main, lower, upper bounds)
4. Evaluates performance
5. Saves models and metrics
"""

import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib
import json
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

print("="*80)
print("RETAIL BASKET VALUE PREDICTION - MODEL TRAINING")
print("="*80)

# ============================================================================
# STEP 1: LOAD DATA
# ============================================================================
print("\n[1/9] Loading dataset...")

data_path = Path(__file__).parent.parent / 'Data' / 'Online Retail.csv'
print(f"Reading from: {data_path}")

try:
    df = pd.read_csv(data_path, encoding='latin1')
    print(f"✅ Dataset loaded: {len(df):,} rows, {len(df.columns)} columns")
except Exception as e:
    print(f"❌ Error loading dataset: {e}")
    exit(1)

# ============================================================================
# STEP 2: DATA CLEANING
# ============================================================================
print("\n[2/9] Cleaning data...")

initial_rows = len(df)

# Remove rows with missing CustomerID
df = df.dropna(subset=['CustomerID'])
print(f"  - Removed {initial_rows - len(df):,} rows with null CustomerID")

# Remove negative quantities (returns/cancellations)
df = df[df['Quantity'] > 0]

# Remove zero or negative prices
df = df[df['UnitPrice'] > 0]

# Remove rows with missing InvoiceNo
df = df.dropna(subset=['InvoiceNo'])

print(f"✅ Clean dataset: {len(df):,} rows remaining")

# ============================================================================
# STEP 3: PARSE DATES & CREATE TEMPORAL FEATURES
# ============================================================================
print("\n[3/9] Extracting temporal features...")

df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'])
df['hour_of_day'] = df['InvoiceDate'].dt.hour
df['day_of_week'] = df['InvoiceDate'].dt.dayofweek
df['month'] = df['InvoiceDate'].dt.month
df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)

print("✅ Temporal features extracted")

# ============================================================================
# STEP 4: CALCULATE BASKET VALUE (TARGET)
# ============================================================================
print("\n[4/9] Calculating basket values...")

df['basket_value'] = df['Quantity'] * df['UnitPrice']

# Remove outliers (basket_value > 99th percentile)
percentile_99 = df.groupby('InvoiceNo')['basket_value'].sum().quantile(0.99)
print(f"  - 99th percentile basket value: £{percentile_99:.2f}")

# ============================================================================
# STEP 5: FEATURE ENGINEERING
# ============================================================================
print("\n[5/9] Engineering features per invoice...")

# Group by InvoiceNo and calculate features
features_list = []

for invoice_no, group in df.groupby('InvoiceNo'):
    basket_total = group['basket_value'].sum()
    
    # Skip outliers
    if basket_total > percentile_99 or basket_total <= 0:
        continue
    
    features = {
        # Target
        'basket_value': basket_total,
        
        # Transaction features
        'total_items': len(group),
        'unique_items': group['StockCode'].nunique(),
        'avg_item_price': group['UnitPrice'].mean(),
        'max_item_price': group['UnitPrice'].max(),
        'total_quantity': group['Quantity'].sum(),
        
        # Temporal features
        'hour_of_day': group['hour_of_day'].iloc[0],
        'day_of_week': group['day_of_week'].iloc[0],
        'is_weekend': group['is_weekend'].iloc[0],
        'month': group['month'].iloc[0],
        
        # Customer ID for later aggregation
        'customer_id': group['CustomerID'].iloc[0],
        
        # Product features
        'category_diversity': group['Description'].str[0].nunique() if 'Description' in group.columns else 1,
        'has_high_value_item': int(group['UnitPrice'].max() > group['UnitPrice'].quantile(0.75)),
    }
    
    features_list.append(features)

features_df = pd.DataFrame(features_list)
print(f"✅ Features engineered for {len(features_df):,} invoices")

# Calculate customer-level features
print("  - Calculating customer-level features...")
customer_stats = features_df.groupby('customer_id').agg({
    'basket_value': ['count', 'mean']
}).reset_index()
customer_stats.columns = ['customer_id', 'customer_frequency', 'customer_avg_spend']

# Merge customer stats
features_df = features_df.merge(customer_stats, on='customer_id', how='left')
features_df['is_repeat_customer'] = (features_df['customer_frequency'] > 1).astype(int)

# Drop customer_id (not needed for training)
features_df = features_df.drop('customer_id', axis=1)

print(f"✅ Final feature set: {len(features_df):,} samples, {len(features_df.columns)-1} features")

# ============================================================================
# STEP 6: PREPARE TRAINING DATA
# ============================================================================
print("\n[6/9] Preparing training data...")

# Separate features and target
X = features_df.drop('basket_value', axis=1)
y = features_df['basket_value']

# Save feature names
feature_names = X.columns.tolist()
print(f"  - Features: {feature_names}")

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print(f"✅ Train set: {len(X_train):,} samples")
print(f"✅ Test set: {len(X_test):,} samples")

# Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print("✅ Features scaled using StandardScaler")

# ============================================================================
# STEP 7: TRAIN XGBOOST MODELS
# ============================================================================
print("\n[7/9] Training XGBoost models...")

# Model 1: Main model (mean prediction)
print("  - Training main model (50th percentile)...")
model_main = xgb.XGBRegressor(
    objective='reg:squarederror',
    n_estimators=200,
    max_depth=6,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    n_jobs=-1
)
model_main.fit(X_train_scaled, y_train, verbose=False)
print("    ✅ Main model trained")

# Model 2: Lower bound (2.5th percentile)
print("  - Training lower bound model (2.5th percentile)...")
model_lower = xgb.XGBRegressor(
    objective='reg:quantileerror',
    quantile_alpha=0.025,
    n_estimators=200,
    max_depth=6,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    n_jobs=-1
)
model_lower.fit(X_train_scaled, y_train, verbose=False)
print("    ✅ Lower bound model trained")

# Model 3: Upper bound (97.5th percentile)
print("  - Training upper bound model (97.5th percentile)...")
model_upper = xgb.XGBRegressor(
    objective='reg:quantileerror',
    quantile_alpha=0.975,
    n_estimators=200,
    max_depth=6,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    n_jobs=-1
)
model_upper.fit(X_train_scaled, y_train, verbose=False)
print("    ✅ Upper bound model trained")

# ============================================================================
# STEP 8: EVALUATE MODELS
# ============================================================================
print("\n[8/9] Evaluating model performance...")

# Predictions
y_pred_train = model_main.predict(X_train_scaled)
y_pred_test = model_main.predict(X_test_scaled)

# Training metrics
train_rmse = np.sqrt(mean_squared_error(y_train, y_pred_train))
train_mae = mean_absolute_error(y_train, y_pred_train)
train_r2 = r2_score(y_train, y_pred_train)

# Test metrics
test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
test_mae = mean_absolute_error(y_test, y_pred_test)
test_r2 = r2_score(y_test, y_pred_test)

print("\n" + "="*80)
print("MODEL PERFORMANCE METRICS")
print("="*80)
print(f"\nTraining Set:")
print(f"  RMSE: £{train_rmse:.2f}")
print(f"  MAE:  £{train_mae:.2f}")
print(f"  R²:   {train_r2:.4f}")

print(f"\nTest Set:")
print(f"  RMSE: £{test_rmse:.2f}")
print(f"  MAE:  £{test_mae:.2f}")
print(f"  R²:   {test_r2:.4f}")

# Check for overfitting
if abs(train_r2 - test_r2) > 0.1:
    print("\n⚠️  Warning: Possible overfitting detected (R² difference > 0.1)")
else:
    print("\n✅ No overfitting detected (R² difference < 0.1)")

# ============================================================================
# STEP 9: SAVE MODELS AND ARTIFACTS
# ============================================================================
print("\n[9/9] Saving models and artifacts...")

save_dir = Path(__file__).parent

# Save models in native XGBoost format (version-safe)
model_main.get_booster().save_model(str(save_dir / 'xgboost_main.json'))
print("  ✅ Saved: xgboost_main.json (native format)")

model_lower.get_booster().save_model(str(save_dir / 'xgboost_lower.json'))
print("  ✅ Saved: xgboost_lower.json (native format)")

model_upper.get_booster().save_model(str(save_dir / 'xgboost_upper.json'))
print("  ✅ Saved: xgboost_upper.json (native format)")

# Also save pickle versions for backward compatibility
joblib.dump(model_main, save_dir / 'xgboost_main.pkl')
print("  ✅ Saved: xgboost_main.pkl (backward compatibility)")

joblib.dump(model_lower, save_dir / 'xgboost_lower.pkl')
print("  ✅ Saved: xgboost_lower.pkl (backward compatibility)")

joblib.dump(model_upper, save_dir / 'xgboost_upper.pkl')
print("  ✅ Saved: xgboost_upper.pkl (backward compatibility)")

# Save scaler
joblib.dump(scaler, save_dir / 'scaler.pkl')
print("  ✅ Saved: scaler.pkl")

# Save feature names
with open(save_dir / 'feature_names.json', 'w') as f:
    json.dump(feature_names, f, indent=2)
print("  ✅ Saved: feature_names.json")

# Save metrics
metrics = {
    'train': {
        'rmse': float(train_rmse),
        'mae': float(train_mae),
        'r2': float(train_r2)
    },
    'test': {
        'rmse': float(test_rmse),
        'mae': float(test_mae),
        'r2': float(test_r2)
    },
    'samples': {
        'train': len(X_train),
        'test': len(X_test),
        'total': len(X)
    },
    'features': feature_names
}

with open(save_dir / 'model_metrics.json', 'w') as f:
    json.dump(metrics, f, indent=2)
print("  ✅ Saved: model_metrics.json")

# Save version metadata
import sys
from datetime import datetime

version_metadata = {
    'model_version': '1.0.0',
    'training_date': datetime.now().strftime('%Y-%m-%d'),
    'xgboost_version': xgb.__version__,
    'scikit_learn_version': '1.4.0',  # From requirements.txt
    'numpy_version': np.__version__,
    'pandas_version': pd.__version__,
    'python_version': f"{sys.version_info.major}.{sys.version_info.minor}",
    'model_format': 'native_json',
    'models': {
        'main': 'xgboost_main.json',
        'lower': 'xgboost_lower.json',
        'upper': 'xgboost_upper.json',
        'scaler': 'scaler.pkl'
    },
    'performance': {
        'r2': float(test_r2),
        'rmse': float(test_rmse),
        'mae': float(test_mae)
    },
    'notes': 'Models saved in native XGBoost JSON format for version-safe loading. Pickle versions kept for backward compatibility.'
}

with open(save_dir / 'model_version.json', 'w') as f:
    json.dump(version_metadata, f, indent=2)
print("  ✅ Saved: model_version.json")

print("\n" + "="*80)
print("✅ MODEL TRAINING COMPLETED SUCCESSFULLY!")
print("="*80)
print(f"\nModel files saved in: {save_dir}")
print("\nNext steps:")
print("1. Generate training profile: python ml/generate_training_profile.py")
print("2. Restart Django server")
print("\n" + "="*80)

# Auto-generate training profile
print("\n" + "="*80)
print("GENERATING TRAINING PROFILE")
print("="*80)

try:
    # Calculate feature statistics from training data
    feature_stats = {}
    for col in X.columns:
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
    
    prediction_stats = {
        'target_mean': float(y.mean()),
        'target_std': float(y.std()),
        'target_min': float(y.min()),
        'target_max': float(y.max()),
        'target_q95': float(y.quantile(0.95)),
        'target_q99': float(y.quantile(0.99)),
    }
    
    training_profile = {
        'version': '1.0.0',
        'generated_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'n_samples': len(X),
        'feature_names': feature_names,
        'feature_stats': feature_stats,
        'prediction_stats': prediction_stats,
        'scaler_params': {
            'mean': scaler.mean_.tolist(),
            'scale': scaler.scale_.tolist(),
        },
        'confidence_thresholds': {
            'high': 0.85,
            'medium': 0.70,
            'low': 0.50,
        },
        'outlier_thresholds': {
            'z_score_threshold': 3.0,
            'cv_threshold': 0.50,
            'min_outlier_features': 3,
        }
    }
    
    with open(save_dir / 'training_profile.json', 'w') as f:
        json.dump(training_profile, f, indent=2)
    print("  ✅ Saved: training_profile.json")
    
    print("\n✅ Training profile generated successfully!")
    
except Exception as e:
    print(f"\n⚠️  Warning: Could not generate training profile: {e}")
    print("You can generate it manually later using: python ml/generate_training_profile.py")

print("\n" + "="*80)
