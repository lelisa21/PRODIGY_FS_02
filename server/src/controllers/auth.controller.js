import authService from '../services/auth.service.js';
import User from '../models/user.model.js';
import { 
  loginValidator, 
  signupValidator, 
  changePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator 
} from '../validators/auth.validator.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

class AuthController {
  signup = catchAsync(async (req, res) => {
    const { error } = signupValidator.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const result = await authService.signup(req.body);

    this.setRefreshTokenCookie(res, result.tokens.refreshToken);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken
      }
    });
  });

  login = catchAsync(async (req, res) => {
    const { error } = loginValidator.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const result = await authService.login(email, password, ipAddress);

    this.setRefreshTokenCookie(res, result.tokens.refreshToken);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken
      }
    });
  });

  refreshToken = catchAsync(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      throw new AppError('Refresh token required', 401);
    }

    const tokens = await authService.refreshToken(refreshToken);

    this.setRefreshTokenCookie(res, tokens.refreshToken);

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
    res.clearCookie('refreshToken');

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

  getProfile = catchAsync(async (req, res) => {
    res.status(200).json({
      success: true,
      data: req.user
    });
  });

  updateProfile = catchAsync(async (req, res) => {
    const allowedFields = ['profile', 'preferences'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field]) {
        updateData[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-refreshTokens');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  });

  setRefreshTokenCookie(res, token) {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });
  }
}

export default new AuthController();
