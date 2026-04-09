import authService from '../services/auth.service.js';
import User from '../models/User.model.js';
import logger from '../utils/logger.js';
import { 
  loginValidator, 
  signupValidator, 
  changePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator 
} from '../validators/auth.validator.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// for avatar
import fs  from 'fs';
import multer from 'multer'
import path from 'path';

  // single method for avatar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/avatars';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

class AuthController {
   signup = catchAsync(async (req, res) => {
    const { error } = signupValidator.validate(req.body);
    if (error) {
      logger.warn(`Signup validation failed: ${error.details[0].message}`);
      throw new AppError(error.details[0].message, 400);
    }

    const result = await authService.signup(req.body);

    this.setRefreshTokenCookie(res, result.tokens.refreshToken);

    logger.info(`User signed up: ${result.user.email}`);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: result.user,
        employee: result.employee,
        accessToken: result.tokens.accessToken
      }
    });
  });

  login = catchAsync(async (req, res) => {
    const { error } = loginValidator.validate(req.body);
    if (error) {
      logger.warn(`Login validation failed: ${error.details[0].message}`);
      throw new AppError(error.details[0].message, 400);
    }

    const { email, password, rememberMe } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const result = await authService.login(email, password, ipAddress, rememberMe);

    this.setRefreshTokenCookie(res, result.tokens.refreshToken, rememberMe);

    logger.info(`User logged in: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken
      }
    });
  });

  getProfile = catchAsync(async (req, res) => {
    const userData = await authService.getProfile(req.user.id);
    
    res.status(200).json({
      success: true,
      data: userData
    });
  });

  updateProfile = catchAsync(async (req, res) => {
    logger.info(`Profile update request received for user: ${req.user.id}`, {
      body: Object.keys(req.body)
    });
    
    const allowedFields = ['profile', 'employeeDetails', 'personalInfo', 'email', 'bio'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    const updatedUser = await authService.updateProfile(req.user.id, updateData);
    
    logger.info(`Profile updated successfully for user: ${req.user.id}`);
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  });

  refreshToken = catchAsync(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      throw new AppError('Refresh token required', 401);
    }

    const tokens = await authService.refreshToken(refreshToken);

    this.setRefreshTokenCookie(res, tokens.refreshToken, tokens.rememberMe);

    res.status(200).json({
      success: true,
      data: {
        accessToken: tokens.accessToken
      }
    });
  });

  logout = catchAsync(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken) {
      await authService.logout(req.user.id, refreshToken);
    }

    // Clear cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  });

  changePassword = catchAsync(async (req, res) => {
    const { error } = changePasswordValidator.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const { currentPassword, newPassword } = req.body;

    await authService.changePassword(req.user.id, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  });

  forgotPassword = catchAsync(async (req, res) => {
    const { error } = forgotPasswordValidator.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    await authService.forgotPassword(req.body.email);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent if account exists'
    });
  });

  resetPassword = catchAsync(async (req, res) => {
    const { error } = resetPasswordValidator.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const { token } = req.params;
    const { password } = req.body;

    await authService.resetPassword(token, password);

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  });

  setRefreshTokenCookie(res, token, rememberMe = true) {
    const maxAge = rememberMe ? 7 * 24 * 60 * 60 * 1000 : undefined;
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      ...(maxAge ? { maxAge } : {})
    });
  }




  uploadAvatar = catchAsync(async (req, res) => {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }
    
    await User.findByIdAndUpdate(req.user.id, {
      'profile.avatar': req.file.filename
    });
    
    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatar: req.file.filename,
        url: `/uploads/avatars/${req.file.filename}`
      }
    });
  });


}

export default new AuthController();
