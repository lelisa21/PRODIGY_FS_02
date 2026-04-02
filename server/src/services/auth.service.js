import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.model.js";
import AppError from "../utils/appError.js";
import logger from "../utils/logger.js";
import emailService from "./email.service.js";
import redisClient from "../utils/redisClient.js";

class AuthService {
  async signup(userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError("Email already in use", 400);
    }
    const employeeId = await this.generateEmployeeId();

    const user = await User.create({
      ...userData,
      employeeDetails: {
        ...userData.employeeDetails,
        department: userData.department || userData.employeeDetails?.department,
        position: userData.position || userData.employeeDetails?.position,
        employeeId,
      },
    });

    //    generate token
    const { accessToken, refreshToken } = this.generateTokens(user);
    user.refreshTokens = [refreshToken];
    await user.save();

    // cache user
    await redisClient.setEx(
      `user:${user._id}`,
      3600,
      JSON.stringify(user.toJSON()),
    );

    // send welcome email
    await emailService.sendWelcomeEmail(user.email, user.profile.firstName);

    return {
      user: user.toJSON(),
      tokens: { accessToken, refreshToken },
    };
  }

  async login(email, password, ipAddress, rememberMe = true) {
    const user = await User.findOne({ email }).select(
      "+password +loginAttempts +lockUntil +refreshTokens",
    );

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }
    // check if account is locked
    if (user.isLocked) {
      throw new AppError(
        "Account is locked due to multiple failed login attempts. Please try again later.",
        423,
      );
    }
    //   verify password
    const isPasswrordValid = await user.comparePassword(password);
    if (!isPasswrordValid) {
      await user.incLoginAttempts();
      throw new AppError("Invalid email or password", 401);
    }
    // reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();

    // generate tokens
    const { accessToken, refreshToken, rememberMe: tokenRememberMe } = this.generateTokens(user, rememberMe);
    // manage refresh tokens
    if (user.refreshTokens) user.refreshTokens = [];
    user.refreshTokens.push(refreshToken);
    if (user.refreshTokens.length > 5) {
      // keep only the last 5 token
      user.refreshTokens = user.refreshTokens.slice(-5);
    }
    await user.save();

    // cache user
    await redisClient.setEx(
      `user:${user._id}`,
      3600,
      JSON.stringify(user.toJSON()),
    );

    // login activity
    logger.info(
      `User ${user.email} logged in from IP ${ipAddress} at ${new Date().toISOString()}`,
    );

    return {
      user: user.toJSON(),
      tokens: { accessToken, refreshToken, rememberMe: tokenRememberMe },
    };
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const rememberMe = Boolean(decoded?.rm);

      const user = await User.findById(decoded.id).select("+refreshTokens");
      if (!user) {
        throw new AppError("User not found", 404);
      }
      if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
        throw new AppError("Invalid refresh token", 401);
      }
      //    generate new tokens
      const tokens = this.generateTokens(user, rememberMe);
      // remove old refresh token and add new one
      user.refreshTokens = user.refreshTokens.filter(
        (token) => token !== refreshToken,
      );
      user.refreshTokens.push(tokens.refreshToken);
      // keep only the last 5 tokens
      if (user.refreshTokens.length > 5) {
        user.refreshTokens = user.refreshTokens.slice(-5);
      }
      await user.save();

      return { ...tokens, rememberMe };
    } catch (error) {
      throw new AppError("Invalid refresh token", 401);
    }
  }

  async logout(userId, refreshToken) {
    const user = await User.findById(userId).select("+refreshTokens");
    if (user && user.refreshTokens) {
      user.refreshTokens = user.refreshTokens.filter(
        (token) => token !== refreshToken,
      );
      await user.save();
    }
    // invalid cache
    await redisClient.del(`user:${userId}`);

    logger.info(`User ${userId} logged out at ${new Date().toISOString()}`);
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AppError("Current password is incorrect", 401);
    }
    user.password = newPassword;
    user.refreshTokens = [];
    user.passwordChangedAt = new Date();
    await user.save();

    // invalid cache
    await redisClient.del(`user:${userId}`);

    logger.info(
      `User ${user.email} changed password at ${new Date().toISOString()}`,
    );

    // send notification email
    await emailService.sendPasswordChangeNotification(
      user.email,
      user.profile.firstName,
    );

    logger.info(`Password change notification sent to ${user.email}`);
  }
  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) return; // do not reveal if email exists

    // generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // send reset email
    await emailService.sendPasswordResetEmail(
      user.email,
      user.profile.firstName,
      resetToken,
    );

    logger.info(`Password reset email requested to ${user.email}`);
  }

  async resetPassword(token, newPassword) {
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: resetTokenHash,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError("Invalid or expired reset token", 400);
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = [];
    user.passwordChangedAt = new Date();
    await user.save();

    await redisClient.del(`user:${user._id}`);

    logger.info(`User ${user.email} reset their password`);
  }

  generateTokens(user, rememberMe = true) {
    const accessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );
    const refreshToken = jwt.sign(
      { id: user._id, rm: rememberMe ? 1 : 0 },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "15d",
      },
    );
    return { accessToken, refreshToken, rememberMe };
  }
  async generateEmployeeId() {
    const year = new Date().getFullYear().toString().slice(-2);
    const random = crypto.randomBytes(3).toString("hex").toUpperCase();
    const employeeId = `EMP${year}${random}`;
    const existing = await User.findOne({
      "employeeDetails.employeeId": employeeId,
    });
    if (existing) {
      return this.generateEmployeeId(); // regenerate if collision
    }
    return employeeId;
  }
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new AppError("Invalid or expired token", 401);
    }
  }
}

export default new AuthService();
