import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Activity, 
  Plus, 
  Smartphone, 
  TrendingUp,
  Heart,
  Droplets as DropletIcon,
  Thermometer,
  Wind,
  Moon,
  Zap
} from 'lucide-react';
import ManualEntryForm from '../components/ManualEntryForm';
import DeviceSync from '../components/DeviceSync';
import HealthAnalytics from '../components/HealthAnalytics';
import NutritionRecommendations from '../components/NutritionRecommendations';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'device'
  const [healthData, setHealthData] = useState(null);
  const [latestData, setLatestData] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchLatestData();
    fetchStats();
  }, []);

  const fetchLatestData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/health/latest`);
      setLatestData(response.data);
    } catch (error) {
      console.error('Failed to fetch latest data:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/health/stats?days=7`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleDataSubmit = async (data) => {
    try {
      const response = await axios.post(`${API_URL}/api/health/data`, data);
      setHealthData(response.data.data);
      toast.success('Health data saved successfully!');
      return response.data.data;
    } catch (error) {
      toast.error('Failed to save health data');
      throw error;
    }
  };

  const handlePredict = async () => {
    if (!healthData) {
      toast.error('Please submit health data first!');
      return;
    }

    setPredicting(true);
    try {
      const response = await axios.post(`${API_URL}/api/predictions/predict`, {
        healthDataId: healthData._id
      });
      
      setHealthData(response.data.healthData);
      setShowAnalytics(true);
      toast.success('Analysis complete! View your health insights below.');
      
      // Refresh stats
      fetchStats();
    } catch (error) {
      toast.error('Prediction failed. Please try again.');
      console.error('Prediction error:', error);
    } finally {
      setPredicting(false);
    }
  };

  const handleViewNutrition = async () => {
    setShowNutrition(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-10 h-10" />
          <div>
            <h1 className="text-3xl font-bold">Health Dashboard</h1>
            <p className="text-primary-100">Monitor and analyze your health metrics</p>
          </div>
        </div>

        {/* Quick Stats */}
        {stats && stats.averages && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <StatCard icon={Heart} label="Avg Heart Rate" value={`${Math.round(stats.averages.heartRate || 0)} bpm`} />
            <StatCard icon={DropletIcon} label="Avg SpO2" value={`${Math.round(stats.averages.oxygenSaturation || 0)}%`} />
            <StatCard icon={Moon} label="Avg Sleep" value={`${(stats.averages.sleepHours || 0).toFixed(1)} hrs`} />
            <StatCard icon={Zap} label="Avg Stress" value={`${Math.round(stats.averages.stressLevel || 0)}/10`} />
          </div>
        )}
      </div>

      {/* Data Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Input Health Data</h2>

        {/* Tab Selector */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'manual'
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Plus size={20} />
            Manual Entry
          </button>
          <button
            onClick={() => setActiveTab('device')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'device'
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Smartphone size={20} />
            Device Sync
          </button>
        </div>

        {/* Form Content */}
        <div className="mt-6">
          {activeTab === 'manual' ? (
            <ManualEntryForm onSubmit={handleDataSubmit} />
          ) : (
            <DeviceSync onSubmit={handleDataSubmit} />
          )}
        </div>

        {/* Predict Button */}
        {healthData && !showAnalytics && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handlePredict}
              disabled={predicting}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {predicting ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp size={24} />
                  Predict & Analyze Health Status
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Analytics Section */}
      {showAnalytics && healthData?.prediction && (
        <HealthAnalytics 
          prediction={healthData.prediction} 
          currentMetrics={healthData.metrics}
          previousData={latestData}
          onViewNutrition={handleViewNutrition}
        />
      )}

      {/* Nutrition Recommendations */}
      {showNutrition && (
        <NutritionRecommendations onClose={() => setShowNutrition(false)} />
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
    <div className="flex items-center gap-2 mb-2">
      <Icon size={20} className="text-primary-100" />
      <p className="text-sm text-primary-100">{label}</p>
    </div>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default Dashboard;
