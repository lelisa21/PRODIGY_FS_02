import express from 'express';
import authMiddleware from '../middleware/auth.middleware';
import roleMiddleware from '../middleware/role.middleware';
import { createEmployee } from '../controllers/employee.controller';


const router = express.Router();

router.post("/" , authMiddleware, roleMiddleware("admin"), createEmployee)

router.put("/:id" , authMiddleware, roleMiddleware("admin"), updateEmployee)

router.delete("/:id" , authMiddleware, roleMiddleware("admin"), deleteEmployee)

router.get("/" , authMiddleware, roleMiddleware("admin", "user"), getEmployees)
router.get("/:id" , authMiddleware, roleMiddleware("admin", "user"), getEmployeeById)

export default router;
