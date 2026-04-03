import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white border-t border-secondary-200 py-6 mt-auto"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-secondary-500">
            © {currentYear}  GreatTeam Enterprise EMS. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-secondary-500 hover:text-teal-500 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-secondary-500 hover:text-teal-500 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-secondary-500 hover:text-teal-500 transition-colors">
              Support
            </a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
