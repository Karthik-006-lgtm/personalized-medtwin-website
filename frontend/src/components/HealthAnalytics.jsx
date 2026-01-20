import { useState } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle, 
  Activity,
  Award,
  UtensilsCrossed
} from 'lucide-react';

const HealthAnalytics = ({ prediction, currentMetrics, previousData, onViewNutrition }) => {
  const [activeChart, setActiveChart] = useState('comparison');

  // Prepare comparison data
  const comparisonData = [
    {
      metric: 'Heart Rate',
      previous: previousData?.metrics?.heartRate || 70,
      current: currentMetrics.heartRate || 70,
      unit: 'bpm'
    },
    {
      metric: 'BP Systolic',
      previous: previousData?.metrics?.bloodPressureSystolic || 120,
      current: currentMetrics.bloodPressureSystolic || 120,
      unit: 'mmHg'
    },
    {
      metric: 'SpO2',
      previous: previousData?.metrics?.oxygenSaturation || 98,
      current: currentMetrics.oxygenSaturation || 98,
      unit: '%'
    },
    {
      metric: 'Sleep',
      previous: previousData?.metrics?.sleepHours || 7,
      current: currentMetrics.sleepHours || 7,
      unit: 'hrs'
    },
    {
      metric: 'Stress',
      previous: previousData?.metrics?.stressLevel || 5,
      current: currentMetrics.stressLevel || 5,
      unit: '/10'
    }
  ].filter(item => item.current);

  // Health score visualization
  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      case 'Moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMetricAssessment = (metric, value) => {
    if (value == null) return { percent: 0, status: 'N/A', unit: '' };

    switch (metric) {
      case 'Heart Rate': {
        const unit = 'bpm';
        if (value >= 60 && value <= 100) return { percent: 100, status: 'Normal', unit };
        if ((value >= 50 && value < 60) || (value > 100 && value <= 110)) return { percent: 80, status: 'Borderline', unit };
        if ((value >= 40 && value < 50) || (value > 110 && value <= 120)) return { percent: 60, status: 'High/Low', unit };
        return { percent: 40, status: 'Critical', unit };
      }
      case 'BP Systolic': {
        const unit = 'mmHg';
        if (value >= 90 && value <= 119) return { percent: 100, status: 'Normal', unit };
        if (value >= 120 && value <= 129) return { percent: 80, status: 'Elevated', unit };
        if (value >= 130 && value <= 139) return { percent: 60, status: 'High (Stage 1)', unit };
        if (value >= 140) return { percent: 40, status: 'High (Stage 2)', unit };
        return { percent: 60, status: 'Low', unit };
      }
      case 'SpO2': {
        const unit = '%';
        if (value >= 95) return { percent: 100, status: 'Normal', unit };
        if (value >= 92) return { percent: 80, status: 'Borderline', unit };
        if (value >= 90) return { percent: 60, status: 'Low', unit };
        return { percent: 40, status: 'Critical', unit };
      }
      case 'Sleep': {
        const unit = 'hrs';
        if (value >= 7 && value <= 9) return { percent: 100, status: 'Normal', unit };
        if ((value >= 6 && value < 7) || (value > 9 && value <= 10)) return { percent: 80, status: 'Slightly Off', unit };
        if ((value >= 5 && value < 6) || (value > 10 && value <= 11)) return { percent: 60, status: 'Poor', unit };
        return { percent: 40, status: 'Very Poor', unit };
      }
      case 'Stress': {
        const unit = '/10';
        if (value >= 1 && value <= 3) return { percent: 100, status: 'Low', unit };
        if (value >= 4 && value <= 6) return { percent: 80, status: 'Moderate', unit };
        if (value >= 7 && value <= 8) return { percent: 60, status: 'High', unit };
        return { percent: 40, status: 'Severe', unit };
      }
      default:
        return { percent: 0, status: 'N/A', unit: '' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Health Score */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Health Analysis Results</h2>
          <div className={`px-4 py-2 rounded-full border-2 font-semibold ${getRiskColor(prediction.riskLevel)}`}>
            {prediction.riskLevel} Risk
          </div>
        </div>

        {/* Score Circle */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
          <div className="relative">
            <div className="w-48 h-48 rounded-full border-8 border-gray-200 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-5xl font-bold ${getScoreColor(prediction.overallHealthScore)}`}>
                  {prediction.overallHealthScore}
                </div>
                <div className="text-gray-500 font-medium">out of 100</div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Health Insights</h3>
            <div className="space-y-3">
              {prediction.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Activity className="text-primary-600 mt-1 flex-shrink-0" size={20} />
                  <p className="text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle className="text-blue-600" />
            Recommended Actions
          </h3>
          <ul className="space-y-2">
            {prediction.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas Needing Attention */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle className="text-amber-600" />
            Areas Needing Attention
          </h3>
          <div className="flex flex-wrap gap-2">
            {prediction.areasNeedingAttention.map((area, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-amber-100 text-amber-700 font-medium rounded-full"
              >
                {area}
              </span>
            ))}
          </div>
        </div>

        {/* Nutrition Button */}
        <div className="text-center">
          <button
            onClick={onViewNutrition}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-bold rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg"
          >
            <UtensilsCrossed size={24} />
            View AI Nutrition Recommendations
          </button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setActiveChart('comparison')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              activeChart === 'comparison'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Previous vs Current
          </button>
          <button
            onClick={() => setActiveChart('current')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              activeChart === 'current'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Current Status
          </button>
        </div>

        {activeChart === 'comparison' && (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="previous" fill="#94a3b8" name="Previous" />
                <Bar dataKey="current" fill="#0ea5e9" name="Current" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeChart === 'current' && (
          <div className="space-y-6">
            <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={comparisonData.map(item => ({
                metric: item.metric,
                value: getMetricAssessment(item.metric, item.current).percent
              }))}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Current Health Status" dataKey="value" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comparisonData.map((item) => {
                const assessment = getMetricAssessment(item.metric, item.current);
                return (
                  <div
                    key={item.metric}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">{item.metric}</h4>
                      <span className="text-sm font-semibold text-primary-700">{assessment.percent}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Value: {item.current} {assessment.unit}</span>
                      <span>Status: {assessment.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthAnalytics;
