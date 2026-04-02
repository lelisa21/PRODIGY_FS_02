import  { useState } from 'react';
import { FiChevronDown, FiChevronRight, FiUser } from 'react-icons/fi';
import { clsx } from 'clsx';

const TreeNode = ({ node, level = 0, onSelect }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  
  return (
    <div className="relative">
      <div
        className={clsx(
          'flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors',
          'hover:bg-secondary-50',
          level > 0 && 'ml-6'
        )}
        onClick={() => onSelect?.(node)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="p-0.5 hover:bg-secondary-200 rounded"
          >
            {expanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
          </button>
        )}
        {!hasChildren && <div className="w-5" />}
        
        <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary-500 to-primary-600 flex items-center justify-center">
          <FiUser size={14} className="text-white" />
        </div>
        
        <div>
          <p className="text-sm font-medium text-secondary-900">{node.name}</p>
          <p className="text-xs text-secondary-500">{node.position}</p>
        </div>
      </div>
      
      {hasChildren && expanded && (
        <div className="ml-4 border-l-2 border-secondary-200">
          {node.children.map((child, index) => (
            <TreeNode
              key={index}
              node={child}
              level={level + 1}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const EmployeeHierarchy = ({ hierarchy, onSelectEmployee, loading = false }) => {
  if (loading) {
    return <div className="skeleton h-96 rounded-lg" />;
  }
  
  if (!hierarchy) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-500">No hierarchy data available</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-4">
      <h3 className="text-lg font-semibold text-secondary-900 mb-4">Organization Hierarchy</h3>
      <div className="overflow-y-auto max-h-125">
        <TreeNode node={hierarchy} onSelect={onSelectEmployee} />
      </div>
    </div>
  );
};

export default EmployeeHierarchy;
