"""
Realistic Data Generator

Generates test datasets that match training data distribution.
Uses training_profile.json to ensure realistic feature values.
"""

import pandas as pd
import numpy as np
import json
from pathlib import Path
from datetime import datetime, timedelta


class DataGenerator:
    """Generate realistic retail transaction data."""
    
    def __init__(self, training_profile_path=None):
        """
        Initialize data generator with training profile.
        
        Args:
            training_profile_path: Path to training_profile.json
        """
        if training_profile_path is None:
            training_profile_path = Path(__file__).parent / 'training_profile.json'
        
        with open(training_profile_path, 'r') as f:
            self.profile = json.load(f)
        
        self.feature_stats = self.profile['feature_stats']
    
    def generate_dataset(self, n_invoices=100, output_path=None):
        """
        Generate realistic retail dataset.
        
        Args:
            n_invoices: Number of invoices to generate
            output_path: Path to save CSV file
        
        Returns:
            DataFrame: Generated dataset
        """
        
        print(f"Generating {n_invoices} invoices...")
        
        transactions = []
        base_date = datetime(2010, 12, 1, 8, 0, 0)
        
        for i in range(n_invoices):
            # Generate invoice-level features based on training distribution
            stats = self.feature_stats
            
            # Sample from realistic distributions
            total_items = int(np.random.gamma(
                shape=2.0,
                scale=stats['total_items']['mean'] / 2.0
            ))
            total_items = max(1, min(total_items, int(stats['total_items']['q95'])))
            
            unique_items = min(total_items, int(np.random.gamma(
                shape=2.0,
                scale=stats['unique_items']['mean'] / 2.0
            )))
            unique_items = max(1, unique_items)
            
            # Generate items for this invoice
            invoice_no = f"INV{536365 + i}"
            customer_id = 17850 + (i % 1000)  # Simulate repeat customers
            
            # Sample hour and day
            hour = int(np.clip(
                np.random.normal(stats['hour_of_day']['mean'], stats['hour_of_day']['std']),
                0, 23
            ))
            day_offset = np.random.randint(0, 365)
            invoice_date = base_date + timedelta(days=day_offset, hours=hour)
            
            # Generate items
            for j in range(total_items):
                # Sample unit price from realistic distribution
                unit_price = np.random.gamma(
                    shape=1.5,
                    scale=stats['avg_item_price']['mean'] / 1.5
                )
                unit_price = max(0.1, min(unit_price, stats['max_item_price']['q95']))
                
                # Sample quantity
                quantity = int(np.random.gamma(shape=2.0, scale=3.0))
                quantity = max(1, min(quantity, 50))
                
                # Generate stock code
                if j < unique_items:
                    stock_code = f"SKU{85000 + j + (i * 10)}"
                else:
                    # Repeat some items
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
        
        print(f"✅ Generated {len(df)} transactions across {n_invoices} invoices")
        print(f"   Avg items per invoice: {len(df) / n_invoices:.1f}")
        print(f"   Avg unit price: £{df['UnitPrice'].mean():.2f}")
        print(f"   Avg quantity: {df['Quantity'].mean():.1f}")
        
        if output_path:
            df.to_csv(output_path, index=False)
            print(f"✅ Saved to: {output_path}")
        
        return df
    
    def generate_high_confidence_dataset(self, n_invoices=50, output_path=None):
        """
        Generate dataset that should produce high confidence predictions.
        Features are centered around training mean.
        """
        print(f"Generating HIGH CONFIDENCE dataset ({n_invoices} invoices)...")
        
        transactions = []
        base_date = datetime(2010, 12, 1, 10, 0, 0)
        stats = self.feature_stats
        
        for i in range(n_invoices):
            # Use mean values with small variation
            total_items = int(np.random.normal(stats['total_items']['mean'], stats['total_items']['std'] * 0.3))
            total_items = max(1, total_items)
            
            unique_items = int(np.random.normal(stats['unique_items']['mean'], stats['unique_items']['std'] * 0.3))
            unique_items = max(1, min(unique_items, total_items))
            
            invoice_no = f"HC{536365 + i}"
            customer_id = 17850 + (i % 100)
            
            hour = int(np.random.normal(stats['hour_of_day']['mean'], 2))
            hour = max(0, min(hour, 23))
            invoice_date = base_date + timedelta(days=i, hours=hour)
            
            for j in range(total_items):
                unit_price = np.random.normal(stats['avg_item_price']['mean'], stats['avg_item_price']['std'] * 0.3)
                unit_price = max(0.5, unit_price)
                
                quantity = int(np.random.normal(6, 2))
                quantity = max(1, quantity)
                
                stock_code = f"SKU{85000 + (j % unique_items) + (i * 10)}"
                
                transactions.append({
                    'InvoiceNo': invoice_no,
                    'StockCode': stock_code,
                    'Description': f"Product {stock_code}",
                    'Quantity': quantity,
                    'InvoiceDate': invoice_date.strftime('%Y-%m-%d %H:%M:%S'),
                    'UnitPrice': round(unit_price, 2),
                    'CustomerID': customer_id,
                    'Country': 'United Kingdom'
                })
        
        df = pd.DataFrame(transactions)
        
        if output_path:
            df.to_csv(output_path, index=False)
            print(f"✅ Saved HIGH CONFIDENCE dataset to: {output_path}")
        
        return df
    
    def generate_outlier_dataset(self, n_invoices=10, output_path=None):
        """
        Generate dataset with outliers (should trigger low confidence).
        Features are far from training distribution.
        """
        print(f"Generating OUTLIER dataset ({n_invoices} invoices)...")
        
        transactions = []
        base_date = datetime(2010, 12, 1, 2, 0, 0)  # Unusual hour
        stats = self.feature_stats
        
        for i in range(n_invoices):
            # Extreme values
            total_items = int(stats['total_items']['q99'] * 1.5)  # Way above normal
            unique_items = total_items  # All unique (unusual)
            
            invoice_no = f"OUT{536365 + i}"
            customer_id = 99999 + i  # New customers
            
            hour = 2  # Unusual hour
            invoice_date = base_date + timedelta(days=i, hours=hour)
            
            for j in range(total_items):
                unit_price = stats['max_item_price']['q99'] * 2  # Very expensive
                quantity = 100  # Very large quantity
                
                stock_code = f"RARE{85000 + j}"
                
                transactions.append({
                    'InvoiceNo': invoice_no,
                    'StockCode': stock_code,
                    'Description': f"Rare Product {stock_code}",
                    'Quantity': quantity,
                    'InvoiceDate': invoice_date.strftime('%Y-%m-%d %H:%M:%S'),
                    'UnitPrice': round(unit_price, 2),
                    'CustomerID': customer_id,
                    'Country': 'United Kingdom'
                })
        
        df = pd.DataFrame(transactions)
        
        if output_path:
            df.to_csv(output_path, index=False)
            print(f"✅ Saved OUTLIER dataset to: {output_path}")
        
        return df


def main():
    """Generate test datasets."""
    generator = DataGenerator()
    
    output_dir = Path(__file__).parent.parent / 'Data'
    output_dir.mkdir(exist_ok=True)
    
    # Generate normal dataset
    generator.generate_dataset(
        n_invoices=100,
        output_path=output_dir / 'test_normal.csv'
    )
    
    # Generate high confidence dataset
    generator.generate_high_confidence_dataset(
        n_invoices=50,
        output_path=output_dir / 'test_high_confidence.csv'
    )
    
    # Generate outlier dataset
    generator.generate_outlier_dataset(
        n_invoices=10,
        output_path=output_dir / 'test_outliers.csv'
    )
    
    print("\n✅ All test datasets generated!")


if __name__ == '__main__':
    main()
