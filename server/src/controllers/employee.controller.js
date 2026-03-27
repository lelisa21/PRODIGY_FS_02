import employeeService from '../services/employee.service.js';
import { 
  createEmployeeValidator,
  updateEmployeeValidator 
} from '../validators/employee.validator.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import redisClient from '../utils/redisClient.js';

class EmployeeController {
  createEmployee = catchAsync(async (req, res) => {
    const { error } = createEmployeeValidator.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const employee = await employeeService.createEmployee(req.body);

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    });
  });

  getEmployee = catchAsync(async (req, res) => {
    const { id } = req.params;
    
    const employee = await employeeService.getEmployeeById(id, {
      populate: [
        { path: 'employmentDetails.manager', select: 'employmentDetails.employeeId user' },
        { path: 'performance.reviews.reviewedBy', select: 'profile' }
      ]
    });

    res.status(200).json({
      success: true,
      data: employee
    });
  });

  getAllEmployees = catchAsync(async (req, res) => {
    const result = await employeeService.getAllEmployees(req.query);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  });

  updateEmployee = catchAsync(async (req, res) => {
    const { error } = updateEmployeeValidator.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const { id } = req.params;
    const employee = await employeeService.updateEmployee(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });
  });

  deleteEmployee = catchAsync(async (req, res) => {
    const { id } = req.params;
    
    await employeeService.deleteEmployee(id);

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully'
    });
  });

  getDepartmentStats = catchAsync(async (req, res) => {
    const stats = await employeeService.getDepartmentStatistics();

    res.status(200).json({
      success: true,
      data: stats
    });
  });

  getOrganizationHierarchy = catchAsync(async (req, res) => {
    const hierarchy = await employeeService.getOrganizationHierarchy();

    res.status(200).json({
      success: true,
      data: hierarchy
    });
  });

  bulkImportEmployees = catchAsync(async (req, res) => {
    const { employees } = req.body;
    
    if (!Array.isArray(employees) || employees.length === 0) {
      throw new AppError('Please provide an array of employees', 400);
    }

    const results = await employeeService.bulkImport(employees);

    res.status(200).json({
      success: true,
      message: `Bulk import completed: ${results.success.length} succeeded, ${results.failed.length} failed`,
      data: results
    });
  });

  getEmployeeSkills = catchAsync(async (req, res) => {
    const { id } = req.params;
    
    const employee = await employeeService.getEmployeeById(id);
    
    res.status(200).json({
      success: true,
      data: employee.skills
    });
  });

  addEmployeeSkill = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { skill } = req.body;

    if (!skill || !skill.name || !skill.level) {
      throw new AppError('Skill must have name and level', 400);
    }

    const employee = await employeeService.getEmployeeById(id);
    
    const skillExists = employee.skills.some(s => s.name === skill.name);
    if (skillExists) {
      throw new AppError('Skill already exists for this employee', 400);
    }

    employee.skills.push(skill);
    await employee.save();

    // Update cache
    await redisClient.setEx(`employee:${id}`, 3600, JSON.stringify(employee));

    res.status(200).json({
      success: true,
      message: 'Skill added successfully',
      data: employee.skills
    });
  });

  getEmployeeDocuments = catchAsync(async (req, res) => {
    const { id } = req.params;
    
    const employee = await employeeService.getEmployeeById(id);
    
    res.status(200).json({
      success: true,
      data: employee.documents
    });
  });

  uploadDocument = catchAsync(async (req, res) => {
    const { id } = req.params;
    
    if (!req.file) {
      throw new AppError('Please upload a file', 400);
    }

    const employee = await employeeService.getEmployeeById(id);
    
    const document = {
      name: req.file.originalname,
      type: req.file.mimetype,
      url: `/uploads/${req.file.filename}`,
      uploadedAt: new Date()
    };

    employee.documents.push(document);
    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  });
}

export default new EmployeeController();
