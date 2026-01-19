import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Smartphone, 
  Search, 
  Check, 
  X, 
  Wifi,
  Battery,
  RefreshCw,
  Link as LinkIcon
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DeviceSync = ({ onSubmit }) => {
  const [scanning, setScanning] = useState(false);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [pairing, setPairing] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchConnectedDevices();
  }, []);

  const fetchConnectedDevices = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/devices/connected`);
      setConnectedDevices(response.data.devices);
    } catch (error) {
      console.error('Failed to fetch connected devices:', error);
    }
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      const response = await axios.get(`${API_URL}/api/devices/scan`);
      setAvailableDevices(response.data.devices);
      toast.success(`Found ${response.data.devices.length} devices nearby`);
    } catch (error) {
      toast.error('Failed to scan for devices');
    } finally {
      setScanning(false);
    }
  };

  const handleSelectDevice = async (device) => {
    setSelectedDevice(device);
    
    // Generate OTP
    try {
      const response = await axios.post(`${API_URL}/api/devices/generate-otp`, {
        deviceId: device.id
      });
      setGeneratedOTP(response.data.otp);
      setShowOTPModal(true);
      toast.success(`OTP generated on ${device.name}. Check your device!`);
    } catch (error) {
      toast.error('Failed to generate OTP');
    }
  };

  const handlePairDevice = async () => {
    if (otpInput.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setPairing(true);
    try {
      await axios.post(`${API_URL}/api/devices/pair`, {
        deviceId: selectedDevice.id,
        otp: otpInput
      });
      
      toast.success(`${selectedDevice.name} paired successfully!`);
      setShowOTPModal(false);
      setOtpInput('');
      setSelectedDevice(null);
      fetchConnectedDevices();
      setAvailableDevices([]);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to pair device');
    } finally {
      setPairing(false);
    }
  };

  const handleSyncFromDevice = async (device) => {
    setSyncing(true);
    try {
      const response = await axios.post(`${API_URL}/api/devices/sync/${device.deviceId}`);
      
      await onSubmit({
        dataSource: 'device',
        deviceId: device.deviceId,
        metrics: response.data.data
      });
      
      toast.success(`Data synced from ${device.deviceName}`);
    } catch (error) {
      toast.error('Failed to sync data from device');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async (deviceId) => {
    try {
      await axios.delete(`${API_URL}/api/devices/disconnect/${deviceId}`);
      toast.success('Device disconnected');
      fetchConnectedDevices();
    } catch (error) {
      toast.error('Failed to disconnect device');
    }
  };

  return (
    <div className="space-y-6">
      {/* Scan for Devices */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleScan}
          disabled={scanning}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
        >
          {scanning ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Scanning...
            </>
          ) : (
            <>
              <Search size={20} />
              Scan for Devices
            </>
          )}
        </button>
        
        {availableDevices.length > 0 && (
          <p className="text-sm text-gray-600">
            {availableDevices.length} device(s) found nearby
          </p>
        )}
      </div>

      {/* Available Devices */}
      {availableDevices.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Devices</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableDevices.map(device => (
              <div
                key={device.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-400 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Smartphone className="text-primary-600" size={24} />
                    <div>
                      <h4 className="font-semibold text-gray-800">{device.name}</h4>
                      <p className="text-sm text-gray-500">{device.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Battery size={16} />
                    {device.battery}%
                  </div>
                </div>
                
                <button
                  onClick={() => handleSelectDevice(device)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all"
                >
                  <LinkIcon size={18} />
                  Pair Device
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connected Devices */}
      {connectedDevices.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Connected Devices</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connectedDevices.map(device => (
              <div
                key={device.deviceId}
                className="border-2 border-green-200 bg-green-50 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Wifi className="text-green-600" size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{device.deviceName}</h4>
                      <p className="text-sm text-gray-500">{device.deviceType}</p>
                      <p className="text-xs text-gray-400">
                        Paired: {new Date(device.pairedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Check className="text-green-600" size={24} />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSyncFromDevice(device)}
                    disabled={syncing}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                  >
                    {syncing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={16} />
                        Sync Data
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleDisconnect(device.deviceId)}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 font-semibold rounded-lg transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OTP Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Enter OTP</h3>
            <p className="text-gray-600 mb-6">
              A 6-digit OTP has been generated on <strong>{selectedDevice?.name}</strong>. 
              Please check your device and enter the code below.
            </p>
            
            {/* Simulated OTP Display (for demo purposes - in production, this would only show on the device) */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-600 mb-2">Device OTP (check your device):</p>
              <p className="text-3xl font-mono font-bold text-blue-700 text-center tracking-widest">
                {generatedOTP}
              </p>
            </div>
            
            <input
              type="text"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              className="w-full px-4 py-3 text-center text-2xl font-mono border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-6"
              maxLength={6}
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowOTPModal(false);
                  setOtpInput('');
                  setSelectedDevice(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handlePairDevice}
                disabled={pairing || otpInput.length !== 6}
                className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pairing ? 'Pairing...' : 'Pair Device'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {connectedDevices.length === 0 && availableDevices.length === 0 && !scanning && (
        <div className="text-center py-12">
          <Smartphone className="mx-auto text-gray-300 mb-4" size={64} />
          <p className="text-gray-500 text-lg mb-4">No devices connected</p>
          <p className="text-gray-400 text-sm">Click "Scan for Devices" to find nearby health devices</p>
        </div>
      )}
    </div>
  );
};

export default DeviceSync;
