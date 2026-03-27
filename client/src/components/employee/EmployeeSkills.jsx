import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiStar } from 'react-icons/fi';
import Button from '../common/Button';
import Input from '../common/Input';

const EmployeeSkills = ({ skills = [], onUpdate, readOnly = false }) => {
  const [newSkill, setNewSkill] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('intermediate');
  
  const levels = [
    { value: 'beginner', label: 'Beginner', color: 'bg-secondary-500' },
    { value: 'intermediate', label: 'Intermediate', color: 'bg-primary-500' },
    { value: 'advanced', label: 'Advanced', color: 'bg-success-500' },
    { value: 'expert', label: 'Expert', color: 'bg-warning-500' },
  ];
  
  const addSkill = () => {
    if (newSkill.trim()) {
      const updatedSkills = [
        ...skills,
        { name: newSkill, level: selectedLevel },
      ];
      onUpdate?.(updatedSkills);
      setNewSkill('');
    }
  };
  
  const removeSkill = (index) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    onUpdate?.(updatedSkills);
  };
  
  const updateSkillLevel = (index, level) => {
    const updatedSkills = skills.map((skill, i) =>
      i === index ? { ...skill, level } : skill
    );
    onUpdate?.(updatedSkills);
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-secondary-900">Skills & Expertise</h3>
      
      {!readOnly && (
        <div className="flex gap-2">
          <Input
            placeholder="Add a new skill"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
            className="flex-1"
          />
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-3 py-2 rounded-lg border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {levels.map(level => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>
          <Button
            size="sm"
            variant="primary"
            icon={<FiPlus />}
            onClick={addSkill}
          >
            Add
          </Button>
        </div>
      )}
      
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {skills.map((skill, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="group relative"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary-100 rounded-full">
                <span className="text-sm text-secondary-700">{skill.name}</span>
                <div className="flex items-center gap-0.5">
                  {levels.map(level => (
                    <button
                      key={level.value}
                      onClick={() => !readOnly && updateSkillLevel(index, level.value)}
                      className={`transition-colors ${
                        skill.level === level.value
                          ? level.color
                          : 'bg-secondary-300'
                      } w-2 h-2 rounded-full mx-0.5 ${
                        !readOnly && 'cursor-pointer hover:opacity-80'
                      }`}
                      title={level.label}
                    />
                  ))}
                </div>
                {!readOnly && (
                  <button
                    onClick={() => removeSkill(index)}
                    className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX size={12} className="text-secondary-500 hover:text-error-500" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {skills.length === 0 && (
          <p className="text-sm text-secondary-500">No skills added yet</p>
        )}
      </div>
    </div>
  );
};

export default EmployeeSkills;
