import crypto from "crypto";
import Employee from "../models/Employee.model.js";
import User from "../models/user.model.js";
import redisClient from "../config/redis.js";
import logger from "../utils/logger.js";
import AppError from "../utils/appError.js";
import emailService from "./email.service.js";

class EmployeeService {
  async createEmployee(employeeData) {
    let user = null;
    let tempPassword = null;

    if (employeeData.user) {
      user = await User.findById(employeeData.user);
      if (!user) {
        throw new AppError("User not found", 404);
      }
    } else if (employeeData.userProfile) {
      const email =
        employeeData.userEmail ||
        employeeData.userProfile.email ||
        employeeData.employmentDetails?.workEmail;

      if (!email) {
        throw new AppError("User email is required", 400);
      }

      user = await User.findOne({ email });

      if (!user) {
        tempPassword =
          employeeData.userPassword || this.generateTempPassword();

        user = await User.create({
          email,
          password: tempPassword,
          profile: {
            firstName: employeeData.userProfile.firstName,
            lastName: employeeData.userProfile.lastName,
            phone: employeeData.userProfile.phone,
            avatar: employeeData.userProfile.avatar,
          },
          role: employeeData.userRole || "employee",
        });

        try {
          await emailService.sendWelcomeEmail(
            user.email,
            user.profile.firstName,
            tempPassword,
          );
        } catch (error) {
          logger.warn(`Welcome email failed for ${user.email}: ${error.message}`);
        }
      }

      employeeData.user = user._id;
    }

    if (!employeeData.user) {
      throw new AppError("User is required to create an employee", 400);
    }

    const existingEmployee = await Employee.findOne({
      user: employeeData.user,
    });
    if (existingEmployee) {
      throw new AppError("Employee already exists for this user", 400);
    }

    if (!employeeData.employmentDetails?.employeeId) {
      employeeData.employmentDetails.employeeId =
        await this.generateEmployeeId();
    }

    if (!employeeData.employmentDetails?.workEmail && user?.email) {
      employeeData.employmentDetails = {
        ...employeeData.employmentDetails,
        workEmail: user.email,
      };
    }

    if (!employeeData.compensation) {
      employeeData.compensation = { salary: 0 };
    }

    // Remove non-employee fields
    delete employeeData.userProfile;
    delete employeeData.userEmail;
    delete employeeData.userPassword;
    delete employeeData.userRole;

    let employee = await Employee.create(employeeData);
    employee = await employee.populate("user", "email profile role status");

    if (user) {
      user.employeeDetails = {
        ...user.employeeDetails,
        employeeId: employee.employmentDetails.employeeId,
        department: employee.employmentDetails.department,
        position: employee.employmentDetails.position,
        joinDate: employee.employmentDetails.hireDate,
      };
      await user.save();
    }

    // Cache employee
    await redisClient.setEx(
      `employee:${employee._id}`,
      3600,
      JSON.stringify(employee),
    );

    logger.info(`Employee created: ${employee.employmentDetails.employeeId}`);

    return { employee, tempPassword };
  }

  async getEmployeeById(id, options = {}) {
    // Check cache
    const cached = await redisClient.get(`employee:${id}`);
    if (cached && !options.skipCache) {
      return JSON.parse(cached);
    }

    // Build query
    let query = Employee.findById(id).populate(
      "user",
      "email profile role status",
    );

    if (options.populate) {
      query = query.populate(options.populate);
    }

    const employee = await query;

    if (!employee) {
      throw new AppError("Employee not found", 404);
    }

    // Cache for 1 hour
    await redisClient.setEx(`employee:${id}`, 3600, JSON.stringify(employee));

    return employee;
  }

