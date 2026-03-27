import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces');

export const phoneSchema = z.string()
  .regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, 'Invalid phone number')
  .optional();

export const validateEmail = (email) => {
  return emailSchema.safeParse(email);
};

export const validatePassword = (password) => {
  return passwordSchema.safeParse(password);
};

export const validateName = (name) => {
  return nameSchema.safeParse(name);
};

export const validatePhone = (phone) => {
  return phoneSchema.safeParse(phone);
};

export const validateEmployee = (data) => {
  const employeeSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    department: z.string().min(1, 'Department is required'),
    position: z.string().min(1, 'Position is required'),
    joinDate: z.string().optional(),
    salary: z.number().positive().optional(),
  });
  
  return employeeSchema.safeParse(data);
};

export const validateLogin = (data) => {
  const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
  });
  
  return loginSchema.safeParse(data);
};

export const validateRegister = (data) => {
  const registerSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    department: z.string().min(1, 'Department is required'),
    position: z.string().min(1, 'Position is required'),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
  
  return registerSchema.safeParse(data);
};
