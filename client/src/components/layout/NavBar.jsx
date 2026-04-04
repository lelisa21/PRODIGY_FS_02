import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiSettings,
  FiBell,
  FiSearch,
  FiChevronDown,
} from "react-icons/fi";
import { useAuthStore } from "../../store/authStore";
import { useToast } from "../../context/ToastContext";
import Dropdown, { DropdownItem } from "../common/Dropdown";
import Tooltip from "../common/Tooltip";
import { clsx } from "clsx";

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { success: showSuccess } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const displayName =
    user?.fullName ||
    `${user?.profile?.firstName || ""} ${user?.profile?.lastName || ""}`.trim() ||
    user?.email ||
    "User";

  const handleLogout = async () => {
    await logout();
    showSuccess("Logged out successfully");
    navigate("/login");
  };

  useEffect(() => {
  const handleEsc = (e) => {
    if (e.key === 'Escape' && showSearch) {
      setShowSearch(false);
      setSearchQuery("");
    }
  };
  window.addEventListener('keydown', handleEsc);
  return () => window.removeEventListener('keydown', handleEsc);
}, [showSearch]);


  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navLinks = [
    {
      path: "/app/dashboard",
      label: "Dashboard",
      roles: ["admin", "manager", "employee"],
    },
    { path: "/app/employees", label: "Employees", roles: ["admin", "manager"] },
    { path: "/app/reports", label: "Reports", roles: ["admin", "manager"] },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#00535e] backdrop-blur-md border-b border-white/10 text-white ">
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
                <span className="text-white font-bold text-sm"> GT</span>
              </div>
              <span className="hidden sm:block text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-400 bg-clip-text text-transparent">
                GreatTeam
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-3 ml-8">
              {navLinks
                .filter((link) =>
                  link.roles?.includes(user?.role || "employee"),
                )
                .map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={clsx(
                      "px-5 py-2 rounded-lg text-md font-medium transition-colors",
                      location.pathname === link.path
                        ? "text-primary-600 border-b-2 border-white "
                        : "hover:border-b-2 hover:border-white transition-all duration-500",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3 text-white">
            {/* Search Button */}
            <Tooltip content="Search">
              <button
                onClick={() => setShowSearch(true)}
                className="p-2.5  rounded-xl   hover:bg-white/10 transition-all active:scale-95"
              >
                <FiSearch size={21} />
              </button>
            </Tooltip>

            {/* Notifications */}
            <Dropdown
              trigger={
                <button className="relative p-2 rounded-lg  hover:bg-[#1c823cfa] transition-colors">
                  <FiBell size={20} />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full animate-pulse" />
                  )}
                </button>
              }
            >
              <div className="p-4 min-w-70 text-black">
                <h3 className="text-sm font-semibold  mb-2">Notifications</h3>
                {notifications.length === 0 ? (
                  <p className="text-sm ">No new notifications</p>
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
                <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#00535e4a] transition-colors">
                  <div className="w-8 h-8 bg-linear-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                    <span className=" text-sm font-medium">
                      {displayName ? getInitials(displayName) : "U"}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {displayName}
                  </span>
                  <FiChevronDown size={16} />
                </button>
              }
            >
              <div className="py-2">
                <DropdownItem
                  icon={<FiUser size={16} />}
                  onClick={() => navigate("/app/profile")}
                >
                  Profile
                </DropdownItem>
                <DropdownItem
                  icon={<FiSettings size={16} />}
                  onClick={() => navigate("/app/settings")}
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

     {/* Premium Search Modal - Mobile Friendly */}
<AnimatePresence>
  {showSearch && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
      onClick={() => {
        setShowSearch(false);
        setSearchQuery("");
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="max-w-7xl mx-auto mt-8 px-4"   
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 text-black relative">
          
          <button
            onClick={() => {
              setShowSearch(false);
              setSearchQuery("");
            }}
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close search"
          >
            <FiX size={26} />
          </button>

          {/* Search Input */}
          <div className="relative">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">
              <FiSearch size={24} />
            </div>
            <input
              type="text"
              placeholder="Search employees, departments, documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  console.log("Searching for:", searchQuery);
                }
              }}
              className="w-full pl-16 pr-6 py-6 text-lg bg-transparent outline-none border-b border-gray-100 placeholder:text-gray-400 focus:border-teal-500 transition-colors"
              autoFocus
            />
          </div>

          {/* Results Area */}
          <div className="max-h-[420px] overflow-y-auto p-4">
            {searchQuery.trim() === "" ? (
              <div className="py-16 text-center">        
              </div>
            ) : (
              <div className="py-12 text-center text-gray-400">
                <span className="font-medium text-gray-600 break-all">
                  "{searchQuery}"
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 px-6 py-4 text-xs text-gray-400 flex items-center justify-between bg-gray-50">
            <div className="hidden sm:block">
              Press <span className="font-mono bg-white px-2 py-1 rounded border text-gray-500">ESC</span> to close
            </div>
            <div className="hidden sm:block">
              ↑ ↓ to navigate • ↵ to select
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
