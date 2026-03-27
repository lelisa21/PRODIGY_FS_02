import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const Tabs = ({ tabs, defaultTab = 0, onChange, className }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  const handleTabChange = (index) => {
    setActiveTab(index);
    if (onChange) {
      onChange(index);
    }
  };
  
  return (
    <div className={clsx('w-full', className)}>
      <div className="border-b border-secondary-200">
        <nav className="flex space-x-8">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabChange(index)}
              className={clsx(
                'py-2 px-1 text-sm font-medium transition-colors relative',
                activeTab === index
                  ? 'text-primary-600'
                  : 'text-secondary-500 hover:text-secondary-700'
              )}
            >
              {tab.label}
              {activeTab === index && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                />
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};

export default Tabs;
