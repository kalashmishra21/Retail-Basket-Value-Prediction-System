"""
Confidence Calculator - Scientific Approach

Calculates prediction confidence based on:
1. Prediction interval width (model uncertainty)
2. Feature distance from training distribution (data similarity)

NO arbitrary thresholds - uses actual training statistics.
"""

import numpy as np
import json
from pathlib import Path


class ConfidenceCalculator:
    """
    Calculate prediction confidence using training data statistics.
    """
    
    def __init__(self, training_profile_path=None):
        """
        Initialize confidence calculator with training profile.
        
        Args:
            training_profile_path: Path to training_profile.json
        """
        if training_profile_path is None:
            training_profile_path = Path(__file__).parent / 'training_profile.json'
        
        with open(training_profile_path, 'r') as f:
            self.profile = json.load(f)
        
        self.feature_stats = self.profile['feature_stats']
        self.feature_names = self.profile['feature_names']
    
    def calculate_confidence(self, features_dict, pred_main, pred_lower, pred_upper):
        """
        Calculate confidence score based on prediction uncertainty and feature distribution.
        
        Args:
            features_dict: Dictionary of input features
            pred_main: Main prediction value
            pred_lower: Lower bound prediction
            pred_upper: Upper bound prediction
        
        Returns:
            dict: {
                'confidence': float (0-100),
                'confidence_factors': dict with breakdown,
                'warnings': list of warning messages
            }
        """
        
        # Factor 1: Prediction Interval Width (Model Uncertainty)
        # Narrower interval = higher confidence
        interval_width = pred_upper - pred_lower
        cv = (interval_width / 2) / abs(pred_main) if pred_main != 0 else 1.0
        
        # Convert CV to confidence component (0-100)
        # Based on quantile regression uncertainty
        if cv < 0.10:
            interval_confidence = 95.0
        elif cv < 0.15:
            interval_confidence = 90.0
        elif cv < 0.20:
            interval_confidence = 85.0
        elif cv < 0.25:
            interval_confidence = 80.0
        elif cv < 0.30:
            interval_confidence = 75.0
        elif cv < 0.40:
            interval_confidence = 70.0
        elif cv < 0.50:
            interval_confidence = 65.0
        else:
            interval_confidence = 60.0
        
        # Factor 2: Feature Distance from Training Distribution
        # Features closer to training mean = higher confidence
        feature_distances = []
        outlier_features = []
        
        for feature_name in self.feature_names:
            if feature_name not in features_dict:
                continue
            
            value = features_dict[feature_name]
            stats = self.feature_stats[feature_name]
            
            # Calculate z-score (standardized distance from mean)
            mean = stats['mean']
            std = stats['std']
            
            if std > 0:
                z_score = abs((value - mean) / std)
            else:
                z_score = 0.0
            
            feature_distances.append(z_score)
            
            # Flag if feature is outlier (beyond 3 sigma)
            if z_score > 3.0:
                outlier_features.append({
                    'feature': feature_name,
                    'value': value,
                    'z_score': round(z_score, 2),
                    'expected_range': f"{stats['min']:.2f} - {stats['max']:.2f}"
                })
        
        # Calculate average feature distance
        avg_z_score = np.mean(feature_distances) if feature_distances else 0.0
        
        # Convert average z-score to confidence component (0-100)
        # z < 1: within 1 std (68% of data) → high confidence
        # z < 2: within 2 std (95% of data) → medium confidence
        # z < 3: within 3 std (99.7% of data) → low confidence
        # z >= 3: beyond 3 std → very low confidence
        if avg_z_score < 0.5:
            distribution_confidence = 95.0
        elif avg_z_score < 1.0:
            distribution_confidence = 90.0
        elif avg_z_score < 1.5:
            distribution_confidence = 85.0
        elif avg_z_score < 2.0:
            distribution_confidence = 80.0
        elif avg_z_score < 2.5:
            distribution_confidence = 75.0
        elif avg_z_score < 3.0:
            distribution_confidence = 70.0
        else:
            distribution_confidence = 60.0
        
        # Combined confidence (weighted average)
        # 60% weight on interval, 40% weight on distribution
        final_confidence = (0.6 * interval_confidence) + (0.4 * distribution_confidence)
        
        # Generate warnings
        warnings = []
        if final_confidence < 70:
            warnings.append("Low confidence prediction")
        if len(outlier_features) >= 3:
            warnings.append(f"{len(outlier_features)} features outside normal range")
        if cv > 0.50:
            warnings.append("High prediction uncertainty")
        
        return {
            'confidence': round(final_confidence, 2),
            'confidence_factors': {
                'interval_confidence': round(interval_confidence, 2),
                'distribution_confidence': round(distribution_confidence, 2),
                'cv': round(cv, 4),
                'avg_z_score': round(avg_z_score, 2),
                'outlier_features_count': len(outlier_features),
            },
            'outlier_features': outlier_features,
            'warnings': warnings
        }
    
    def is_outlier(self, features_dict, confidence_result):
        """
        Determine if prediction is an outlier based on multiple criteria.
        
        Args:
            features_dict: Dictionary of input features
            confidence_result: Result from calculate_confidence()
        
        Returns:
            dict: {
                'is_outlier': bool,
                'outlier_score': float (0-100),
                'outlier_reasons': list of reasons
            }
        """
        
        outlier_reasons = []
        outlier_score = 0.0
        
        # Criterion 1: Multiple features are outliers (z-score > 3)
        outlier_features = confidence_result['outlier_features']
        if len(outlier_features) >= 3:
            outlier_score += 40.0
            outlier_reasons.append(f"{len(outlier_features)} features beyond 3-sigma")
        
        # Criterion 2: Very high prediction uncertainty (CV > 50%)
        cv = confidence_result['confidence_factors']['cv']
        if cv > 0.50:
            outlier_score += 30.0
            outlier_reasons.append(f"High uncertainty (CV={cv:.2%})")
        
        # Criterion 3: Very low confidence (< 60%)
        confidence = confidence_result['confidence']
        if confidence < 60:
            outlier_score += 30.0
            outlier_reasons.append(f"Low confidence ({confidence:.1f}%)")
        
        # Determine if outlier
        is_outlier = outlier_score >= 60.0  # Need at least 2 criteria
        
        return {
            'is_outlier': is_outlier,
            'outlier_score': round(min(outlier_score, 100.0), 2),
            'outlier_reasons': outlier_reasons
        }


# Global instance
_confidence_calculator = None

def get_confidence_calculator():
    """Get or create global confidence calculator instance."""
    global _confidence_calculator
    if _confidence_calculator is None:
        _confidence_calculator = ConfidenceCalculator()
    return _confidence_calculator
