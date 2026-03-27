import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  FiFile, FiUpload, FiDownload, FiTrash2, 
  FiFileText, FiImage, FiArchive, FiX 
} from 'react-icons/fi';
import { formatDate } from '../../utils/formatters';
import Button from '../common/Button';

const EmployeeDocuments = ({ documents = [], onUpload, onDelete, readOnly = false }) => {
  const [uploading, setUploading] = useState(false);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (onUpload && !readOnly) {
        setUploading(true);
        await onUpload(acceptedFiles);
        setUploading(false);
      }
    },
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/msword': ['.doc', '.docx'],
    },
    disabled: readOnly,
  });
  
  const getFileIcon = (type) => {
    if (type.includes('pdf')) return <FiFileText className="text-error-500" />;
    if (type.includes('image')) return <FiImage className="text-primary-500" />;
    if (type.includes('zip') || type.includes('archive')) return <FiArchive className="text-warning-500" />;
    return <FiFile className="text-secondary-500" />;
  };
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-secondary-900">Documents</h3>
      
      {!readOnly && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-secondary-300 hover:border-primary-400'
          }`}
        >
          <input {...getInputProps()} />
          <FiUpload className="mx-auto text-3xl text-secondary-400 mb-2" />
          <p className="text-sm text-secondary-600">
            {isDragActive
              ? 'Drop files here...'
              : 'Drag & drop files here, or click to select'}
          </p>
          <p className="text-xs text-secondary-500 mt-1">
            Supported: PDF, Images, Word Documents (Max 10MB)
          </p>
        </div>
      )}
      
      <div className="space-y-2">
        <AnimatePresence>
          {documents.map((doc, index) => (
            <motion.div
              key={doc.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {getFileIcon(doc.type)}
                <div>
                  <p className="text-sm font-medium text-secondary-900">{doc.name}</p>
                  <p className="text-xs text-secondary-500">
                    {formatFileSize(doc.size)} • Uploaded {formatDate(doc.uploadedAt)}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {doc.url && (
                  <a
                    href={doc.url}
                    download
                    className="p-1.5 text-secondary-500 hover:text-primary-600 transition-colors"
                  >
                    <FiDownload size={16} />
                  </a>
                )}
                {!readOnly && (
                  <button
                    onClick={() => onDelete?.(doc.id)}
                    className="p-1.5 text-secondary-500 hover:text-error-600 transition-colors"
                  >
                    <FiTrash2 size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {documents.length === 0 && (
          <p className="text-center text-sm text-secondary-500 py-4">
            No documents uploaded yet
          </p>
        )}
      </div>
      
      {uploading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-3" />
            <p className="text-secondary-700">Uploading documents...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDocuments;
