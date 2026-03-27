export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/signup',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    PROFILE: '/auth/profile',
  },
  EMPLOYEES: {
    BASE: '/employees',
    STATS: '/employees/stats/department',
    HIERARCHY: '/employees/hierarchy',
    BULK_IMPORT: '/employees/bulk/import',
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    PERFORMANCE: '/dashboard/performance',
    SALARY_DISTRIBUTION: '/dashboard/salary-distribution',
    RECENT_ACTIVITY: '/dashboard/recent-activity',
  },
};

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  HR: 'hr',
};

export const EMPLOYEE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ON_LEAVE: 'on_leave',
  PROBATION: 'probation',
  TERMINATED: 'terminated',
};

export const LEAVE_TYPES = {
  ANNUAL: 'annual',
  SICK: 'sick',
  PERSONAL: 'personal',
  UNPAID: 'unpaid',
  MATERNITY: 'maternity',
  PATERNITY: 'paternity',
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HALF_DAY: 'half_day',
  HOLIDAY: 'holiday',
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
};

export const DATE_FORMATS = {
  DEFAULT: 'MMM dd, yyyy',
  TIME: 'HH:mm',
  DATE_TIME: 'MMM dd, yyyy HH:mm',
  API: 'yyyy-MM-dd',
  DISPLAY: 'MM/dd/yyyy',
};
