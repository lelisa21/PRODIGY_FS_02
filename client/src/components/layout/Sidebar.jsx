import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiUser,
  FiFileText,
  FiLogOut,
  FiBriefcase,
  FiCalendar,
  FiMail,
  FiStar,
  FiTrendingUp,
} from "react-icons/fi";
import { useAuthStore } from "../../store/authStore";
import { clsx } from "clsx";
import { useRef, useState, useEffect } from "react";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const itemsRef = useRef([]);
  const [ropeStyle, setRopeStyle] = useState({ top: 0, height: 0 });
  const { user, logout } = useAuthStore();
  const displayName =
    user?.fullName ||
    `${user?.profile?.firstName || ""} ${user?.profile?.lastName || ""}`.trim() ||
    user?.email ||
    "User";

  // for clean sidebar rope location
  const location = useLocation();
  useEffect(() => {
    const index = [...menuItems, ...bottomMenuItems].findIndex(
      (item) => item.path === location.pathname,
    );
    if (index !== -1) updateRope(index);
  }, [location.pathname]);

  const updateRope = (index) => {
    const el = itemsRef.current[index];
    if (el) {
      setRopeStyle({
        top: el.offsetTop,
        height: el.offsetHeight,
      });
    }
    setActiveIndex(index);
  };

  const menuItems = [
    {
      path: "/app/dashboard",
      icon: FiHome,
      label: "Dashboard",
      roles: ["admin", "manager", "employee"],
    },
    {
      path: "/app/employees",
      icon: FiUsers,
      label: "Employees",
      roles: ["admin", "manager"],
    },
    {
      path: "/app/departments",
      icon: FiBriefcase,
      label: "Departments",
      roles: ["admin", "manager"],
    },
    {
      path: "/app/attendance",
      icon: FiCalendar,
      label: "Attendance",
      roles: ["admin", "manager"],
    },
    {
      path: "/app/performance",
      icon: FiTrendingUp,
      label: "Performance",
      roles: ["admin", "manager"],
    },
    {
      path: "/app/reports",
      icon: FiBarChart2,
      label: "Reports",
      roles: ["admin", "manager"],
    },
    {
      path: "/app/documents",
      icon: FiFileText,
      label: "Documents",
      roles: ["admin", "manager"],
    },
    {
      path: "/app/messages",
      icon: FiMail,
      label: "Messages",
      roles: ["admin", "manager", "employee"],
    },
  ];

  const bottomMenuItems = [
    {
      path: "/app/profile",
      icon: FiUser,
      label: "Profile",
      roles: ["admin", "manager", "employee"],
    },
    {
      path: "/app/settings",
      icon: FiSettings,
      label: "Settings",
      roles: ["admin", "manager", "employee"],
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const sidebarVariants = {
    open: {
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    closed: {
      x: "-100%",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
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
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        className={clsx(
          "fixed top-0 left-0 h-full w-44 md:w-52 bg-white z-50 overflow-hidden",
          "lg:translate-x-0 lg:static lg:z-0 border-r border-gray-100",
        )}
      >
        {/* === ROPE SIDEBAR BORDER === */}
        <div className="absolute top-0 right-0 h-full w-[6px] overflow-hidden pointer-events-none">
          {/* Rope base */}
          <div className="absolute inset-0  bg-gradient-to-b from-cyan-600 via-[#bfe9eb] to-green-700" />

          {/* Rope twist pattern */}
          <div
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage: `
        repeating-linear-gradient(
          45deg,
          rgba(0,0,0,0.15) 0px,
          rgba(0,0,0,0.45) 2px,
          transparent 2px,
          transparent 6px
        )
      `,
            }}
          />

          {/* Rope highlight */}
          <div
            className="absolute  inset-y-0 left-0 w-[1px]"
            style={{
              background: "rgba(255,255,255,0.6)",
            }}
          />
        </div>

        <div className="flex flex-col h-full relative">
          {/* === REAL ROPE EFFECT === */}
          <motion.div
            className="absolute right-[8px] w-1.5 rounded-l-3xl pointer-events-none z-10 overflow-hidden"
            animate={{
              top: ropeStyle.top,
              height: ropeStyle.height,
              x: [0, 1, -1, 0],
            }}
            transition={{
              top: {
                type: "spring",
                stiffness: 140,
                damping: 40,
                mass: 0.6,
              },
              height: {
                type: "spring",
                stiffness: 140,
                damping: 36,
              },
              x: {
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
              },
            }}
          >
            {/* Base rope color */}
            <div className="absolute inset-0 bg-gradient-to-b from-teal-400 via-gray-300 to-gray-500" />

            {/* Twisted rope texture */}
            <motion.div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `
        repeating-linear-gradient(
          135deg,
          rgba(255,255,255,0.25) 0px,
          rgba(255,255,255,0.25) 2px,
          transparent 2px,
          transparent 6px
        )
      `,
              }}
              animate={{
                backgroundPosition: ["0px 0px", "0px 20px"],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                ease: "linear",
              }}
            />

            {/* Left shadow for depth */}
            <div
              className="absolute inset-y-0 left-0 w-[1.5px]"
              style={{
                background: "rgba(0,0,0,0.15)",
              }}
            />

            {/* Glow */}
            <div
              className="absolute inset-0"
              style={{
                boxShadow: "0 0 10px rgba(45,212,191,0.6)",
              }}
            />
          </motion.div>

          {/* User Info - unchanged */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center shrink-0">
                <span className="text-white font-medium">
                  {displayName.charAt(0) || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role || "Employee"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-3 space-y-1">
              {menuItems
                .filter((item) =>
                  item.roles?.includes(user?.role || "employee"),
                )
                .map((item, index) => (
                  <NavLink
                    ref={(el) => (itemsRef.current[index] = el)}
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      updateRope(index);
                      if (window.innerWidth < 1024) {
                        setIsOpen(false);
                      }
                    }}
                    className={({ isActive }) =>
                      clsx(
                        "group flex items-center gap-3 px-4 py-[13px] rounded-xl text-sm font-medium transition-all relative",
                        isActive
                          ? "text-teal-700 bg-teal-50"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-800",
                      )
                    }
                  >
                    <item.icon size={19} className="shrink-0" />
                    <span className="truncate">{item.label}</span>

                    {item.label === "Performance" && (
                      <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        New
                      </span>
                    )}
                  </NavLink>
                ))}
            </div>
          </nav>

          {/* Bottom Menu */}
          <div className="border-t border-gray-100 p-3 space-y-1">
            {bottomMenuItems
              .filter((item) => item.roles?.includes(user?.role || "employee"))
              .map((item, index) => (
                <NavLink
                  ref={(el) =>
                    (itemsRef.current[menuItems.length + index] = el)
                  }
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    updateRope(index); 
                    if (window.innerWidth < 1024) {
                      setIsOpen(false);
                    }
                  }}
                  className={({ isActive }) =>
                    clsx(
                      "group flex items-center gap-3 px-4 py-[13px] rounded-xl text-sm font-medium transition-all relative",
                      isActive
                        ? "text-teal-700 bg-teal-50"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800",
                    )
                  }
                >
                  <item.icon size={19} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-[13px] rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
            >
              <FiLogOut size={19} className="shrink-0" />
              <span className="truncate">Logout</span>
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
