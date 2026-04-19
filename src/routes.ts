import { Router } from "express";
import { authMiddleware } from "./middlewares/auth.middlewares";
import { AuthController } from "./controllers/auth.controller";
import { WasteController } from "./controllers/waste.controller";
 
const router = Router();
 
router.post("/auth/register", AuthController.register);
router.post("/auth/login", AuthController.login);
router.get("/wastes", authMiddleware, WasteController.list);
router.post("/wastes", authMiddleware, WasteController.create);
router.get("/wastes/:id", authMiddleware, WasteController.findById);
router.put("/wastes/:id", authMiddleware, WasteController.update);
router.delete("/wastes/:id", authMiddleware, WasteController.remove);
 
export default router;