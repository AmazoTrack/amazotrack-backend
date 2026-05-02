import { Router } from "express";
import { MovementController } from "../controllers/movement.controller";
import { authMiddleware } from "../middlewares/auth.middlewares";

const router = Router();


router.use(authMiddleware);

// 🚛 ROTAS
router.post("/movements", MovementController.create);
router.get("/movements", MovementController.list);
router.get("/movements/:id", MovementController.findById);
router.delete("/movements/:id", MovementController.remove);

export default router;