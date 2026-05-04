import { Router } from "express";
import { WasteController } from "../controllers/waste.controller";
import { authMiddleware } from "../middlewares/auth.middlewares";

const router = Router();

router.use(authMiddleware);

router.get("/wastes", WasteController.list);
router.post("/wastes", WasteController.create);
router.get("/wastes/:id", WasteController.findById);
router.put("/wastes/:id", WasteController.update);
router.delete("/wastes/:id", WasteController.remove);

export default router;
