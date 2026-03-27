import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, FiUsers, FiBarChart2, FiSettings, 
  FiUser, FiFileText, FiLogOut, FiBriefcase,
  FiCalendar, FiMail, FiStar, FiTrendingUp
} from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { clsx } from 'clsx';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { path: '/app/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/app/employees', icon: FiUsers, label: 'Employees' },
    { path: '/app/departments', icon: FiBriefcase, label: 'Departments' },
    { path: '/app/attendance', icon: FiCalendar, label: 'Attendance' },
    { path: '/app/performance', icon: FiTrendingUp, label: 'Performance' },
    { path: '/app/reports', icon: FiBarChart2, label: 'Reports' },
    { path: '/app/documents', icon: FiFileText, label: 'Documents' },
    { path: '/app/messages', icon: FiMail, label: 'Messages' },
  ];

  const bottomMenuItems = [
    { path: '/app/profile', icon: FiUser, label: 'Profile' },
    { path: '/app/settings', icon: FiSettings, label: 'Settings' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sidebarVariants = {
    open: {
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    closed: {
      x: '-100%',
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        variants={sidebarVariants}
        className={clsx(
          'fixed top-0 left-0 h-full w-64 md:w-72 bg-white border-r border-secondary-200 z-50',
          'lg:translate-x-0 lg:static lg:z-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="h-16 flex items-center justify-center border-b border-secondary-200 px-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EMS</span>
              </div>
              <span className="text-base md:text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                Enterprise EMS
              </span>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-secondary-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-medium">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-900 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-secondary-500 truncate">
                  {user?.role || 'Employee'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-3 space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                    )
                  }
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon size={18} className="flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.label === 'Performance' && (
                    <span className="ml-auto text-xs bg-success-100 text-success-700 px-1.5 py-0.5 rounded-full flex-shrink-0">
                      New
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Bottom Menu */}
          <div className="border-t border-secondary-200 p-3 space-y-1">
            {bottomMenuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                  )
                }
                onClick={() => setIsOpen(false)}
              >
                <item.icon size={18} className="flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-error-600 hover:bg-error-50 transition-all duration-200"
            >
              <FiLogOut size={18} className="flex-shrink-0" />
              <span className="truncate">Logout</span>
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
