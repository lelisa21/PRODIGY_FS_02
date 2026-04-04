import express from 'express';
import employeeController from '../controllers/employee.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

router.use(protect);

// Public routes (accessible by all authenticated users)
router.get('/', employeeController.getAllEmployees);
router.get('/stats/department', employeeController.getDepartmentStats);
router.get('/hierarchy', employeeController.getOrganizationHierarchy);
router.get('/:id', employeeController.getEmployee);
router.get('/:id/skills', employeeController.getEmployeeSkills);
router.get('/:id/documents', employeeController.getEmployeeDocuments);

// Restricted routes
router.post('/', restrictTo('admin'), employeeController.createEmployee);
router.patch('/:id', restrictTo('admin', 'manager'), employeeController.updateEmployee);
router.delete('/:id', restrictTo('admin'), employeeController.deleteEmployee);

router.post('/bulk/import', restrictTo('admin'), employeeController.bulkImportEmployees);

// Skills
router.post('/:id/skills', restrictTo('admin', 'manager'), employeeController.addEmployeeSkill);
router.patch('/:id/skills', restrictTo('admin', 'manager'), employeeController.updateEmployeeSkills); 

// Documents
router.post('/:id/documents', restrictTo('admin', 'manager', 'employee'), upload.single('document'), employeeController.uploadDocument);
router.delete('/:id/documents/:documentId', restrictTo('admin', 'manager', 'employee'), employeeController.deleteDocument); 

export default router;
