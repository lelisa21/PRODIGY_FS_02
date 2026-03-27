import { format, formatDistance, formatRelative } from 'date-fns';

export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), formatStr);
  } catch (error) {
    return 'Invalid date';
  }
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'MMM dd, yyyy HH:mm');
  } catch (error) {
    return 'Invalid date';
  }
};

export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  try {
    return formatDistance(new Date(date), new Date(), { addSuffix: true });
  } catch (error) {
    return 'Invalid date';
  }
};

export const formatRelativeDate = (date) => {
  if (!date) return 'N/A';
  try {
    return formatRelative(new Date(date), new Date());
  } catch (error) {
    return 'Invalid date';
  }
};

export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === undefined || amount === null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatNumber = (number, decimals = 0) => {
  if (number === undefined || number === null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

export const formatPercentage = (value, decimals = 1) => {
  if (value === undefined || value === null) return 'N/A';
  return `${value.toFixed(decimals)}%`;
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return 'N/A';
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};

export const truncateText = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return `${text.substring(0, length)}...`;
};

export const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

export const titleCase = (string) => {
  if (!string) return '';
  return string
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
