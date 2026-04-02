import Joi from 'joi';

export const signupValidator = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters',
    'any.required': 'Password is required'
  }),
  profile: Joi.object({
    firstName: Joi.string().required().messages({
      'any.required': 'First name is required'
    }),
    lastName: Joi.string().required().messages({
      'any.required': 'Last name is required'
    }),
    phone: Joi.string().optional(),
    avatar: Joi.string().optional()
  }).required(),
   department: Joi.string().optional(),
   position: Joi.string().optional()
});

export const loginValidator = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  rememberMe: Joi.boolean().optional()
});

export const changePasswordValidator = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required()
});

export const forgotPasswordValidator = Joi.object({
  email: Joi.string().email().required()
});

export const resetPasswordValidator = Joi.object({
  password: Joi.string().min(8).required()
});
