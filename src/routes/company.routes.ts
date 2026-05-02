import { Router } from "express";
import { CompanyController } from "../controllers/company.controller";
import { authMiddleware } from "../middlewares/auth.middlewares";

const router = Router();

router.use(authMiddleware);

// 🏢 ROTAS
router.post("/companies", CompanyController.create);
router.get("/companies", CompanyController.list);
router.get("/companies/:id", CompanyController.findById);
router.put("/companies/:id", CompanyController.update);
router.delete("/companies/:id", CompanyController.remove);

export default router;