import { createContext, useContext, useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Droplets } from 'lucide-react';

const HydrationContext = createContext();

export const useHydration = () => {
  const context = useContext(HydrationContext);
  if (!context) {
    throw new Error('useHydration must be used within HydrationProvider');
  }
  return context;
};

export const HydrationProvider = ({ children }) => {
  const [reminderEnabled, setReminderEnabled] = useState(() => {
    const stored = localStorage.getItem('hydrationReminderEnabled');
    return stored ? JSON.parse(stored) : false;
  });
  const alarmAudioRef = useRef(null);
  const lastReminderRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    alarmAudioRef.current = new Audio('/alarm.wav');
    alarmAudioRef.current.preload = 'auto';
  }, []);

  const playAlarm = () => {
    try {
      if (!alarmAudioRef.current) return;
      alarmAudioRef.current.currentTime = 0;
      alarmAudioRef.current.volume = 0.7;
      alarmAudioRef.current.play().catch((error) => {
        console.warn('Alarm sound blocked:', error);
      });
    } catch (error) {
      console.warn('Alarm sound unavailable:', error);
    }
  };

  useEffect(() => {
    if (!reminderEnabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const triggerAlert = (force = false) => {
      const now = new Date();
      const twoHours = 2 * 60 * 60 * 1000;
      const lastReminder = lastReminderRef.current;

      if (force || !lastReminder || (now - lastReminder) >= twoHours) {
        toast(
          (t) => (
            <div className="flex items-center gap-3">
              <Droplets className="text-blue-500" size={24} />
              <div>
                <p className="font-semibold text-white">⚠️ Hydration Alert</p>
                <p className="text-sm text-gray-200">Please drink water now to stay safe and healthy</p>
              </div>
            </div>
          ),
          {
            duration: 8000,
            icon: '🚨',
            style: {
              background: '#b91c1c',
              color: '#fff',
              minWidth: '300px'
            }
          }
        );
        playAlarm();
        lastReminderRef.current = now;
      }
    };

    // Fire immediately on enable (user action), then every 2 hours
    triggerAlert(true);
    intervalRef.current = setInterval(() => triggerAlert(false), 2 * 60 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [reminderEnabled]);

  const toggleReminder = () => {
    const nextValue = !reminderEnabled;
    setReminderEnabled(nextValue);
    localStorage.setItem('hydrationReminderEnabled', JSON.stringify(nextValue));
    if (nextValue) {
      lastReminderRef.current = null;
    }
  };

  return (
    <HydrationContext.Provider value={{ reminderEnabled, toggleReminder }}>
      {children}
    </HydrationContext.Provider>
  );
};
