import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.model.js";
import AppError from "../utils/appError.js";
import logger from "../utils/logger.js";
import emailService from "./email.service.js";
import redisClient from "../utils/redisClient.js";
import Employee from "../models/Employee.model.js";
import activityLogService from "./activityLog.service.js";
import ActivityLog from "../models/ActivityLog.model.js";
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

    // Create Employee record
    const employee = await Employee.create({
      user: user._id,
      employmentDetails: {
        employeeId,
        hireDate: new Date(),
        employmentType: "full-time",
        department:
          userData.employeeDetails?.department || userData.department || "",
        position: userData.employeeDetails?.position || userData.position || "",
        workEmail: user.email,
        workLocation:
          userData.employeeDetails?.workLocation || userData.location || "",
        workPhone: userData.employeeDetails?.workPhone || userData.phone || "",
      },
      personalInfo: {
        bio: userData.profile?.bio || "",
        address: {
          city: userData.employeeDetails?.location || userData.location || "",
        },
      },
    });

    const { accessToken, refreshToken } = this.generateTokens(user);
    user.refreshTokens = [refreshToken];
    await user.save();

    await redisClient.set(`user:${user._id}`, user.toJSON(), 3600);

    await redisClient.set(`employee:${user._id}`, employee.toJSON(), 3600);

    await emailService.sendWelcomeEmail(user.email, user.profile.firstName);

    logger.info(`User signed up successfully: ${user.email}`, {
      userId: user._id,
      role: user.role,
      employeeId,
    });
    this.sendWelcomeEmailSafely(user.email, user.profile.firstName);
    return {
      user: user.toJSON(),
      employee: employee.toJSON(),
      tokens: { accessToken, refreshToken },
    };
  }

  async sendWelcomeEmailSafely(email, name) {
    try {
      const result = await emailService.sendWelcomeEmail(email, name);
      if (result.success) {
        logger.info(`Welcome email sent to ${email}`);
      } else {
        logger.warn(
          `Failed to send welcome email to ${email}: ${result.error}`,
        );
      }
    } catch (error) {
      // Catch any unexpected errors
      logger.error(
        `Unexpected error sending email to ${email}:`,
        error.message,
      );
    }
  }

  async login(email, password, ipAddress, rememberMe = true) {
    const user = await User.findOne({ email }).select(
      "+password +loginAttempts +lockUntil +refreshTokens",
    );

    if (!user) {
      logger.warn(`Login failed: User not found - ${email}`, { ipAddress });
      throw new AppError("Invalid email or password", 401);
    }

    if (user.isLocked) {
      logger.warn(`Login failed: Account locked - ${email}`, { ipAddress });
      throw new AppError(
        "Account is locked due to multiple failed login attempts. Please try again later.",
        423,
      );
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incLoginAttempts();
      logger.warn(`Login failed: Invalid password - ${email}`, { ipAddress });
      throw new AppError("Invalid email or password", 401);
    }

    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();

    const {
      accessToken,
      refreshToken,
      rememberMe: tokenRememberMe,
    } = this.generateTokens(user, rememberMe);

    if (user.refreshTokens) user.refreshTokens = [];
    user.refreshTokens.push(refreshToken);
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }
    await user.save();

    // Get employee data
    const employee = await Employee.findOne({ user: user._id });

    await redisClient.set(`user:${user._id}`, user.toJSON(), 3600);

    if (employee) {
      await redisClient.set(`employee:${user._id}`, employee.toJSON(), 3600);
    }
    await activityLogService.log({
      userId: user._id,
      action: "LOGIN",
      resource: "USER",
      resourceId: user._id,
      details: {
        description: `${user.profile.firstName} ${user.profile.lastName} logged in`,
        targetName: `${user.profile.firstName} ${user.profile.lastName}`,
        targetId: user._id,
      },
      status: "SUCCESS",
    });

    logger.info(`User logged in successfully: ${user.email}`, {
      userId: user._id,
      role: user.role,
      ipAddress,
      rememberMe,
    });

    const userResponse = user.toJSON();
    if (employee) {
      userResponse.employeeData = employee.toJSON();
    }

    return {
      user: userResponse,
      tokens: { accessToken, refreshToken, rememberMe: tokenRememberMe },
    };
  }

  async demoLogin(ipAddress, rememberMe = true) {
    const demoUser = await this.ensurePlatformDemoData();
    return this.login(demoUser.email, process.env.DEMO_USER_PASSWORD || "GreatTeamDemo123!", ipAddress, rememberMe);
  }

  async ensurePlatformDemoData() {
    const demoEmail = process.env.DEMO_USER_EMAIL || "demo@greatteam.com";
    const demoPassword = process.env.DEMO_USER_PASSWORD || "GreatTeamDemo123!";
    const existingDemo = await User.findOne({ email: demoEmail });

    if (existingDemo) {
      const employeeCount = await Employee.countDocuments({
        "employmentDetails.employeeId": /^DEMO-/,
      });

      if (employeeCount >= 8) {
        return existingDemo;
      }
    }

    const demoAdmin = existingDemo || await User.create({
      email: demoEmail,
      password: demoPassword,
      role: "admin",
      profile: {
        firstName: "Demo",
        lastName: "Demo",
        phone: "+1 555 014 2026",
        avatar: "avatar.png",
        bio: "Demo admin account for exploring GreatTeam EMS workflows.",
        location: "Remote",
      },
      employeeDetails: {
        employeeId: "DEMO-ADMIN",
        department: "People Operations",
        position: "Demo Workspace Admin",
        joinDate: new Date("2024-01-08"),
        salary: 145000,
      },
      status: "active",
      lastLogin: new Date(),
    });

    await Employee.findOneAndUpdate(
      { user: demoAdmin._id },
      {
        user: demoAdmin._id,
        employmentDetails: {
          employeeId: "DEMO-ADMIN",
          hireDate: new Date("2024-01-08"),
          employmentType: "full-time",
          department: "People Operations",
          position: "Demo Workspace Admin",
          workLocation: "Remote",
          workEmail: demoEmail,
          workPhone: "+1 555 014 2026",
        },
        personalInfo: {
          nationality: "Demo",
          address: {
            city: "San Francisco",
            state: "CA",
            country: "United States",
          },
        },
        compensation: {
          salary: 145000,
          payFrequency: "monthly",
        },
        skills: [
          { name: "Product Evaluation", level: "expert", yearsOfExperience: 8 },
          { name: "HR Analytics", level: "advanced", yearsOfExperience: 5 },
        ],
        attendance: {
          totalLeaves: 24,
          leavesTaken: 3,
          lateDays: 0,
          absentDays: 0,
        },
        performance: {
          currentRating: 4.8,
          lastReviewDate: new Date("2026-03-15"),
          nextReviewDate: new Date("2026-09-15"),
          reviews: [
            {
              date: new Date("2026-03-15"),
              rating: 4.8,
              comments: "Demo admin account prepared for platform exploration.",
              reviewedBy: demoAdmin._id,
            },
          ],
        },
        status: "active",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const demoEmployees = [
      ["Avery", "Chen", "Engineering", "Senior Full-Stack Engineer", 138000, 4.7, ["React", "Node.js", "MongoDB"]],
      ["Maya", "Patel", "Engineering", "Frontend Engineer", 118000, 4.5, ["Accessibility", "React", "Design Systems"]],
      ["Jordan", "Rivera", "Product", "Product Manager", 126000, 4.6, ["Roadmapping", "Analytics", "Stakeholder Management"]],
      ["Samira", "Hassan", "People Operations", "HR Business Partner", 104000, 4.4, ["Employee Relations", "Onboarding", "Compliance"]],
      ["Noah", "Williams", "Sales", "Enterprise Account Executive", 132000, 4.3, ["Pipeline Management", "Negotiation", "Forecasting"]],
      ["Lina", "Okafor", "Finance", "Financial Analyst", 98000, 4.2, ["Forecasting", "Excel", "Reporting"]],
      ["Ethan", "Brooks", "Security", "Security Engineer", 142000, 4.8, ["Audit Logging", "IAM", "Incident Response"]],
      ["Sofia", "Martinez", "Customer Success", "Customer Success Manager", 96000, 4.1, ["Retention", "Customer Health", "Training"]],
      ["Daniel", "Kim", "Operations", "Operations Lead", 110000, 4.3, ["Process Design", "Dashboards", "Vendor Management"]],
      ["Grace", "Morgan", "Data", "People Analytics Lead", 130000, 4.7, ["SQL", "Workforce Planning", "Data Visualization"]],
    ];

    for (const [index, employee] of demoEmployees.entries()) {
      const [firstName, lastName, department, position, salary, rating, skills] = employee;
      const email = `demo.${firstName.toLowerCase()}.${lastName.toLowerCase()}@greatteam.com`;
      const employeeId = `DEMO-${String(index + 1).padStart(3, "0")}`;

      const user = await User.findOneAndUpdate(
        { email },
        {
          email,
          role: index < 3 ? "manager" : "employee",
          profile: {
            firstName,
            lastName,
            phone: `+1 555 010 ${String(index).padStart(2, "0")}`,
            avatar: "avatar.png",
            bio: `${position} in the demo workspace.`,
            location: index % 2 === 0 ? "Remote" : "Hybrid",
          },
          employeeDetails: {
            employeeId,
            department,
            position,
            joinDate: new Date(2024, index % 12, 12),
            salary,
          },
          status: index === 8 ? "inactive" : "active",
          lastLogin: new Date(Date.now() - index * 86400000),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      if (!user.password) {
        user.password = demoPassword;
        await user.save();
      }

      await Employee.findOneAndUpdate(
        { user: user._id },
        {
          user: user._id,
          employmentDetails: {
            employeeId,
            hireDate: new Date(2024, index % 12, 12),
            employmentType: index === 8 ? "contract" : "full-time",
            department,
            position,
            workLocation: index % 2 === 0 ? "Remote" : "Hybrid",
            workEmail: email,
            workPhone: `+1 555 010 ${String(index).padStart(2, "0")}`,
          },
          compensation: {
            salary,
            payFrequency: "monthly",
          },
          skills: skills.map((name, skillIndex) => ({
            name,
            level: skillIndex === 0 ? "expert" : "advanced",
            yearsOfExperience: 3 + skillIndex + index,
          })),
          attendance: {
            totalLeaves: 24,
            leavesTaken: (index % 6) + 2,
            lateDays: index % 3,
            absentDays: index % 2,
          },
          performance: {
            currentRating: rating,
            lastReviewDate: new Date("2026-03-15"),
            nextReviewDate: new Date("2026-09-15"),
            reviews: [
              {
                date: new Date("2025-09-15"),
                rating: Math.max(3.8, rating - 0.2),
                comments: "Strong delivery against role expectations.",
                reviewedBy: demoAdmin._id,
              },
              {
                date: new Date("2026-03-15"),
                rating,
                comments: "Clear growth, measurable impact, and reliable collaboration.",
                reviewedBy: demoAdmin._id,
              },
            ],
          },
          status: index === 8 ? "inactive" : "active",
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    }

    const demoActivityCount = await ActivityLog.countDocuments({ resourceId: demoAdmin._id });
    if (demoActivityCount < 8) {
      const actions = [
        ["CREATE", "EMPLOYEE", "Created onboarding profile for Avery Chen"],
        ["UPDATE", "EMPLOYEE", "Updated Engineering performance review cycle"],
        ["VIEW", "REPORT", "Viewed payroll distribution report"],
        ["CREATE", "MESSAGE", "Posted team announcement for Q2 planning"],
        ["UPDATE", "SETTINGS", "Refined role-based access settings"],
        ["VIEW", "DASHBOARD", "Reviewed workforce analytics dashboard"],
        ["CREATE", "REPORT", "Generated department headcount summary"],
        ["LOGIN", "USER", "Demo workspace prepared"],
      ];

      await ActivityLog.insertMany(actions.map(([action, resource, description]) => ({
        user: demoAdmin._id,
        action,
        resource,
        resourceId: demoAdmin._id,
        details: {
          description,
          targetName: "Demo Workspace",
          targetId: demoAdmin._id,
        },
        ipAddress: "demo-session",
        userAgent: "Demo seed",
        status: "SUCCESS",
      })));
    }

    return demoAdmin;
  }

  async updateProfile(userId, updateData) {
    logger.info(`Updating profile for user: ${userId}`, {
      updateData: Object.keys(updateData),
    });

    // Update User model
    const user = await User.findById(userId);
    if (!user) {
      logger.error(`User not found for profile update: ${userId}`);
      throw new AppError("User not found", 404);
    }

    // Update User profile fields
    if (updateData.profile) {
      user.profile = {
        ...user.profile.toObject(),
        ...updateData.profile,
      };
    }

    // Update email if provided
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({ email: updateData.email });
      if (existingUser && existingUser._id.toString() !== userId) {
        logger.warn(`Email already in use: ${updateData.email}`, { userId });
        throw new AppError("Email already in use", 400);
      }
      user.email = updateData.email;
    }

    await user.save();
    logger.info(`User model updated for: ${user.email}`, { userId });

    // Update Employee model
    let employee = await Employee.findOne({ user: userId });

    if (!employee) {
      // Create employee record if it doesn't exist
      logger.info(`Creating new employee record for user: ${userId}`);
      employee = new Employee({
        user: userId,
        employmentDetails: {
          employeeId: await this.generateEmployeeId(),
          hireDate: new Date(),
          employmentType: "full-time",
          workEmail: user.email,
          department: updateData.employeeDetails?.department || "",
          position: updateData.employeeDetails?.position || "",
          workLocation:
            updateData.employeeDetails?.location ||
            updateData.employeeDetails?.workLocation ||
            "",
        },
      });
    }

    // Update employment details
    if (updateData.employeeDetails) {
      employee.employmentDetails = {
        ...employee.employmentDetails,
        department:
          updateData.employeeDetails.department ||
          employee.employmentDetails.department,
        position:
          updateData.employeeDetails.position ||
          employee.employmentDetails.position,
        workLocation:
          updateData.employeeDetails.location ||
          updateData.employeeDetails.workLocation ||
          employee.employmentDetails.workLocation,
        workPhone:
          updateData.employeeDetails.workPhone ||
          employee.employmentDetails.workPhone,
      };
    }

    // Update personal info
    if (updateData.personalInfo) {
      employee.personalInfo = {
        ...employee.personalInfo,
        ...updateData.personalInfo,
      };
    }

    // Handle bio if provided in root or in profile
    if (updateData.bio) {
      employee.personalInfo.bio = updateData.bio;
    }

    if (updateData.profile?.bio) {
      employee.personalInfo.bio = updateData.profile.bio;
    }

    await employee.save();
    logger.info(`Employee model updated for user: ${userId}`, {
      department: employee.employmentDetails.department,
      hasBio: !!employee.personalInfo.bio,
    });

    // Update caches
    await redisClient.del(`user:${userId}`);
    await redisClient.del(`employee:${userId}`);

    await redisClient.set(`user:${user._id}`, user.toJSON(), 3600);

    await redisClient.set(`employee:${userId}`, employee.toJSON(), 3600);

    logger.info(`Caches updated for user: ${userId}`);

    // Prepare response
    const userResponse = user.toJSON();
    delete userResponse.refreshTokens;
    delete userResponse.password;

    userResponse.employeeData = employee.toJSON();

    logger.info(`Profile update completed for: ${user.email}`);

    return userResponse;
  }

  async getProfile(userId) {
    logger.info(`Fetching profile for user: ${userId}`);

    const user = await User.findById(userId).select("-refreshTokens -password");
    if (!user) {
      logger.error(`User not found: ${userId}`);
      throw new AppError("User not found", 404);
    }

    const employee = await Employee.findOne({ user: userId });

    const userResponse = user.toJSON();
    if (employee) {
      userResponse.employeeData = employee.toJSON();
    }

    logger.info(`Profile retrieved for: ${user.email}`);

    return userResponse;
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
      return this.generateEmployeeId();
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

    await redisClient.del(`user:${userId}`);

    logger.info(
      `User ${user.email} changed password at ${new Date().toISOString()}`,
    );

    await emailService.sendPasswordChangeNotification(
      user.email,
      user.profile.firstName,
    );

    return { success: true };
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

      const tokens = this.generateTokens(user, rememberMe);

      user.refreshTokens = user.refreshTokens.filter(
        (token) => token !== refreshToken,
      );
      user.refreshTokens.push(tokens.refreshToken);
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
    await redisClient.del(`user:${userId}`);
    await redisClient.del(`employee:${userId}`);

    logger.info(`User ${userId} logged out at ${new Date().toISOString()}`);
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) return;

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

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
}

export default new AuthService();
