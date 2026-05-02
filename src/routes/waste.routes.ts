import { Router } from "express";

const router = Router();

// exemplo básico
router.get("/wastes", (req, res) => {
  return res.json({ message: "Waste route OK" });
});

export default router;