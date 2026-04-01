import { useState, useEffect } from 'react';
import { FiBell, FiMoon, FiSun, FiGlobe, FiLock, FiUser } from 'react-icons/fi';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useToast } from '../context/ToastContext';
import { FadeIn, SlideIn } from '../components/animations';
import { useTheme } from '../context/ThemeContext';
import authService from '../services/auth.service';

const Settings = () => {
  const { success: showSuccess, error: showError } = useToast();
  const { isDarkMode, toggleTheme } = useTheme();
  const [darkMode, setDarkMode] = useState(isDarkMode);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
  });
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  
  useEffect(() => {
    setDarkMode(isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const stored = localStorage.getItem('notificationSettings');
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch {
        // ignore invalid stored value
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(notifications));
  }, [notifications]);

  const handleNotificationChange = (type) => {
    setNotifications({ ...notifications, [type]: !notifications[type] });
    showSuccess('Notification settings updated');
  };
  
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      showError('Passwords do not match');
      return;
    }
    try {
      await authService.changePassword(passwordData.current, passwordData.new);
      showSuccess('Password updated successfully');
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update password');
    }
  };
  
  const handleThemeChange = () => {
    toggleTheme();
    showSuccess('Theme updated');
  };
  
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <FadeIn>
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">Settings</h1>
          <p className="text-secondary-600 mt-1">Manage your account preferences</p>
        </div>
      </FadeIn>
      
      <div className="space-y-6">
        {/* Appearance Settings */}
        <SlideIn direction="up" delay={0.1}>
          <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary-50 rounded-lg">
                {darkMode ? <FiMoon className="text-primary-600" /> : <FiSun className="text-primary-600" />}
              </div>
              <h2 className="text-lg font-semibold text-secondary-900">Appearance</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-700">Dark Mode</p>
                <p className="text-sm text-secondary-500">Switch between light and dark theme</p>
              </div>
              <button
                onClick={handleThemeChange}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? 'bg-primary-600' : 'bg-secondary-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </SlideIn>
        
        {/* Notification Settings */}
        <SlideIn direction="up" delay={0.2}>
          <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary-50 rounded-lg">
                <FiBell className="text-primary-600" />
              </div>
              <h2 className="text-lg font-semibold text-secondary-900">Notifications</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary-700">Email Notifications</p>
                  <p className="text-sm text-secondary-500">Receive updates via email</p>
                </div>
                <button
                  onClick={() => handleNotificationChange('email')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.email ? 'bg-primary-600' : 'bg-secondary-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.email ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary-700">Push Notifications</p>
                  <p className="text-sm text-secondary-500">Receive push notifications</p>
                </div>
                <button
                  onClick={() => handleNotificationChange('push')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.push ? 'bg-primary-600' : 'bg-secondary-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.push ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </SlideIn>
        
        {/* Password Change */}
        <SlideIn direction="up" delay={0.3}>
          <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary-50 rounded-lg">
                <FiLock className="text-primary-600" />
              </div>
              <h2 className="text-lg font-semibold text-secondary-900">Change Password</h2>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input
                type="password"
                label="Current Password"
                value={passwordData.current}
                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                required
              />
              <Input
                type="password"
                label="New Password"
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                required
              />
              <Input
                type="password"
                label="Confirm New Password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                required
              />
              <Button type="submit" variant="primary">
                Update Password
              </Button>
            </form>
          </div>
        </SlideIn>
      </div>
    </div>
  );
};

export default Settings;
