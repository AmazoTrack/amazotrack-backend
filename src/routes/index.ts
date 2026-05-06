import { Router } from "express";
 
import authRoutes from "./auth.routes";
import wasteRoutes from "./waste.routes";
import companyRoutes from "./company.routes";
import movementRoutes from "./movement.routes";
import mtrRoutes from "./mtr.routes";
 
const router = Router();
 
router.use(authRoutes);
 
router.use(wasteRoutes);
router.use(companyRoutes);
router.use(movementRoutes);
router.use(mtrRoutes);
 
export default router;