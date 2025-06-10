#!/usr/bin/env python3
"""
iWORKZ AI Model Evaluation Framework
Comprehensive evaluation system for AI matching models
"""

import json
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Any, Optional
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MatchingModelEvaluator:
    """
    Comprehensive evaluation framework for job matching AI models
    """
    
    def __init__(self, config_path: str = None):
        """Initialize the evaluator with configuration"""
        self.config = self._load_config(config_path)
        self.metrics_history = []
        self.bias_detector = BiasDetector()
        
    def _load_config(self, config_path: str) -> Dict:
        """Load evaluation configuration"""
        default_config = {
            "evaluation_metrics": {
                "primary": ["accuracy", "precision", "recall", "f1_score"],
                "regression": ["mse", "mae", "r2_score"],
                "custom": ["cultural_fit_accuracy", "skill_match_accuracy"]
            },
            "bias_detection": {
                "protected_attributes": ["gender", "age", "nationality", "education"],
                "fairness_thresholds": {
                    "demographic_parity": 0.05,
                    "equal_opportunity": 0.05,
                    "equalized_odds": 0.05
                }
            },
            "performance_thresholds": {
                "minimum_accuracy": 0.80,
                "minimum_precision": 0.75,
                "minimum_recall": 0.70,
                "minimum_f1": 0.75
            }
        }
        
        if config_path:
            try:
                with open(config_path, 'r', encoding='utf-8') as f:
                    custom_config = json.load(f)
                default_config.update(custom_config)
            except FileNotFoundError:
                logger.warning(f"Config file not found: {config_path}. Using defaults.")
        
        return default_config
    
    def evaluate_matching_accuracy(self, 
                                 predictions: List[float], 
                                 ground_truth: List[float],
                                 threshold: float = 0.7) -> Dict[str, float]:
        """
        Evaluate matching score prediction accuracy
        
        Args:
            predictions: Predicted matching scores (0-1)
            ground_truth: Human-labeled matching scores (0-1)
            threshold: Threshold for binary classification
            
        Returns:
            Dictionary of evaluation metrics
        """
        # Convert to binary for classification metrics
        pred_binary = [1 if p >= threshold else 0 for p in predictions]
        true_binary = [1 if t >= threshold else 0 for t in ground_truth]
        
        # Classification metrics
        accuracy = accuracy_score(true_binary, pred_binary)
        precision = precision_score(true_binary, pred_binary, average='weighted')
        recall = recall_score(true_binary, pred_binary, average='weighted')
        f1 = f1_score(true_binary, pred_binary, average='weighted')
        
        # Regression metrics
        mse = mean_squared_error(ground_truth, predictions)
        mae = mean_absolute_error(ground_truth, predictions)
        r2 = r2_score(ground_truth, predictions)
        
        return {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'mse': mse,
            'mae': mae,
            'r2_score': r2,
            'threshold_used': threshold
        }
    
    def evaluate_skill_matching(self, 
                               skill_predictions: List[Dict],
                               skill_ground_truth: List[Dict]) -> Dict[str, float]:
        """
        Evaluate skill matching accuracy
        
        Args:
            skill_predictions: List of predicted skill matches
            skill_ground_truth: List of ground truth skill matches
            
        Returns:
            Skill matching evaluation metrics
        """
        skill_accuracies = []
        level_accuracies = []
        
        for pred, truth in zip(skill_predictions, skill_ground_truth):
            # Skill name accuracy
            pred_skills = set(pred.get('matched_skills', []))
            true_skills = set(truth.get('matched_skills', []))
            
            if true_skills:
                skill_acc = len(pred_skills.intersection(true_skills)) / len(true_skills.union(pred_skills))
                skill_accuracies.append(skill_acc)
            
            # Skill level accuracy
            for skill in true_skills.intersection(pred_skills):
                pred_level = pred.get('skill_levels', {}).get(skill)
                true_level = truth.get('skill_levels', {}).get(skill)
                
                if pred_level and true_level:
                    level_match = 1 if pred_level == true_level else 0
                    level_accuracies.append(level_match)
        
        return {
            'skill_name_accuracy': np.mean(skill_accuracies) if skill_accuracies else 0,
            'skill_level_accuracy': np.mean(level_accuracies) if level_accuracies else 0,
            'overall_skill_accuracy': np.mean(skill_accuracies + level_accuracies) if (skill_accuracies or level_accuracies) else 0
        }
    
    def evaluate_cultural_fit(self, 
                             cultural_predictions: List[float],
                             cultural_ground_truth: List[float],
                             cultural_features: List[Dict]) -> Dict[str, float]:
        """
        Evaluate cultural fit prediction accuracy
        
        Args:
            cultural_predictions: Predicted cultural fit scores
            cultural_ground_truth: Ground truth cultural fit scores
            cultural_features: Cultural feature data
            
        Returns:
            Cultural fit evaluation metrics
        """
        # Overall cultural fit accuracy
        mse = mean_squared_error(cultural_ground_truth, cultural_predictions)
        mae = mean_absolute_error(cultural_ground_truth, cultural_predictions)
        
        # Correlation analysis
        correlation = np.corrcoef(cultural_predictions, cultural_ground_truth)[0, 1]
        
        # Cultural dimension analysis
        dimension_accuracies = {}
        for feature in cultural_features:
            for dimension, value in feature.get('cultural_dimensions', {}).items():
                if dimension not in dimension_accuracies:
                    dimension_accuracies[dimension] = []
                # Simplified accuracy calculation
                dimension_accuracies[dimension].append(value.get('score', 0))
        
        dimension_scores = {
            dim: np.mean(scores) for dim, scores in dimension_accuracies.items()
        }
        
        return {
            'cultural_fit_mse': mse,
            'cultural_fit_mae': mae,
            'cultural_fit_correlation': correlation,
            'dimension_scores': dimension_scores
        }
    
    def evaluate_bias_and_fairness(self, 
                                  predictions: List[float],
                                  ground_truth: List[float],
                                  demographic_data: List[Dict]) -> Dict[str, Any]:
        """
        Evaluate model bias and fairness across demographic groups
        
        Args:
            predictions: Model predictions
            ground_truth: Ground truth labels
            demographic_data: Demographic information for each sample
            
        Returns:
            Bias evaluation results
        """
        return self.bias_detector.evaluate_bias(
            predictions, ground_truth, demographic_data
        )
    
    def comprehensive_evaluation(self, 
                               test_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run comprehensive evaluation on test data
        
        Args:
            test_data: Dictionary containing all test data and predictions
            
        Returns:
            Comprehensive evaluation results
        """
        results = {
            'timestamp': datetime.now().isoformat(),
            'test_set_size': len(test_data.get('predictions', [])),
            'evaluation_metrics': {}
        }
        
        # Basic matching accuracy
        if 'predictions' in test_data and 'ground_truth' in test_data:
            matching_results = self.evaluate_matching_accuracy(
                test_data['predictions'],
                test_data['ground_truth']
            )
            results['evaluation_metrics']['matching_accuracy'] = matching_results
        
        # Skill matching evaluation
        if 'skill_predictions' in test_data and 'skill_ground_truth' in test_data:
            skill_results = self.evaluate_skill_matching(
                test_data['skill_predictions'],
                test_data['skill_ground_truth']
            )
            results['evaluation_metrics']['skill_matching'] = skill_results
        
        # Cultural fit evaluation
        if 'cultural_predictions' in test_data and 'cultural_ground_truth' in test_data:
            cultural_results = self.evaluate_cultural_fit(
                test_data['cultural_predictions'],
                test_data['cultural_ground_truth'],
                test_data.get('cultural_features', [])
            )
            results['evaluation_metrics']['cultural_fit'] = cultural_results
        
        # Bias evaluation
        if 'demographic_data' in test_data:
            bias_results = self.evaluate_bias_and_fairness(
                test_data['predictions'],
                test_data['ground_truth'],
                test_data['demographic_data']
            )
            results['evaluation_metrics']['bias_analysis'] = bias_results
        
        # Performance assessment
        results['performance_assessment'] = self._assess_performance(results['evaluation_metrics'])
        
        # Store in history
        self.metrics_history.append(results)
        
        return results
    
    def _assess_performance(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Assess model performance against thresholds
        
        Args:
            metrics: Evaluation metrics
            
        Returns:
            Performance assessment results
        """
        assessment = {
            'meets_thresholds': {},
            'overall_status': 'unknown',
            'recommendations': []
        }
        
        thresholds = self.config['performance_thresholds']
        matching_metrics = metrics.get('matching_accuracy', {})
        
        # Check each threshold
        for metric, threshold in thresholds.items():
            metric_key = metric.replace('minimum_', '')
            actual_value = matching_metrics.get(metric_key, 0)
            meets_threshold = actual_value >= threshold
            
            assessment['meets_thresholds'][metric] = {
                'actual': actual_value,
                'threshold': threshold,
                'meets': meets_threshold
            }
            
            if not meets_threshold:
                assessment['recommendations'].append(
                    f"Improve {metric_key}: {actual_value:.3f} < {threshold:.3f}"
                )
        
        # Overall status
        all_meet = all(result['meets'] for result in assessment['meets_thresholds'].values())
        assessment['overall_status'] = 'pass' if all_meet else 'fail'
        
        return assessment
    
    def generate_report(self, results: Dict[str, Any], output_path: str = None) -> str:
        """
        Generate a comprehensive evaluation report
        
        Args:
            results: Evaluation results
            output_path: Path to save the report
            
        Returns:
            Report as string
        """
        report_lines = [
            "=" * 60,
            "iWORKZ AI Model Evaluation Report",
            "=" * 60,
            f"Evaluation Date: {results['timestamp']}",
            f"Test Set Size: {results['test_set_size']}",
            "",
            "PERFORMANCE SUMMARY",
            "-" * 30,
        ]
        
        # Matching accuracy summary
        matching_metrics = results['evaluation_metrics'].get('matching_accuracy', {})
        if matching_metrics:
            report_lines.extend([
                f"Overall Accuracy: {matching_metrics.get('accuracy', 0):.3f}",
                f"Precision: {matching_metrics.get('precision', 0):.3f}",
                f"Recall: {matching_metrics.get('recall', 0):.3f}",
                f"F1 Score: {matching_metrics.get('f1_score', 0):.3f}",
                f"R² Score: {matching_metrics.get('r2_score', 0):.3f}",
                ""
            ])
        
        # Skill matching summary
        skill_metrics = results['evaluation_metrics'].get('skill_matching', {})
        if skill_metrics:
            report_lines.extend([
                "SKILL MATCHING PERFORMANCE",
                "-" * 30,
                f"Skill Name Accuracy: {skill_metrics.get('skill_name_accuracy', 0):.3f}",
                f"Skill Level Accuracy: {skill_metrics.get('skill_level_accuracy', 0):.3f}",
                f"Overall Skill Accuracy: {skill_metrics.get('overall_skill_accuracy', 0):.3f}",
                ""
            ])
        
        # Cultural fit summary
        cultural_metrics = results['evaluation_metrics'].get('cultural_fit', {})
        if cultural_metrics:
            report_lines.extend([
                "CULTURAL FIT PERFORMANCE",
                "-" * 30,
                f"Cultural Fit MAE: {cultural_metrics.get('cultural_fit_mae', 0):.3f}",
                f"Cultural Fit Correlation: {cultural_metrics.get('cultural_fit_correlation', 0):.3f}",
                ""
            ])
        
        # Performance assessment
        assessment = results.get('performance_assessment', {})
        if assessment:
            report_lines.extend([
                "THRESHOLD ASSESSMENT",
                "-" * 30,
                f"Overall Status: {assessment.get('overall_status', 'unknown').upper()}",
                ""
            ])
            
            for metric, result in assessment.get('meets_thresholds', {}).items():
                status = "✓" if result['meets'] else "✗"
                report_lines.append(
                    f"{status} {metric}: {result['actual']:.3f} (threshold: {result['threshold']:.3f})"
                )
            
            recommendations = assessment.get('recommendations', [])
            if recommendations:
                report_lines.extend([
                    "",
                    "RECOMMENDATIONS",
                    "-" * 30
                ])
                for rec in recommendations:
                    report_lines.append(f"• {rec}")
        
        report = "\n".join(report_lines)
        
        if output_path:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(report)
            logger.info(f"Report saved to: {output_path}")
        
        return report
    
    def plot_performance_trends(self, save_path: str = None):
        """
        Plot performance trends over time
        
        Args:
            save_path: Path to save the plot
        """
        if len(self.metrics_history) < 2:
            logger.warning("Not enough historical data for trend analysis")
            return
        
        # Extract data for plotting
        timestamps = [result['timestamp'] for result in self.metrics_history]
        accuracies = [
            result['evaluation_metrics'].get('matching_accuracy', {}).get('accuracy', 0)
            for result in self.metrics_history
        ]
        
        plt.figure(figsize=(12, 6))
        plt.plot(timestamps, accuracies, marker='o', linewidth=2, markersize=6)
        plt.title('Model Performance Trends Over Time')
        plt.xlabel('Evaluation Date')
        plt.ylabel('Accuracy')
        plt.grid(True, alpha=0.3)
        plt.xticks(rotation=45)
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            logger.info(f"Performance trend plot saved to: {save_path}")
        
        plt.show()


class BiasDetector:
    """
    Detect and measure bias in AI matching models
    """
    
    def evaluate_bias(self, 
                     predictions: List[float],
                     ground_truth: List[float],
                     demographic_data: List[Dict]) -> Dict[str, Any]:
        """
        Evaluate bias across demographic groups
        
        Args:
            predictions: Model predictions
            ground_truth: Ground truth labels
            demographic_data: Demographic information
            
        Returns:
            Bias evaluation results
        """
        bias_results = {
            'demographic_parity': {},
            'equal_opportunity': {},
            'equalized_odds': {},
            'overall_bias_score': 0
        }
        
        # Convert to DataFrame for easier analysis
        df = pd.DataFrame({
            'prediction': predictions,
            'ground_truth': ground_truth,
            **{f'demo_{i}': demo for i, demo in enumerate(demographic_data)}
        })
        
        # Analyze bias for each protected attribute
        protected_attributes = ['gender', 'age_group', 'nationality', 'education_level']
        
        for attr in protected_attributes:
            if any(attr in demo for demo in demographic_data):
                bias_scores = self._calculate_bias_metrics(df, attr)
                bias_results['demographic_parity'][attr] = bias_scores['demographic_parity']
                bias_results['equal_opportunity'][attr] = bias_scores['equal_opportunity']
                bias_results['equalized_odds'][attr] = bias_scores['equalized_odds']
        
        # Calculate overall bias score
        all_scores = []
        for metric_type in ['demographic_parity', 'equal_opportunity', 'equalized_odds']:
            for attr_scores in bias_results[metric_type].values():
                all_scores.extend(attr_scores.values())
        
        bias_results['overall_bias_score'] = np.mean(all_scores) if all_scores else 0
        
        return bias_results
    
    def _calculate_bias_metrics(self, df: pd.DataFrame, attribute: str) -> Dict[str, Dict]:
        """
        Calculate bias metrics for a specific attribute
        
        Args:
            df: DataFrame with predictions and demographic data
            attribute: Protected attribute to analyze
            
        Returns:
            Bias metrics for the attribute
        """
        # Placeholder implementation
        # In practice, this would implement statistical parity, equal opportunity, etc.
        
        # Extract attribute values from demographic data
        attr_values = []
        for _, row in df.iterrows():
            demo_cols = [col for col in df.columns if col.startswith('demo_')]
            for col in demo_cols:
                demo_data = row[col]
                if isinstance(demo_data, dict) and attribute in demo_data:
                    attr_values.append(demo_data[attribute])
                    break
            else:
                attr_values.append('unknown')
        
        df[attribute] = attr_values
        
        # Calculate metrics by group
        metrics = {
            'demographic_parity': {},
            'equal_opportunity': {},
            'equalized_odds': {}
        }
        
        groups = df[attribute].unique()
        for group in groups:
            group_df = df[df[attribute] == group]
            if len(group_df) > 0:
                # Simplified bias calculation
                group_positive_rate = (group_df['prediction'] > 0.5).mean()
                overall_positive_rate = (df['prediction'] > 0.5).mean()
                
                metrics['demographic_parity'][group] = abs(group_positive_rate - overall_positive_rate)
                metrics['equal_opportunity'][group] = group_positive_rate  # Simplified
                metrics['equalized_odds'][group] = group_positive_rate  # Simplified
        
        return metrics


def run_evaluation_example():
    """
    Example usage of the evaluation framework
    """
    # Initialize evaluator
    evaluator = MatchingModelEvaluator()
    
    # Sample test data
    test_data = {
        'predictions': [0.85, 0.72, 0.91, 0.68, 0.77],
        'ground_truth': [0.88, 0.70, 0.89, 0.65, 0.80],
        'skill_predictions': [
            {'matched_skills': ['React', 'JavaScript'], 'skill_levels': {'React': 'advanced'}},
            {'matched_skills': ['Python', 'Django'], 'skill_levels': {'Python': 'intermediate'}}
        ],
        'skill_ground_truth': [
            {'matched_skills': ['React', 'JavaScript'], 'skill_levels': {'React': 'advanced'}},
            {'matched_skills': ['Python', 'Flask'], 'skill_levels': {'Python': 'intermediate'}}
        ],
        'cultural_predictions': [0.82, 0.75, 0.88, 0.71, 0.79],
        'cultural_ground_truth': [0.85, 0.73, 0.86, 0.69, 0.81],
        'cultural_features': [
            {'cultural_dimensions': {'individualism_vs_collectivism': {'score': 0.3}}}
        ],
        'demographic_data': [
            {'gender': 'female', 'age_group': '25-35', 'nationality': 'japanese'},
            {'gender': 'male', 'age_group': '35-45', 'nationality': 'american'}
        ]
    }
    
    # Run evaluation
    results = evaluator.comprehensive_evaluation(test_data)
    
    # Generate report
    report = evaluator.generate_report(results)
    print(report)
    
    return results


if __name__ == "__main__":
    # Run example evaluation
    results = run_evaluation_example()
    
    # Save results
    with open('evaluation_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print("\nEvaluation completed successfully!")