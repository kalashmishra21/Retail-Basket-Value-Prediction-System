"""
Simple Test Data Generator (No Dependencies on Backend)

Generates 3 test datasets with different characteristics:
1. test_normal.csv - Normal retail data (100 invoices)
2. test_high_value.csv - High value transactions (50 invoices)
3. test_low_value.csv - Low value transactions (50 invoices)
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta


def generate_dataset(n_invoices, base_price_multiplier=1.0, output_path=None):
    """Generate realistic retail dataset."""
    
    print(f"Generating {n_invoices} invoices (price multiplier: {base_price_multiplier}x)...")
    
    transactions = []
    base_date = datetime(2010, 12, 1, 8, 0, 0)
    
    for i in range(n_invoices):
        # Generate invoice-level features
        total_items = int(np.random.gamma(shape=2.0, scale=10))
        total_items = max(1, min(total_items, 100))
        
        unique_items = min(total_items, int(np.random.gamma(shape=2.0, scale=8)))
        unique_items = max(1, unique_items)
        
        # Generate invoice details
        invoice_no = f"INV{536365 + i}"
        customer_id = 17850 + (i % 1000)
        
        # Sample hour and day
        hour = int(np.clip(np.random.normal(12, 3), 0, 23))
        day_offset = np.random.randint(0, 365)
        invoice_date = base_date + timedelta(days=day_offset, hours=hour)
        
        # Generate items
        for j in range(total_items):
            # Sample unit price with multiplier
            unit_price = np.random.gamma(shape=1.5, scale=3.5) * base_price_multiplier
            unit_price = max(0.5, min(unit_price, 100))
            
            # Sample quantity
            quantity = int(np.random.gamma(shape=2.0, scale=3.0))
            quantity = max(1, min(quantity, 50))
            
            # Generate stock code
            if j < unique_items:
                stock_code = f"SKU{85000 + j + (i * 10)}"
            else:
                stock_code = f"SKU{85000 + (j % unique_items) + (i * 10)}"
            
            description = f"Product {stock_code}"
            country = "United Kingdom"
            
            transactions.append({
                'InvoiceNo': invoice_no,
                'StockCode': stock_code,
                'Description': description,
                'Quantity': quantity,
                'InvoiceDate': invoice_date.strftime('%Y-%m-%d %H:%M:%S'),
                'UnitPrice': round(unit_price, 2),
                'CustomerID': customer_id,
                'Country': country
            })
    
    df = pd.DataFrame(transactions)
    
    # Calculate stats
    df['basket_value'] = df['Quantity'] * df['UnitPrice']
    invoice_totals = df.groupby('InvoiceNo')['basket_value'].sum()
    
    print(f"✅ Generated {len(df)} transactions across {n_invoices} invoices")
    print(f"   Avg items per invoice: {len(df) / n_invoices:.1f}")
    print(f"   Avg unit price: £{df['UnitPrice'].mean():.2f}")
    print(f"   Avg basket value: £{invoice_totals.mean():.2f}")
    print(f"   Basket value range: £{invoice_totals.min():.2f} - £{invoice_totals.max():.2f}")
    
    if output_path:
        df.to_csv(output_path, index=False)
        print(f"✅ Saved to: {output_path}")
    
    return df


def main():
    """Generate 3 test datasets."""
    
    print("="*80)
    print("GENERATING TEST DATASETS")
    print("="*80)
    
    # Dataset 1: Normal retail data
    print("\n[1/3] Normal Dataset")
    generate_dataset(
        n_invoices=100,
        base_price_multiplier=1.0,
        output_path='Data/test_normal.csv'
    )
    
    # Dataset 2: High value transactions
    print("\n[2/3] High Value Dataset")
    generate_dataset(
        n_invoices=50,
        base_price_multiplier=2.5,
        output_path='Data/test_high_value.csv'
    )
    
    # Dataset 3: Low value transactions
    print("\n[3/3] Low Value Dataset")
    generate_dataset(
        n_invoices=50,
        base_price_multiplier=0.5,
        output_path='Data/test_low_value.csv'
    )
    
    print("\n" + "="*80)
    print("✅ ALL TEST DATASETS GENERATED!")
    print("="*80)
    print("\nGenerated files:")
    print("  1. Data/test_normal.csv (100 invoices)")
    print("  2. Data/test_high_value.csv (50 invoices)")
    print("  3. Data/test_low_value.csv (50 invoices)")
    print("\nUpload these 3 files to see proper R² metrics!")


if __name__ == '__main__':
    main()
