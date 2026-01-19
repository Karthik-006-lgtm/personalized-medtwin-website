import { createContext, useContext, useState, useEffect } from 'react';
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
  const [lastReminder, setLastReminder] = useState(null);
  const [reminderEnabled, setReminderEnabled] = useState(true);

  useEffect(() => {
    if (!reminderEnabled) return;

    const checkAndRemind = () => {
      const now = new Date();
      
      if (!lastReminder || (now - lastReminder) >= 2 * 60 * 60 * 1000) {
        // Show reminder every 2 hours
        toast(
          (t) => (
            <div className="flex items-center gap-3">
              <Droplets className="text-blue-500" size={24} />
              <div>
                <p className="font-semibold text-white">Time to Hydrate!</p>
                <p className="text-sm text-gray-300">Drink a glass of water to stay healthy</p>
              </div>
            </div>
          ),
          {
            duration: 6000,
            icon: '💧',
            style: {
              background: '#1e40af',
              color: '#fff',
              minWidth: '300px'
            }
          }
        );
        setLastReminder(now);
      }
    };

    // Check immediately
    checkAndRemind();

    // Check every 30 minutes (to catch the 2-hour interval)
    const interval = setInterval(checkAndRemind, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [lastReminder, reminderEnabled]);

  const toggleReminder = () => {
    setReminderEnabled(!reminderEnabled);
  };

  return (
    <HydrationContext.Provider value={{ reminderEnabled, toggleReminder }}>
      {children}
    </HydrationContext.Provider>
  );
};
