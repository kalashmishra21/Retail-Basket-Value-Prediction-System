"""
Feature Extractor for Real-Time Predictions

Extracts features from uploaded CSV files to match the training data format.
Used during prediction time to prepare input for the XGBoost model.
"""

import pandas as pd
import numpy as np
from pathlib import Path


def extract_features_from_csv(csv_path, customer_id=None):
    """
    Extract features from a CSV file for prediction.
    
    Args:
        csv_path (str): Path to the uploaded CSV file
        customer_id (int, optional): Specific customer ID to extract features for
    
    Returns:
        dict: Feature dictionary ready for model prediction
        
    Raises:
        ValueError: If CSV format is invalid or required columns are missing
    """
    
    try:
        # Load CSV with proper handling of commas in fields
        df = pd.read_csv(csv_path, encoding='latin1', on_bad_lines='skip')
        
        # Validate required columns
        required_cols = ['InvoiceNo', 'Quantity', 'UnitPrice', 'InvoiceDate']
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            raise ValueError(f"Missing required columns: {missing_cols}")
        
        # Clean data
        df = df.dropna(subset=['InvoiceNo'])
        df = df[df['Quantity'] > 0]
        df = df[df['UnitPrice'] > 0]
        
        if len(df) == 0:
            raise ValueError("No valid data rows after cleaning")
        
        # Parse dates
        df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'], errors='coerce')
        df = df.dropna(subset=['InvoiceDate'])  # Remove rows with invalid dates
        
        df['hour_of_day'] = df['InvoiceDate'].dt.hour
        df['day_of_week'] = df['InvoiceDate'].dt.dayofweek
        df['month'] = df['InvoiceDate'].dt.month
        df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
        
        # Calculate basket value
        df['basket_value'] = df['Quantity'] * df['UnitPrice']
        
        # If customer_id provided, filter to that customer
        if customer_id and 'CustomerID' in df.columns:
            df = df[df['CustomerID'] == customer_id]
            if len(df) == 0:
                raise ValueError(f"No data found for customer {customer_id}")
        
        # Group by invoice to get transaction-level features
        # Use the most recent invoice if multiple exist
        latest_invoice = df.groupby('InvoiceNo')['InvoiceDate'].max().idxmax()
        invoice_group = df[df['InvoiceNo'] == latest_invoice]
        
        # Calculate transaction features
        total_items = len(invoice_group)
        unique_items = invoice_group['StockCode'].nunique() if 'StockCode' in invoice_group.columns else total_items
        avg_item_price = invoice_group['UnitPrice'].mean()
        max_item_price = invoice_group['UnitPrice'].max()
        total_quantity = invoice_group['Quantity'].sum()
        
        # Temporal features
        hour_of_day = invoice_group['hour_of_day'].iloc[0]
        day_of_week = invoice_group['day_of_week'].iloc[0]
        is_weekend = invoice_group['is_weekend'].iloc[0]
        month = invoice_group['month'].iloc[0]
        
        # Product features
        category_diversity = invoice_group['Description'].str[0].nunique() if 'Description' in invoice_group.columns else 1
        has_high_value_item = int(max_item_price > invoice_group['UnitPrice'].quantile(0.75))
        
        # Customer-level features (if CustomerID available)
        if 'CustomerID' in df.columns and not df['CustomerID'].isna().all():
            customer_invoices = df.groupby('CustomerID')['InvoiceNo'].nunique()
            customer_avg_spend = df.groupby('CustomerID')['basket_value'].mean()
            
            # Get customer stats for the current customer
            current_customer = invoice_group['CustomerID'].iloc[0] if 'CustomerID' in invoice_group.columns else None
            if current_customer and current_customer in customer_invoices.index:
                customer_frequency = customer_invoices[current_customer]
                customer_avg_spend_val = customer_avg_spend[current_customer]
                is_repeat_customer = int(customer_frequency > 1)
            else:
                customer_frequency = 1
                customer_avg_spend_val = invoice_group['basket_value'].sum()
                is_repeat_customer = 0
        else:
            # Default values if no customer data
            customer_frequency = 1
            customer_avg_spend_val = invoice_group['basket_value'].sum()
            is_repeat_customer = 0
        
        # Build feature dictionary (must match training feature order)
        features = {
            'total_items': int(total_items),
            'unique_items': int(unique_items),
            'avg_item_price': float(avg_item_price),
            'max_item_price': float(max_item_price),
            'total_quantity': int(total_quantity),
            'hour_of_day': int(hour_of_day),
            'day_of_week': int(day_of_week),
            'is_weekend': int(is_weekend),
            'month': int(month),
            'category_diversity': int(category_diversity),
            'has_high_value_item': int(has_high_value_item),
            'customer_frequency': int(customer_frequency),
            'customer_avg_spend': float(customer_avg_spend_val),
            'is_repeat_customer': int(is_repeat_customer),
        }
        
        return features
        
    except Exception as e:
        raise ValueError(f"Failed to extract features from CSV: {str(e)}")


def validate_features(features, expected_features):
    """
    Validate that extracted features match expected feature names.
    
    Args:
        features (dict): Extracted features
        expected_features (list): List of expected feature names
    
    Returns:
        bool: True if valid, raises ValueError otherwise
    """
    missing = set(expected_features) - set(features.keys())
    extra = set(features.keys()) - set(expected_features)
    
    if missing:
        raise ValueError(f"Missing features: {missing}")
    if extra:
        raise ValueError(f"Unexpected features: {extra}")
    
    return True


def extract_features_from_dataset(dataset_obj):
    """
    Extract features from a Dataset model object.
    
    Args:
        dataset_obj: Dataset model instance with file_path
    
    Returns:
        dict: Feature dictionary ready for model prediction
    """
    from pathlib import Path
    
    # Construct full path to CSV file
    csv_path = Path(dataset_obj.file_path)
    
    if not csv_path.exists():
        raise ValueError(f"Dataset file not found: {csv_path}")
    
    return extract_features_from_csv(str(csv_path))
