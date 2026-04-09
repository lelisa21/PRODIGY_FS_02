import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBell,
  FiMoon,
  FiSun,
  FiGlobe,
  FiLock,
  FiUser,
  FiShield,
  FiMail,
  FiPhone,
  FiMonitor,
  FiSmartphone,
  FiEye,
  FiEyeOff,
  FiSave,
  FiTrash2,
  FiAlertCircle,
  FiChevronRight,
  FiLogOut,
  FiVolume2,
  FiVolumeX,
} from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import api from "../services/api";
import authService from "../services/auth.service";

const Settings = () => {
  const {
    isDarkMode,
    toggleTheme,
    accentColor,
    updateAccentColor,
    fontSize,
    updateFontSize,
    reducedMotion,
    updateReducedMotion,
  } = useTheme();

  const { user, logout } = useAuth();
  const { success: showSuccess, error: showError } = useToast();

  const [activeTab, setActiveTab] = useState("appearance");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Local appearance state (mirrors theme context)
  const [localTheme, setLocalTheme] = useState(isDarkMode ? "dark" : "light");
  const [localAccentColor, setLocalAccentColor] = useState(accentColor);
  const [localFontSize, setLocalFontSize] = useState(fontSize);
  const [localReducedMotion, setLocalReducedMotion] = useState(reducedMotion);
  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem("soundEnabled") !== "false",
  );

  // Notification Settings
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    desktop: true,
  });

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    showEmail: true,
    showPhone: true,
    showDepartment: true,
  });

  // Security Settings
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [sessions, setSessions] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const tabs = [
    { id: "appearance", label: "Appearance", icon: <FiMonitor /> },
    { id: "notifications", label: "Notifications", icon: <FiBell /> },
    { id: "privacy", label: "Privacy", icon: <FiLock /> },
    { id: "security", label: "Security", icon: <FiShield /> },
    { id: "language", label: "Language", icon: <FiGlobe /> },
  ];

  const accentColors = [
    { name: "amber", value: "#f59e0b", label: "Amber" },
    { name: "emerald", value: "#10b981", label: "Emerald" },
    { name: "rose", value: "#f43f5e", label: "Rose" },
    { name: "violet", value: "#8b5cf6", label: "Violet" },
    { name: "sky", value: "#0ea5e9", label: "Sky" },
    { name: "teal", value: "#14b8a6", label: "Teal" },
    { name: "indigo", value: "#6366f1", label: "Indigo" },
    { name: "fuchsia", value: "#d946ef", label: "Fuchsia" },
    { name: "orange", value: "#f97316", label: "Orange" },
    { name: "cyan", value: "#06b6d4", label: "Cyan" },
  ];

  // Sync local state with theme context
  useEffect(() => {
    setLocalTheme(isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    setLocalAccentColor(accentColor);
  }, [accentColor]);

  useEffect(() => {
    setLocalFontSize(fontSize);
  }, [fontSize]);

  useEffect(() => {
    setLocalReducedMotion(reducedMotion);
  }, [reducedMotion]);

  // Load saved preferences
  useEffect(() => {
    loadSavedPreferences();
    fetchSessions();
  }, []);

  const loadSavedPreferences = () => {
    // Load notifications from localStorage
    const savedNotifications = localStorage.getItem("notificationSettings");
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch (e) {}
    }

    // Load privacy from localStorage
    const savedPrivacy = localStorage.getItem("privacySettings");
    if (savedPrivacy) {
      try {
        setPrivacy(JSON.parse(savedPrivacy));
      } catch (e) {}
    }

    // Load sound setting
    const savedSound = localStorage.getItem("soundEnabled");
    if (savedSound) setSoundEnabled(savedSound !== "false");
  };

  const fetchSessions = async () => {
    try {
      const response = await api.get("/auth/sessions");
      setSessions(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    }
  };

  // Apply appearance settings

  // For accent color:

  const handleThemeChange = (newTheme) => {
    setLocalTheme(newTheme);
    if (newTheme === "dark" && !isDarkMode) toggleTheme();
    if (newTheme === "light" && isDarkMode) toggleTheme();
  };

  const handleAccentColorChange = (color) => {
    setLocalAccentColor(color);
    updateAccentColor(color);
  };

  const handleFontSizeChange = (size) => {
    setLocalFontSize(size);
    updateFontSize(size);
  };

  const handleReducedMotionChange = () => {
    const newValue = !localReducedMotion;
    setLocalReducedMotion(newValue);
    updateReducedMotion(newValue);
    showSuccess(newValue ? "Reduced motion enabled" : "Animations enabled");
  };

  const handleSoundChange = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem("soundEnabled", newValue);
  };

  // Save notification settings
  const saveNotificationSettings = () => {
    localStorage.setItem("notificationSettings", JSON.stringify(notifications));
  };

  const handleNotificationChange = (type) => {
    setNotifications((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  // Save privacy settings
  const savePrivacySettings = () => {
    localStorage.setItem("privacySettings", JSON.stringify(privacy));
  };

  const handlePrivacyChange = (field, value) => {
    setPrivacy((prev) => ({ ...prev, [field]: value }));
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      showError("New passwords do not match");
      return;
    }
    if (passwordData.new.length < 8) {
      showError("Password must be at least 8 characters");
      return;
    }
    if (passwordData.new === passwordData.current) {
      showError("New password must be different from current password");
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(passwordData.current, passwordData.new);
      showSuccess("Password updated successfully");
      setPasswordData({ current: "", new: "", confirm: "" });
    } catch (error) {
      showError(error.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  // Handle session revocation
  const handleRevokeSession = async (sessionId) => {
    try {
      await api.delete(`/auth/sessions/${sessionId}`);
      showSuccess("Session revoked");
      fetchSessions();
    } catch (error) {
      showError("Failed to revoke session");
    }
  };

  const handleRevokeAllSessions = async () => {
    if (
      window.confirm("This will log you out from all other devices. Continue?")
    ) {
      try {
        await api.delete("/auth/sessions/all");
        showSuccess("All other sessions revoked");
        fetchSessions();
      } catch (error) {
        showError("Failed to revoke sessions");
      }
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      showError('Type "DELETE" to confirm account deletion');
      return;
    }

    setLoading(true);
    try {
      await api.delete("/user/account");
      showSuccess("Account deleted successfully");
      setTimeout(() => logout(), 2000);
    } catch (error) {
      showError(error.response?.data?.message || "Failed to delete account");
      setShowDeleteConfirm(false);
      setDeleteConfirmText("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-800 to-green-800 dark:from-green-600 dark:to-amber-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1 sm:mt-2 text-sm sm:text-base">
            Customize your experience and manage your account
          </p>
        </motion.div>

        {/* Mobile Tab Selector */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800"
          >
            <div className="flex items-center gap-3">
              {tabs.find((t) => t.id === activeTab)?.icon}
              <span className="font-medium">
                {tabs.find((t) => t.id === activeTab)?.label}
              </span>
            </div>
            <FiChevronRight
              className={`transform transition-transform ${mobileMenuOpen ? "rotate-90" : ""}`}
            />
          </button>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden"
              >
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${
                      activeTab === tab.id
                        ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Desktop */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block lg:w-72 xl:w-80 shrink-0"
          >
            <div className="sticky top-24 space-y-1 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 space-y-5"
          >
            {/* Appearance Settings */}
            {activeTab === "appearance" && (
              <>
                <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                    <FiMonitor className="text-amber-500" />
                    Theme
                  </h2>
                  <div className="grid grid-cols-3 gap-3 max-w-4xl">
                    {["light", "dark", "system"].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => handleThemeChange(mode)}
                        className={`p-2 sm:p-4 size-4xl  rounded-lg border transition-all ${
                          localTheme === mode
                            ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30"
                            : "border-neutral-200 dark:border-neutral-700 hover:border-amber-300"
                        }`}
                      >
                        <div className="flex justify-center mb-1 sm:mb-2">
                          {mode === "light" && (
                            <FiSun className="text-xl sm:text-2xl text-amber-500" />
                          )}
                          {mode === "dark" && (
                            <FiMoon className="text-xl sm:text-2xl text-amber-500" />
                          )}
                          {mode === "system" && (
                            <FiMonitor className="text-xl sm:text-2xl text-amber-500" />
                          )}
                        </div>
                        <p className="text-md text-white sm:text-sm font-medium capitalize text-center">
                          {mode === "system" ? "System" : mode}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                    Accent Color
                  </h2>
                  <div className="flex gap-4 flex-wrap">
                    {accentColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => handleAccentColorChange(color.name)}
                        className={`flex flex-col items-center gap-2 transition-all ${
                          localAccentColor === color.name
                            ? "scale-110"
                            : "opacity-70 hover:opacity-100"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-full bg-gradient-to-r ${
                            color.name === "amber"
                              ? "from-amber-500 to-amber-600"
                              : color.name === "emerald"
                                ? "from-emerald-500 to-emerald-600"
                                : color.name === "rose"
                                  ? "from-rose-500 to-rose-600"
                                  : color.name === "violet"
                                    ? "from-violet-500 to-violet-600"
                                    : color.name === "sky"
                                      ? "from-sky-500 to-sky-600"
                                      : color.name === "teal"
                                        ? "from-teal-500 to-teal-600"
                                        : color.name === "orange"
                                          ? "from-orange-500 to-orange-600"
                                          : color.name === "lime"
                                            ? "from-lime-500 to-lime-600"
                                            : color.name === "cyan"
                                              ? "from-cyan-500 to-cyan-600"
                                              : color.name === "purple"
                                                ? "from-purple-500 to-purple-600"
                                                : color.name === "pink"
                                                  ? "from-pink-500 to-pink-600"
                                                  : color.name === "indigo"
                                                    ? "from-indigo-500 to-indigo-600"
                                                    : color.name === "fuchsia"
                                                      ? "from-fuchsia-500 to-fuchsia-600"
                                                      : "from-rose-500 to-rose-600"
                          } ${localAccentColor === color.name ? "ring-2 ring-offset-2 ring-neutral-400 dark:ring-offset-neutral-900" : ""}`}
                        />
                        <span className="text-sm capitalize text-neutral-700 dark:text-neutral-300">
                          {color.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                    Display & Accessibility
                  </h2>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">
                          Font Size
                        </p>
                        <p className="text-sm text-neutral-500">
                          Adjust text size throughout the app
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {["small", "medium", "large"].map((size) => (
                          <button
                            key={size}
                            onClick={() => handleFontSizeChange(size)}
                            className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${
                              localFontSize === size
                                ? "bg-amber-500 text-white"
                                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">
                          Reduced Motion
                        </p>
                        <p className="text-sm text-neutral-500">
                          Minimize animations and transitions
                        </p>
                      </div>
                      <button
                        onClick={handleReducedMotionChange}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                          localReducedMotion
                            ? "bg-amber-500"
                            : "bg-neutral-300 dark:bg-neutral-700"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            localReducedMotion
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">
                          Sound Effects
                        </p>
                        <p className="text-sm text-neutral-500">
                          Play sounds for notifications
                        </p>
                      </div>
                      <button
                        onClick={handleSoundChange}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                          soundEnabled
                            ? "bg-amber-500"
                            : "bg-neutral-300 dark:bg-neutral-700"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            soundEnabled ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                    <FiBell className="text-amber-500" />
                    Notification Preferences
                  </h2>
                  <Button
                    size="sm"
                    onClick={saveNotificationSettings}
                    variant="outline"
                  >
                    <FiSave className="mr-2" /> Save Changes
                  </Button>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      id: "email",
                      label: "Email Notifications",
                      desc: "Receive updates and alerts via email",
                      icon: <FiMail />,
                    },
                    {
                      id: "push",
                      label: "Push Notifications",
                      desc: "Real-time notifications in browser",
                      icon: <FiSmartphone />,
                    },
                    {
                      id: "sms",
                      label: "SMS Notifications",
                      desc: "Critical alerts via text message",
                      icon: <FiPhone />,
                    },
                    {
                      id: "desktop",
                      label: "Desktop Notifications",
                      desc: "System-level notifications",
                      icon: <FiMonitor />,
                    },
                  ].map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white flex items-center gap-2">
                          {item.icon} {item.label}
                        </p>
                        <p className="text-sm text-neutral-500">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange(item.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                          notifications[item.id]
                            ? "bg-amber-500"
                            : "bg-neutral-300 dark:bg-neutral-700"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications[item.id]
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === "privacy" && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                    <FiLock className="text-amber-500" />
                    Privacy Controls
                  </h2>
                  <Button
                    size="sm"
                    onClick={savePrivacySettings}
                    variant="outline"
                  >
                    <FiSave className="mr-2" /> Save Changes
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white">
                        Profile Visibility
                      </p>
                      <p className="text-sm text-neutral-500">
                        Who can see your profile
                      </p>
                    </div>
                    <select
                      value={privacy.profileVisibility}
                      onChange={(e) =>
                        handlePrivacyChange("profileVisibility", e.target.value)
                      }
                      className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white w-full sm:w-48"
                    >
                      <option value="public">Public - Anyone can view</option>
                      <option value="connections">Connections Only</option>
                      <option value="private">Private - Only me</option>
                    </select>
                  </div>

                  {[
                    {
                      id: "showEmail",
                      label: "Show Email",
                      desc: "Display email address on profile",
                    },
                    {
                      id: "showPhone",
                      label: "Show Phone Number",
                      desc: "Display phone number on profile",
                    },
                    {
                      id: "showDepartment",
                      label: "Show Department",
                      desc: "Display department information",
                    },
                  ].map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800"
                    >
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">
                          {item.label}
                        </p>
                        <p className="text-sm text-neutral-500">{item.desc}</p>
                      </div>
                      <button
                        onClick={() =>
                          handlePrivacyChange(item.id, !privacy[item.id])
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                          privacy[item.id]
                            ? "bg-amber-500"
                            : "bg-neutral-300 dark:bg-neutral-700"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            privacy[item.id] ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <div className="space-y-5">
                {/* Change Password */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                    <FiLock className="text-amber-500" />
                    Change Password
                  </h2>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="relative">
                      <Input
                        type={showPassword.current ? "text" : "password"}
                        label="Current Password"
                        value={passwordData.current}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            current: e.target.value,
                          })
                        }
                        required
                        className="w-full"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword({
                            ...showPassword,
                            current: !showPassword.current,
                          })
                        }
                        className="absolute right-3 top-9 text-neutral-500"
                      >
                        {showPassword.current ? (
                          <FiEyeOff size={16} />
                        ) : (
                          <FiEye size={16} />
                        )}
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        type={showPassword.new ? "text" : "password"}
                        label="New Password"
                        value={passwordData.new}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            new: e.target.value,
                          })
                        }
                        required
                        className="w-full"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword({
                            ...showPassword,
                            new: !showPassword.new,
                          })
                        }
                        className="absolute right-3 top-9 text-neutral-500"
                      >
                        {showPassword.new ? (
                          <FiEyeOff size={16} />
                        ) : (
                          <FiEye size={16} />
                        )}
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        type={showPassword.confirm ? "text" : "password"}
                        label="Confirm New Password"
                        value={passwordData.confirm}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirm: e.target.value,
                          })
                        }
                        required
                        className="w-full"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword({
                            ...showPassword,
                            confirm: !showPassword.confirm,
                          })
                        }
                        className="absolute right-3 top-9 text-neutral-500"
                      >
                        {showPassword.confirm ? (
                          <FiEyeOff size={16} />
                        ) : (
                          <FiEye size={16} />
                        )}
                      </button>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        isLoading={loading}
                        size="md"
                      >
                        <FiSave className="mr-2" /> Update Password
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Active Sessions */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                      <FiMonitor className="text-amber-500" />
                      Active Sessions
                    </h2>
                    {sessions.length > 1 && (
                      <Button
                        size="sm"
                        onClick={handleRevokeAllSessions}
                        variant="outline"
                      >
                        <FiLogOut className="mr-2" /> Revoke All Others
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {sessions.length === 0 ? (
                      <p className="text-neutral-500 text-center py-4">
                        No active sessions
                      </p>
                    ) : (
                      sessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800"
                        >
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-white">
                              {session.device || "Unknown Device"}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {session.location || "Unknown location"} • Last
                              active:{" "}
                              {new Date(session.lastActive).toLocaleString()}
                            </p>
                            {session.current && (
                              <span className="text-xs text-amber-500 font-medium">
                                Current session
                              </span>
                            )}
                          </div>
                          {!session.current && (
                            <button
                              onClick={() => handleRevokeSession(session.id)}
                              className="text-rose-500 hover:text-rose-600 text-sm px-3 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Delete Account */}
                <div className="bg-gradient-to-r from-rose-50 to-rose-100 dark:from-rose-950/30 dark:to-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-800 p-5 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-rose-700 dark:text-rose-400 mb-2 flex items-center gap-2">
                    <FiAlertCircle />
                    Danger Zone
                  </h2>
                  <p className="text-sm text-rose-600 dark:text-rose-400 mb-4">
                    Once you delete your account, there is no going back. All
                    your data will be permanently removed.
                  </p>

                  {!showDeleteConfirm ? (
                    <Button
                      onClick={() => setShowDeleteConfirm(true)}
                      variant="danger"
                    >
                      <FiTrash2 className="mr-2" /> Delete Account
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">
                        Type "DELETE" to confirm account deletion:
                      </p>
                      <Input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="Type DELETE here"
                        className="w-full"
                      />
                      <div className="flex gap-3">
                        <Button
                          onClick={handleDeleteAccount}
                          variant="danger"
                          isLoading={loading}
                        >
                          Confirm Delete
                        </Button>
                        <Button
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeleteConfirmText("Deleted");
                          }}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Language Tab - Placeholder */}
            {activeTab === "language" && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6">
                <div className="text-center py-12">
                  <FiGlobe className="text-5xl text-neutral-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                    Language Settings
                  </h2>
                  <p className="text-neutral-500 dark:text-neutral-400">
                    Multiple language support coming soon!
                  </p>
                  <p className="text-sm text-neutral-400 mt-2">
                    We're working on adding support for Amharic, Afan Oromo, and
                    more languages.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
