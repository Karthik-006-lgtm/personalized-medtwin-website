import numpy as np
from typing import Dict, List

class HealthPredictor:
    """
    Health prediction engine using rule-based logic and scoring system.
    In production, this would use trained ML models.
    """
    
    def __init__(self):
        # Normal ranges for health metrics
        self.normal_ranges = {
            'heartRate': (60, 100),
            'bloodPressureSystolic': (90, 120),
            'bloodPressureDiastolic': (60, 80),
            'oxygenSaturation': (95, 100),
            'temperature': (36.1, 37.2),
            'stressLevel': (1, 4),
            'bloodGlucose': (70, 140),
            'sleepHours': (7, 9)
        }
    
    def predict(self, metrics: Dict, user_profile: Dict) -> Dict:
        """Generate health predictions based on metrics and user profile"""
        
        # Calculate overall health score
        health_score = self._calculate_health_score(metrics, user_profile)
        
        # Determine risk level
        risk_level = self._determine_risk_level(health_score, metrics)
        
        # Generate insights
        insights = self._generate_insights(metrics, user_profile, health_score)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(metrics, user_profile)
        
        # Identify areas needing attention
        areas_needing_attention = self._identify_problem_areas(metrics)
        
        return {
            'overallHealthScore': round(health_score, 1),
            'riskLevel': risk_level,
            'insights': insights,
            'recommendations': recommendations,
            'areasNeedingAttention': areas_needing_attention
        }
    
    def _calculate_health_score(self, metrics: Dict, user_profile: Dict) -> float:
        """Calculate overall health score (0-100)"""
        scores = []
        weights = []
        
        # Heart rate score
        if metrics.get('heartRate'):
            hr = metrics['heartRate']
            min_hr, max_hr = self.normal_ranges['heartRate']
            if min_hr <= hr <= max_hr:
                scores.append(100)
            else:
                deviation = min(abs(hr - min_hr), abs(hr - max_hr))
                scores.append(max(0, 100 - deviation * 2))
            weights.append(1.5)
        
        # Blood pressure score
        if metrics.get('bloodPressureSystolic') and metrics.get('bloodPressureDiastolic'):
            sys = metrics['bloodPressureSystolic']
            dia = metrics['bloodPressureDiastolic']
            sys_min, sys_max = self.normal_ranges['bloodPressureSystolic']
            dia_min, dia_max = self.normal_ranges['bloodPressureDiastolic']
            
            sys_score = 100 if sys_min <= sys <= sys_max else max(0, 100 - abs(sys - 120))
            dia_score = 100 if dia_min <= dia <= dia_max else max(0, 100 - abs(dia - 80) * 2)
            scores.append((sys_score + dia_score) / 2)
            weights.append(2.0)
        
        # Oxygen saturation score
        if metrics.get('oxygenSaturation'):
            o2 = metrics['oxygenSaturation']
            if o2 >= 95:
                scores.append(100)
            else:
                scores.append(max(0, o2 * 1.05))
            weights.append(1.5)
        
        # Stress level score (inverse - lower is better)
        if metrics.get('stressLevel'):
            stress = metrics['stressLevel']
            scores.append(max(0, 100 - stress * 10))
            weights.append(1.0)
        
        # Sleep hours score
        if metrics.get('sleepHours'):
            sleep = metrics['sleepHours']
            if 7 <= sleep <= 9:
                scores.append(100)
            else:
                scores.append(max(0, 100 - abs(sleep - 8) * 10))
            weights.append(1.0)
        
        # Blood glucose score
        if metrics.get('bloodGlucose'):
            glucose = metrics['bloodGlucose']
            if 70 <= glucose <= 140:
                scores.append(100)
            else:
                deviation = min(abs(glucose - 70), abs(glucose - 140))
                scores.append(max(0, 100 - deviation * 0.5))
            weights.append(1.0)
        
        # Calculate weighted average
        if scores:
            weighted_score = sum(s * w for s, w in zip(scores, weights)) / sum(weights)
            return min(100, max(0, weighted_score))
        
        return 75.0  # Default score if no metrics
    
    def _determine_risk_level(self, health_score: float, metrics: Dict) -> str:
        """Determine risk level based on health score and critical metrics"""
        
        # Check for critical conditions
        critical_conditions = []
        
        if metrics.get('bloodPressureSystolic', 0) > 140:
            critical_conditions.append('high_bp')
        if metrics.get('oxygenSaturation', 100) < 90:
            critical_conditions.append('low_oxygen')
        if metrics.get('stressLevel', 0) > 8:
            critical_conditions.append('high_stress')
        
        if critical_conditions or health_score < 60:
            return 'High'
        elif health_score < 75:
            return 'Moderate'
        else:
            return 'Low'
    
    def _generate_insights(self, metrics: Dict, user_profile: Dict, health_score: float) -> List[str]:
        """Generate personalized health insights"""
        insights = []
        
        # Overall assessment
        if health_score >= 85:
            insights.append(f"Excellent health status with a score of {health_score:.1f}/100. Keep up the great work!")
        elif health_score >= 70:
            insights.append(f"Good health status with a score of {health_score:.1f}/100. Minor improvements recommended.")
        else:
            insights.append(f"Health score is {health_score:.1f}/100. Several areas need attention for improvement.")
        
        # Specific metric insights
        if metrics.get('heartRate'):
            hr = metrics['heartRate']
            if hr > 100:
                insights.append(f"Heart rate ({hr} bpm) is elevated. Consider stress management and regular exercise.")
            elif hr < 60:
                insights.append(f"Heart rate ({hr} bpm) is lower than average. This is normal for athletes, otherwise consult a doctor.")
        
        if metrics.get('bloodPressureSystolic'):
            sys = metrics['bloodPressureSystolic']
            if sys > 130:
                insights.append(f"Blood pressure ({sys} mmHg systolic) is elevated. Reduce sodium intake and manage stress.")
            elif sys < 90:
                insights.append("Blood pressure is on the lower side. Stay hydrated and monitor symptoms.")
        
        if metrics.get('stressLevel'):
            stress = metrics['stressLevel']
            if stress > 7:
                insights.append(f"High stress level detected ({stress}/10). Prioritize relaxation and mental health.")
        
        if metrics.get('sleepHours'):
            sleep = metrics['sleepHours']
            if sleep < 6:
                insights.append(f"Insufficient sleep ({sleep} hours). Aim for 7-9 hours for optimal health.")
            elif sleep > 10:
                insights.append(f"Excessive sleep ({sleep} hours) may indicate underlying issues.")
        
        # Age-related insights
        age = user_profile.get('age', 30)
        if age > 50 and metrics.get('bloodPressureSystolic', 0) > 120:
            insights.append("At your age, maintaining optimal blood pressure is crucial. Regular monitoring recommended.")
        
        return insights
    
    def _generate_recommendations(self, metrics: Dict, user_profile: Dict) -> List[str]:
        """Generate actionable health recommendations"""
        recommendations = []
        
        # Heart rate recommendations
        if metrics.get('heartRate', 0) > 100:
            recommendations.append("Practice deep breathing exercises for 10 minutes daily")
            recommendations.append("Consider cardiovascular exercise 3-4 times per week")
        
        # Blood pressure recommendations
        if metrics.get('bloodPressureSystolic', 0) > 130:
            recommendations.append("Reduce sodium intake to less than 2,300mg per day")
            recommendations.append("Increase potassium-rich foods (bananas, spinach)")
        
        # Stress recommendations
        if metrics.get('stressLevel', 0) > 6:
            recommendations.append("Practice mindfulness meditation for 15 minutes daily")
            recommendations.append("Engage in stress-reducing activities (yoga, walking)")
            recommendations.append("Consider speaking with a mental health professional")
        
        # Sleep recommendations
        if metrics.get('sleepHours', 8) < 7:
            recommendations.append("Establish a consistent sleep schedule")
            recommendations.append("Avoid screens 1 hour before bedtime")
            recommendations.append("Create a relaxing bedtime routine")
        
        # Activity recommendations
        exercise_freq = user_profile.get('exerciseFrequency', '')
        if exercise_freq in ['Rarely', 'Never', '']:
            recommendations.append("Start with 30 minutes of moderate exercise 3 times per week")
            recommendations.append("Consider walking, swimming, or cycling")
        
        # Weight management
        if user_profile.get('weight') and user_profile.get('height'):
            bmi = user_profile['weight'] / ((user_profile['height'] / 100) ** 2)
            if bmi > 25:
                recommendations.append("Work with a nutritionist to develop a healthy eating plan")
            elif bmi < 18.5:
                recommendations.append("Consult with a healthcare provider about healthy weight gain")
        
        return recommendations
    
    def _identify_problem_areas(self, metrics: Dict) -> List[str]:
        """Identify specific health areas needing attention"""
        problem_areas = []
        
        if metrics.get('heartRate'):
            hr = metrics['heartRate']
            if hr < 60 or hr > 100:
                problem_areas.append("Cardiovascular Health")
        
        if metrics.get('bloodPressureSystolic', 0) > 130 or metrics.get('bloodPressureDiastolic', 0) > 85:
            problem_areas.append("Blood Pressure Management")
        
        if metrics.get('stressLevel', 0) > 6:
            problem_areas.append("Stress Management")
        
        if metrics.get('sleepHours', 8) < 6 or metrics.get('sleepHours', 8) > 10:
            problem_areas.append("Sleep Quality")
        
        if metrics.get('oxygenSaturation', 100) < 95:
            problem_areas.append("Respiratory Function")
        
        if metrics.get('bloodGlucose'):
            glucose = metrics['bloodGlucose']
            if glucose > 140 or glucose < 70:
                problem_areas.append("Blood Sugar Regulation")
        
        if metrics.get('steps', 10000) < 3000:
            problem_areas.append("Physical Activity Level")
        
        return problem_areas if problem_areas else ["No major areas of concern"]
