import { useState } from 'react';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';

const ManualEntryForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    heartRate: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    oxygenSaturation: '',
    temperature: '',
    steps: '',
    caloriesBurned: '',
    sleepHours: '',
    stressLevel: '',
    bloodGlucose: '',
    weight: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Convert string values to numbers
    const metrics = {};
    Object.keys(formData).forEach(key => {
      if (formData[key] !== '') {
        metrics[key] = parseFloat(formData[key]);
      }
    });

    // Validate at least some data is entered
    if (Object.keys(metrics).length === 0) {
      toast.error('Please enter at least one health metric');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        dataSource: 'manual',
        deviceId: null,
        metrics
      });
      
      // Reset form
      setFormData({
        heartRate: '',
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        oxygenSaturation: '',
        temperature: '',
        steps: '',
        caloriesBurned: '',
        sleepHours: '',
        stressLevel: '',
        bloodGlucose: '',
        weight: ''
      });
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const fields = [
    { name: 'heartRate', label: 'Heart Rate', unit: 'bpm', placeholder: '72', type: 'number', min: 40, max: 200 },
    { name: 'bloodPressureSystolic', label: 'Blood Pressure (Systolic)', unit: 'mmHg', placeholder: '120', type: 'number', min: 70, max: 200 },
    { name: 'bloodPressureDiastolic', label: 'Blood Pressure (Diastolic)', unit: 'mmHg', placeholder: '80', type: 'number', min: 40, max: 130 },
    { name: 'oxygenSaturation', label: 'Oxygen Saturation (SpO2)', unit: '%', placeholder: '98', type: 'number', min: 70, max: 100 },
    { name: 'temperature', label: 'Body Temperature', unit: '°C', placeholder: '37.0', type: 'number', min: 35, max: 42, step: '0.1' },
    { name: 'steps', label: 'Steps Today', unit: 'steps', placeholder: '5000', type: 'number', min: 0 },
    { name: 'caloriesBurned', label: 'Calories Burned', unit: 'kcal', placeholder: '2000', type: 'number', min: 0 },
    { name: 'sleepHours', label: 'Sleep Duration', unit: 'hours', placeholder: '7.5', type: 'number', min: 0, max: 24, step: '0.5' },
    { name: 'stressLevel', label: 'Stress Level', unit: '(1-10)', placeholder: '5', type: 'number', min: 1, max: 10 },
    { name: 'bloodGlucose', label: 'Blood Glucose', unit: 'mg/dL', placeholder: '100', type: 'number', min: 50, max: 400 },
    { name: 'weight', label: 'Weight', unit: 'kg', placeholder: '70', type: 'number', min: 30, max: 300, step: '0.1' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fields.map(field => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} <span className="text-gray-400 text-xs">{field.unit}</span>
            </label>
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              step={field.step || '1'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Save size={20} />
              Save Health Data
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ManualEntryForm;
