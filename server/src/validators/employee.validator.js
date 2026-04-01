import Joi from 'joi';

export const createEmployeeValidator = Joi.object({
  user: Joi.string().optional(),
  userEmail: Joi.string().email().optional(),
  userPassword: Joi.string().min(8).optional(),
  userRole: Joi.string().valid('admin', 'manager', 'employee').optional(),
  userProfile: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.string().optional(),
    avatar: Joi.string().optional()
  }).optional(),
  employmentDetails: Joi.object({
    employeeId: Joi.string().optional(),
    hireDate: Joi.date().default(Date.now),
    employmentType: Joi.string().valid('full-time', 'part-time', 'contract', 'intern').default('full-time'),
    department: Joi.string().required(),
    position: Joi.string().required(),
    manager: Joi.string().optional(),
    workLocation: Joi.string().optional(),
    workEmail: Joi.string().email().required(),
    workPhone: Joi.string().optional()
  }).required(),
  personalInfo: Joi.object({
    dateOfBirth: Joi.date().optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional(),
    maritalStatus: Joi.string().valid('single', 'married', 'divorced', 'widowed').optional(),
    nationality: Joi.string().optional(),
    address: Joi.object({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      country: Joi.string().optional(),
      postalCode: Joi.string().optional()
    }).optional(),
    emergencyContact: Joi.object({
      name: Joi.string().optional(),
      relationship: Joi.string().optional(),
      phone: Joi.string().optional(),
      email: Joi.string().email().optional()
    }).optional()
  }).optional(),
  compensation: Joi.object({
    salary: Joi.number().min(0).default(0),
    payFrequency: Joi.string().valid('hourly', 'weekly', 'bi-weekly', 'monthly').default('monthly'),
    bankDetails: Joi.object({
      bankName: Joi.string().optional(),
      accountNumber: Joi.string().optional(),
      routingNumber: Joi.string().optional()
    }).optional()
  }).default(),
  skills: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      level: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert').required(),
      yearsOfExperience: Joi.number().min(0).optional()
    })
  ).optional(),
  status: Joi.string().valid('active', 'inactive', 'on_leave', 'probation').optional()
}).or('user', 'userProfile');

export const updateEmployeeValidator = Joi.object({
  userEmail: Joi.string().email().optional(),
  userProfile: Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    phone: Joi.string().optional(),
    avatar: Joi.string().optional()
  }).optional(),
  employmentDetails: Joi.object({
    department: Joi.string().optional(),
    position: Joi.string().optional(),
    manager: Joi.string().optional(),
    workLocation: Joi.string().optional(),
    workPhone: Joi.string().optional(),
    workEmail: Joi.string().email().optional(),
    hireDate: Joi.date().optional(),
    employmentType: Joi.string().valid('full-time', 'part-time', 'contract', 'intern').optional()
  }).optional(),
  personalInfo: Joi.object({
    dateOfBirth: Joi.date().optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional(),
    maritalStatus: Joi.string().valid('single', 'married', 'divorced', 'widowed').optional(),
    nationality: Joi.string().optional(),
    address: Joi.object({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      country: Joi.string().optional(),
      postalCode: Joi.string().optional()
    }).optional(),
    emergencyContact: Joi.object({
      name: Joi.string().optional(),
      relationship: Joi.string().optional(),
      phone: Joi.string().optional(),
      email: Joi.string().email().optional()
    }).optional()
  }).optional(),
  compensation: Joi.object({
    salary: Joi.number().min(0).optional(),
    payFrequency: Joi.string().valid('hourly', 'weekly', 'bi-weekly', 'monthly').optional(),
    bankDetails: Joi.object({
      bankName: Joi.string().optional(),
      accountNumber: Joi.string().optional(),
      routingNumber: Joi.string().optional()
    }).optional()
  }).optional(),
  skills: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      level: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert').required(),
      yearsOfExperience: Joi.number().min(0).optional()
    })
  ).optional(),
  attendance: Joi.object({
    leavesTaken: Joi.number().min(0).optional(),
    lateDays: Joi.number().min(0).optional(),
    absentDays: Joi.number().min(0).optional()
  }).optional(),
  performance: Joi.object({
    currentRating: Joi.number().min(1).max(5).optional(),
    lastReviewDate: Joi.date().optional(),
    nextReviewDate: Joi.date().optional()
  }).optional(),
  status: Joi.string().valid('active', 'inactive', 'on_leave', 'probation').optional()
}).min(1); // At least one field to update
