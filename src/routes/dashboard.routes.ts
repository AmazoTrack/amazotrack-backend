import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
import { authMiddleware } from "../middlewares/auth.middlewares";

const router = Router();

router.use(authMiddleware);

router.get("/dashboard/summary", DashboardController.summary);

export default router;