  async getAllEmployees(queryParams) {
    const {
      page = 1,
      limit = 10,
      sort = "-createdAt",
      department,
      position,
      employmentType,
      search,
      minRating,
      ...filters
    } = queryParams;

    // Build filter
    const filter = {};

    if (department) filter["employmentDetails.department"] = department;
    if (position) filter["employmentDetails.position"] = position;
    if (employmentType)
      filter["employmentDetails.employmentType"] = employmentType;
    if (minRating)
      filter["performance.currentRating"] = { $gte: parseFloat(minRating) };

    if (search) {
      filter.$or = [
        { "employmentDetails.employeeId": new RegExp(search, "i") },
        { "employmentDetails.workEmail": new RegExp(search, "i") },
        { "skills.name": new RegExp(search, "i") },
      ];
    }

    // Calculate skip
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute queries in parallel
    const [employees, total] = await Promise.all([
      Employee.find(filter)
        .populate("user", "email profile status")
        .populate(
          "employmentDetails.manager",
          "employmentDetails.employeeId user",
        )
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Employee.countDocuments(filter),
    ]);

    return {
      data: employees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  async updateEmployee(id, updateData) {
    const { userProfile, userEmail } = updateData;

    delete updateData.userProfile;
    delete updateData.userEmail;

    let employee = await Employee.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    ).populate("user", "email profile role");

    if (!employee) {
      throw new AppError("Employee not found", 404);
    }

    if (userProfile || userEmail) {
      const userUpdate = {};
      if (userEmail) {
        userUpdate.email = userEmail;
      }
      if (userProfile) {
        userUpdate.profile = {
          ...employee.user.profile,
          ...userProfile,
        };
      }
      await User.findByIdAndUpdate(employee.user._id, userUpdate, {
        new: true,
        runValidators: true,
      });
      employee = await Employee.findById(employee._id).populate(
        "user",
        "email profile role",
      );
    }

    // Update cache
    await redisClient.setEx(`employee:${id}`, 3600, JSON.stringify(employee));

    if (
      updateData.employmentDetails?.department ||
      updateData.employmentDetails?.position
    ) {
      await User.findByIdAndUpdate(employee.user._id, {
        "employeeDetails.department": employee.employmentDetails.department,
        "employeeDetails.position": employee.employmentDetails.position,
      });
    }

    logger.info(`Employee updated: ${employee.employmentDetails.employeeId}`);

    return employee;
  }

  async deleteEmployee(id) {
    const employee = await Employee.findById(id);

    if (!employee) {
      throw new AppError("Employee not found", 404);
    }

    await employee.deleteOne();

    // Clear cache
    await redisClient.del(`employee:${id}`);

    // Update user
    await User.findByIdAndUpdate(employee.user, {
      "employeeDetails.employeeId": null,
      "employeeDetails.department": null,
      "employeeDetails.position": null,
    });

    logger.info(`Employee deleted: ${employee.employmentDetails.employeeId}`);
  }

  async getDepartmentStatistics() {
    const stats = await Employee.aggregate([
      {
        $group: {
          _id: "$employmentDetails.department",
          totalEmployees: { $sum: 1 },
          avgSalary: { $avg: "$compensation.salary" },
          minSalary: { $min: "$compensation.salary" },
          maxSalary: { $max: "$compensation.salary" },
          avgRating: { $avg: "$performance.currentRating" },
          totalLeaves: { $sum: "$attendance.totalLeaves" },
          leavesTaken: { $sum: "$attendance.leavesTaken" },
        },
      },
      {
        $project: {
          department: "$_id",
          totalEmployees: 1,
          avgSalary: { $round: ["$avgSalary", 2] },
          minSalary: 1,
          maxSalary: 1,
          avgRating: { $round: ["$avgRating", 1] },
          utilizationRate: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$leavesTaken", { $max: ["$totalLeaves", 1] }] },
                  100,
                ],
              },
              1,
            ],
          },
        },
      },
      { $sort: { department: 1 } },
    ]);

    return stats;
  }

  async getOrganizationHierarchy() {
    // Get all employees with manager relationships
    const employees = await Employee.find()
      .populate("user", "profile")
      .populate(
        "employmentDetails.manager",
        "employmentDetails.employeeId user",
      )
      .lean();

    // Build tree structure
    const employeeMap = new Map();
    const roots = [];

    // First pass: create map
    employees.forEach((emp) => {
      employeeMap.set(emp._id.toString(), {
        ...emp,
        children: [],
      });
    });

    // Second pass: build tree
    employees.forEach((emp) => {
      const employee = employeeMap.get(emp._id.toString());
      if (emp.employmentDetails.manager) {
        const manager = employeeMap.get(
          emp.employmentDetails.manager._id.toString(),
        );
        if (manager) {
          manager.children.push(employee);
        }
      } else {
        roots.push(employee);
      }
    });

    return roots;
  }

  async generateEmployeeId() {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    const employeeId = `EMP${year}${random}`;

    // Check if exists
    const existing = await Employee.findOne({
      "employmentDetails.employeeId": employeeId,
    });

    if (existing) {
      return this.generateEmployeeId();
    }

    return employeeId;
  }

  generateTempPassword() {
    const token = crypto.randomBytes(4).toString("hex");
    return `Temp${token}!`;
  }

  async bulkImport(employeesData) {
    const results = {
      success: [],
      failed: [],
    };

    for (const empData of employeesData) {
      try {
        // Check if user exists
        const user = await User.findOne({ email: empData.email });

        if (!user) {
          // Create user first
          const newUser = await User.create({
            email: empData.email,
            password: empData.password || "Temp123!",
            profile: {
              firstName: empData.firstName,
              lastName: empData.lastName,
              phone: empData.phone,
            },
            role: "employee",
          });

          empData.user = newUser._id;
        } else {
          empData.user = user._id;
        }

        // Create employee
        const result = await this.createEmployee({
          user: empData.user,
          employmentDetails: {
            employeeId: empData.employeeId,
            hireDate: empData.hireDate || new Date(),
            employmentType: empData.employmentType || "full-time",
            department: empData.department,
            position: empData.position,
            workEmail: empData.email,
            workPhone: empData.workPhone,
          },
          personalInfo: {
            dateOfBirth: empData.dateOfBirth,
            gender: empData.gender,
            address: empData.address,
          },
          compensation: {
            salary: empData.salary,
            payFrequency: empData.payFrequency || "monthly",
          },
          skills: empData.skills || [],
        });

        results.success.push({
          employeeId: result.employee.employmentDetails.employeeId,
          email: empData.email,
        });
      } catch (error) {
        results.failed.push({
          email: empData.email,
          error: error.message,
        });
      }
    }

    return results;
  }
}

export default new EmployeeService();
