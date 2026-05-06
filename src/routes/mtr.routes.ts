import { Router } from "express";
import { MtrController } from "../controllers/mtr.controller";
import { authMiddleware } from "../middlewares/auth.middlewares";
 
const router = Router();
 
router.use(authMiddleware);
 
router.post("/mtrs", MtrController.create);
router.get("/mtrs", MtrController.list);
router.get("/mtrs/:id", MtrController.findById);
 
export default router;