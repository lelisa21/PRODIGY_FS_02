import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHome, FiSearch, FiPhoneCall, FiMail } from "react-icons/fi";
import Button from "../components/common/Button";
import ParticleBackground from "../components/animations/ParticleBackground";
import notFound from "../assets/404.png"
const NotFound = () => {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.6,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-linear-to-br from-gray-50 via-white to-gray-100">
      <ParticleBackground particleCount={50} opacity={0.15} color="#3b82f6" />

      <motion.div
        className="absolute top-20 left-10 w-50 h-50 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10  bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center px-6 max-w-6xl mx-auto h-max-46 "
      >
        {/* Main content card with glass morphism effect */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-2 sm:p-3 border border-gray-200/50"
        >
          {/* Animated 404 with glitch effect */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 100 }}
            className="relative mb-4 p-6"
            style={{
                backgroundImage:`url(${notFound})`,
                backgroundSize:'cover',
                backgroundRepeat:"no-repeat"
            }}
          >
            <motion.div
              animate={{
                x: [0, -2, 2, -1, 1, 0],
                opacity: [1, 0.8, 1],
              }}
              transition={{
                duration: 0.3,
                repeat: 3,
                repeatDelay: 2,
                ease: "easeInOut",
              }}
              className="text-5xl sm:text-7xl font-black bg-linear-to-r from-gray-900 via-cyan-400 to-gray-900 bg-clip-text text-transparent relative z-10"
            >
              404
            </motion.div>
            {/* Glitch overlay effect */}
            {/* <motion.div
              className="absolute inset-0 text-8xl sm:text-9xl font-black text-blue-500/20 blur-sm"
              style={{ top: 2, left: 2 }}
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              404
            </motion.div> */}
          </motion.div>

          {/* OOPS message with bounce animation */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 mb-4 tracking-tight"
          >
            <motion.span
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1, repeat: 2, repeatDelay: 1 }}
              className="inline-block"
            >
              OOPS!
            </motion.span>{" "}
            PAGE NOT FOUND
          </motion.h1>

          {/* Supportive message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="text-gray-600 text sm:text mb-8 max-w-6xl mx-auto"
          >
            BUT DON'T WORRY! BROWSE THROUGH OUR TOP NAV LINKS TO FIND YOUR SPEC.
          </motion.p>

    
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 m6-8 max-w-7xl mx-auto"
          >
            {[
              {
                name: "Dashboard",
                path: "/app/dashboard",
                icon: FiHome,
                color: "from-blue-500 to-blue-600",
              },
              {
                name: "Employee",
                path: "/employees",
                icon: FiSearch,
                color: "from-green-500 to-green-600",
              },
              {
                name: "Support",
                path: "/support",
                icon: FiPhoneCall,
                color: "from-purple-500 to-purple-600",
              },
              {
                name: "Contact",
                path: "/contact",
                icon: FiMail,
                color: "from-orange-500 to-orange-600",
              },
            ].map((item) => (
              <motion.div
                key={item.name}
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to={item.path}>
                  <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 group">
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1.5 text-gray-600 group-hover:text-fuchsia-600 transition-colors" />
                    <span className="text-sm sm:text-base font-medium text-gray-700 group-hover:text-fuchsia-600 transition-colors">
                      {item.name}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="h-px bg-linear-to-r from-transparent via-gray-300 to-transparent max-w-md mx-auto mb-6"
          />

          {/* Back to Homepage Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link to="/">
              <Button
                variant="primary"
                size="md"
                icon={<FiHome className="w-5 h-5" />}
                className="shadow-xl hover:shadow-2xl transition-all duration-300 bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-4 py-4 rounded"
              >
                BACK TO HOMEPAGE
              </Button>
            </Link>
          </motion.div>

          {/* Additional helpful text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-xs text-gray-400 mt-6"
          >
            Error Code: 404 The requested resource could not be found
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
