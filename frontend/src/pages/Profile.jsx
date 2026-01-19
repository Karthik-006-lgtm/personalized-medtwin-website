import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  User, 
  Save, 
  Upload, 
  Camera,
  TrendingUp,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    age: '',
    gender: '',
    occupation: '',
    height: '',
    weight: '',
    bloodType: '',
    currentChronicConditions: [],
    pastChronicConditions: [],
    allergies: [],
    exerciseFrequency: '',
    alcoholConsumption: '',
    averageSleepHours: '',
    sleepIssues: '',
    dietType: '',
    mealsPerDay: ''
  });
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [progressData, setProgressData] = useState([]);

  const cartoonAvatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Lily',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie'
  ];

  useEffect(() => {
    if (user?.profile) {
      setProfileData({
        name: user.profile.name || '',
        age: user.profile.age || '',
        gender: user.profile.gender || '',
        occupation: user.profile.occupation || '',
        height: user.profile.height || '',
        weight: user.profile.weight || '',
        bloodType: user.profile.bloodType || '',
        currentChronicConditions: user.profile.currentChronicConditions || [],
        pastChronicConditions: user.profile.pastChronicConditions || [],
        allergies: user.profile.allergies || [],
        exerciseFrequency: user.profile.exerciseFrequency || '',
        alcoholConsumption: user.profile.alcoholConsumption || '',
        averageSleepHours: user.profile.averageSleepHours || '',
        sleepIssues: user.profile.sleepIssues || '',
        dietType: user.profile.dietType || '',
        mealsPerDay: user.profile.mealsPerDay || ''
      });
    }
    fetchProgressData();
  }, [user]);

  useEffect(() => {
    const isEditMode = searchParams.get('mode') === 'edit';
    const hasProfileData = !!(
      user?.profile?.name ||
      user?.profile?.age ||
      user?.profile?.gender ||
      user?.profile?.occupation ||
      user?.profile?.height ||
      user?.profile?.weight ||
      user?.profile?.bloodType ||
      (user?.profile?.currentChronicConditions || []).length ||
      (user?.profile?.pastChronicConditions || []).length ||
      (user?.profile?.allergies || []).length ||
      user?.profile?.exerciseFrequency ||
      user?.profile?.alcoholConsumption ||
      user?.profile?.averageSleepHours ||
      user?.profile?.sleepIssues ||
      user?.profile?.dietType ||
      user?.profile?.mealsPerDay
    );

    setIsEditing(isEditMode || !hasProfileData);
  }, [searchParams, user]);

  const fetchProgressData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/health/history?limit=10`);
      const data = response.data
        .filter(item => item.prediction?.overallHealthScore)
        .reverse()
        .map((item, index) => ({
          day: `Day ${index + 1}`,
          score: item.prediction.overallHealthScore
        }));
      setProgressData(data);
    } catch (error) {
      console.error('Failed to fetch progress data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMultiSelect = (name, value) => {
    setProfileData(prev => {
      const currentValues = prev[name] || [];
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [name]: currentValues.filter(v => v !== value)
        };
      } else {
        return {
          ...prev,
          [name]: [...currentValues, value]
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put(`${API_URL}/api/user/profile`, {
        profile: {
          ...profileData,
          age: profileData.age ? parseInt(profileData.age) : undefined,
          height: profileData.height ? parseFloat(profileData.height) : undefined,
          weight: profileData.weight ? parseFloat(profileData.weight) : undefined,
          averageSleepHours: profileData.averageSleepHours ? parseFloat(profileData.averageSleepHours) : undefined,
          mealsPerDay: profileData.mealsPerDay ? parseInt(profileData.mealsPerDay) : undefined
        }
      });

      updateUser(response.data.user);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      if (searchParams.get('mode') === 'edit') {
        navigate('/profile', { replace: true });
      }
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await axios.post(`${API_URL}/api/user/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const updatedUser = { ...user };
      updatedUser.profile.avatar = response.data.avatarUrl;
      updateUser(updatedUser);
      toast.success('Avatar uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload avatar');
    }
  };

  const handleCartoonSelect = async (avatarUrl) => {
    try {
      await axios.post(`${API_URL}/api/user/avatar/cartoon`, { avatarUrl });
      
      const updatedUser = { ...user };
      updatedUser.profile.avatar = avatarUrl;
      updateUser(updatedUser);
      setShowAvatarModal(false);
      toast.success('Avatar updated successfully!');
    } catch (error) {
      toast.error('Failed to update avatar');
    }
  };

  const occupationOptions = [
    '', 'Software Engineer', 'Driver', 'Teacher', 'Doctor', 'Nurse', 
    'Student', 'Chef', 'Sales Professional', 'Manager', 'Accountant', 
    'Construction Worker', 'Other'
  ];

  const chronicConditions = [
    'None', 'Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 
    'Arthritis', 'Thyroid Disorder', 'Other'
  ];
  const allergyOptions = [
    'None', 'Pollen', 'Dust', 'Peanuts', 'Dairy', 'Eggs', 'Seafood',
    'Gluten', 'Soy', 'Pet Dander', 'Latex', 'Other'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
              {user?.profile?.avatar ? (
                <img 
                  src={user.profile.avatar.startsWith('http') 
                    ? user.profile.avatar 
                    : `${API_URL}${user.profile.avatar}`
                  } 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={48} />
              )}
            </div>
            <button
              onClick={() => setShowAvatarModal(true)}
              className="absolute bottom-0 right-0 bg-white text-primary-600 p-2 rounded-full shadow-lg hover:bg-gray-100 transition-all"
            >
              <Camera size={16} />
            </button>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{user?.profile?.name || 'Your Profile'}</h1>
            <p className="text-primary-100">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Progress Graph */}
      {progressData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="text-primary-600" />
            Health Score Progress
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#0ea5e9" 
                  strokeWidth={2}
                  dot={{ fill: '#0ea5e9', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Activity className="text-primary-600" />
          Profile Information
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Name" name="name" value={profileData.name} onChange={handleChange} readOnly={!isEditing} />
              <InputField label="Age" name="age" type="number" value={profileData.age} onChange={handleChange} readOnly={!isEditing} />
              
              <SelectField 
                label="Gender" 
                name="gender" 
                value={profileData.gender} 
                onChange={handleChange}
                disabled={!isEditing}
                options={['', 'Male', 'Female', 'Other']}
              />
              
              <SelectField 
                label="Occupation" 
                name="occupation" 
                value={profileData.occupation} 
                onChange={handleChange}
                disabled={!isEditing}
                options={occupationOptions}
              />
            </div>
          </div>

          {/* Health Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Health Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Height (cm)" name="height" type="number" value={profileData.height} onChange={handleChange} readOnly={!isEditing} />
              <InputField label="Weight (kg)" name="weight" type="number" value={profileData.weight} onChange={handleChange} step="0.1" readOnly={!isEditing} />
              
              <SelectField 
                label="Blood Type" 
                name="bloodType" 
                value={profileData.bloodType} 
                onChange={handleChange}
                disabled={!isEditing}
                options={['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
              />
              
              <MultiSelectField
                label="Allergies"
                options={allergyOptions}
                selected={profileData.allergies}
                onToggle={(value) => handleMultiSelect('allergies', value)}
                disabled={!isEditing}
              />
            </div>

            {/* Multi-select for conditions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <MultiSelectField
                label="Current Chronic Conditions"
                options={chronicConditions}
                selected={profileData.currentChronicConditions}
                onToggle={(value) => handleMultiSelect('currentChronicConditions', value)}
                disabled={!isEditing}
              />
              
              <MultiSelectField
                label="Past Chronic Conditions"
                options={chronicConditions}
                selected={profileData.pastChronicConditions}
                onToggle={(value) => handleMultiSelect('pastChronicConditions', value)}
                disabled={!isEditing}
              />
            </div>
          </div>

          {/* Lifestyle Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Lifestyle Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField 
                label="Exercise Frequency" 
                name="exerciseFrequency" 
                value={profileData.exerciseFrequency} 
                onChange={handleChange}
                disabled={!isEditing}
                options={['', 'Daily', '3-5 times/week', '1-2 times/week', 'Rarely', 'Never']}
              />
              
              <SelectField 
                label="Alcohol Consumption" 
                name="alcoholConsumption" 
                value={profileData.alcoholConsumption} 
                onChange={handleChange}
                disabled={!isEditing}
                options={['', 'Never', 'Occasionally', 'Weekly', 'Daily']}
              />
            </div>
          </div>

          {/* Sleep Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Sleep Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField 
                label="Average Sleep Hours" 
                name="averageSleepHours" 
                type="number" 
                value={profileData.averageSleepHours} 
                onChange={handleChange} 
                step="0.5"
                readOnly={!isEditing}
              />
              
              <SelectField 
                label="Sleep Issues" 
                name="sleepIssues" 
                value={profileData.sleepIssues} 
                onChange={handleChange}
                disabled={!isEditing}
                options={['', 'None', 'Insomnia', 'Sleep Apnea', 'Restless Sleep', 'Other']}
              />
            </div>
          </div>

          {/* Diet Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Diet Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField 
                label="Diet Type" 
                name="dietType" 
                value={profileData.dietType} 
                onChange={handleChange}
                disabled={!isEditing}
                options={['', 'Vegetarian', 'Vegan', 'Non-Vegetarian', 'Pescatarian', 'Other']}
              />
              
              <InputField 
                label="Meals Per Day" 
                name="mealsPerDay" 
                type="number" 
                value={profileData.mealsPerDay} 
                onChange={handleChange}
                readOnly={!isEditing}
              />
            </div>
          </div>

          {/* Submit Button */}
          {isEditing && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Avatar Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Choose Avatar</h3>
            
            {/* Upload Option */}
            <div className="mb-6">
              <label className="block w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all">
                  <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-gray-600 font-medium">Upload Your Photo</p>
                  <p className="text-sm text-gray-400">JPG, PNG, GIF (Max 5MB)</p>
                </div>
              </label>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or choose a cartoon avatar</span>
              </div>
            </div>

            {/* Cartoon Avatars */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {cartoonAvatars.map((avatar, index) => (
                <button
                  key={index}
                  onClick={() => handleCartoonSelect(avatar)}
                  className="border-2 border-gray-200 rounded-lg p-2 hover:border-primary-500 hover:shadow-md transition-all"
                >
                  <img src={avatar} alt={`Avatar ${index + 1}`} className="w-full h-full" />
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAvatarModal(false)}
              className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const InputField = ({ label, readOnly = false, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      {...props}
      readOnly={readOnly}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
    />
  </div>
);

const SelectField = ({ label, options, disabled = false, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <select
      {...props}
      disabled={disabled}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
    >
      {options.map(option => (
        <option key={option} value={option}>{option || 'Select...'}</option>
      ))}
    </select>
  </div>
);

const MultiSelectField = ({ label, options, selected, onToggle, disabled = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
      <div className="space-y-2">
        {options.map(option => (
          <label key={option} className={`flex items-center gap-2 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onToggle(option)}
              disabled={disabled}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  </div>
);

export default Profile;
