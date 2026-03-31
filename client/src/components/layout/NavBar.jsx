import  { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMenu, FiX, FiUser, FiLogOut, FiSettings, 
  FiBell, FiSearch, FiChevronDown 
} from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';
import Dropdown, { DropdownItem } from '../common/Dropdown';
import Tooltip from '../common/Tooltip';
import { clsx } from 'clsx';

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { success: showSuccess } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await logout();
    showSuccess('Logged out successfully');
    navigate('/login');
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/employees', label: 'Employees' },
    { path: '/reports', label: 'Reports' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-secondary-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-secondary-600 hover:bg-secondary-100 lg:hidden transition-colors"
            >
              {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
            
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-linear-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EMS</span>
              </div>
              <span className="hidden sm:block text-xl font-bold bg-linear-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                Enterprise EMS
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 ml-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={clsx(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    location.pathname === link.path
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <Tooltip content="Search">
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 rounded-lg text-secondary-600 hover:bg-secondary-100 transition-colors"
              >
                <FiSearch size={20} />
              </button>
            </Tooltip>

            {/* Notifications */}
            <Dropdown
              trigger={
                <button className="relative p-2 rounded-lg text-secondary-600 hover:bg-secondary-100 transition-colors">
                  <FiBell size={20} />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full animate-pulse" />
                  )}
                </button>
              }
            >
              <div className="p-4 min-w-[280px]">
                <h3 className="text-sm font-semibold text-secondary-900 mb-2">Notifications</h3>
                {notifications.length === 0 ? (
                  <p className="text-sm text-secondary-500">No new notifications</p>
                ) : (
                  notifications.map((notif, i) => (
                    <DropdownItem key={i} onClick={() => {}}>
                      {notif.message}
                    </DropdownItem>
                  ))
                )}
              </div>
            </Dropdown>

            {/* User Menu */}
            <Dropdown
              align="right"
              trigger={
                <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary-100 transition-colors">
                  <div className="w-8 h-8 bg-linear-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name ? getInitials(user.name) : 'U'}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-secondary-700">
                    {user?.name || 'User'}
                  </span>
                  <FiChevronDown size={16} className="text-secondary-500" />
                </button>
              }
            >
              <div className="py-2">
                <DropdownItem
                  icon={<FiUser size={16} />}
                  onClick={() => navigate('/profile')}
                >
                  Profile
                </DropdownItem>
                <DropdownItem
                  icon={<FiSettings size={16} />}
                  onClick={() => navigate('/settings')}
                >
                  Settings
                </DropdownItem>
                <div className="border-t border-secondary-100 my-1" />
                <DropdownItem
                  icon={<FiLogOut size={16} />}
                  onClick={handleLogout}
                  className="text-error-600 hover:bg-error-50"
                >
                  Logout
                </DropdownItem>
              </div>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSearch(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto mt-20 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                <div className="p-4 border-b border-secondary-200">
                  <input
                    type="text"
                    placeholder="Search employees, departments, or documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 text-lg outline-none"
                    autoFocus
                  />
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {/* Search results would go here */}
                  <div className="p-4 text-center text-secondary-500">
                    Type to start searching...
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
