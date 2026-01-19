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
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={comparisonData.map(item => ({
                metric: item.metric,
                value: (item.current / item.current) * 100 // Normalized for display
              }))}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Current Health Status" dataKey="value" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthAnalytics;
