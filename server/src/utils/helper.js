import crypto from 'crypto';

/**
 * Generate a random password
 * @param {number} length - Password length
 * @returns {string} Random password
 */
export const generateRandomPassword = (length = 10) => {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
};

/**
 * Format date to readable string
 * @param {Date} date - Date to format
 * @param {string} format - Format style
 * @returns {string} Formatted date
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day);
};

/**
 * Calculate pagination metadata
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {Object} Pagination metadata
 */
export const getPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages,
    hasNext,
    hasPrev,
    nextPage: hasNext ? page + 1 : null,
    prevPage: hasPrev ? page - 1 : null
  };
};

/**
 * Sanitize object by removing specified fields
 * @param {Object} obj - Object to sanitize
 * @param {Array} fields - Fields to remove
 * @returns {Object} Sanitized object
 */
export const sanitizeObject = (obj, fields = ['password', '__v']) => {
  const sanitized = { ...obj };
  fields.forEach(field => {
    if (sanitized.hasOwnProperty(field)) {
      delete sanitized[field];
    }
  });
  return sanitized;
};

/**
 * Extract query parameters for filtering
 * @param {Object} query - Request query object
 * @param {Array} allowedFields - Fields allowed for filtering
 * @returns {Object} Filter object
 */
export const filterQueryParams = (query, allowedFields) => {
  const filter = {};
  Object.keys(query).forEach(key => {
    if (allowedFields.includes(key)) {
      filter[key] = query[key];
    }
  });
  return filter;
};
