import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHydration } from '../context/HydrationContext';
import { 
  LayoutDashboard, 
  FileText, 
  User, 
  LogOut, 
  ChevronDown,
  Activity,
  Droplets,
  Pencil
} from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { reminderEnabled, toggleReminder } = useHydration();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/documents', icon: FileText, label: 'Medical Documents' },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary-600">
            <Activity className="w-8 h-8" />
            <span>HealthMonitor</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}

            {/* Hydration Reminder Toggle */}
            <button
              onClick={toggleReminder}
              className={`p-2 rounded-lg transition-all ${
                reminderEnabled
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
              title={reminderEnabled ? 'Hydration reminders ON' : 'Hydration reminders OFF'}
            >
              <Droplets size={20} />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  {user?.profile?.avatar ? (
                    <img 
                      src={user.profile.avatar.startsWith('http') 
                        ? user.profile.avatar 
                        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.profile.avatar}`
                      } 
                      alt="Avatar" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User size={18} className="text-primary-600" />
                  )}
                </div>
                <span className="hidden md:inline text-gray-700 font-medium">
                  {user?.email?.split('@')[0] || 'Profile'}
                </span>
                <ChevronDown size={16} className="text-gray-500" />
              </button>

              {/* Dropdown Menu */}
              {showProfileDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowProfileDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <User size={18} className="text-gray-600" />
                      <span className="text-gray-700">View Profile</span>
                    </Link>
                    <Link
                      to="/profile?mode=edit"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <Pencil size={18} className="text-gray-600" />
                      <span className="text-gray-700">Edit Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut size={18} className="text-red-600" />
                      <span className="text-red-600 font-medium">Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
