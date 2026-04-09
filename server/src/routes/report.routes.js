import express from "express";
import { exportReport } from "../controllers/report.controller.js";

const router = express.Router();

router.get("/export", exportReport);

export default router;
