import { Router } from "express";

const router = Router();

// exemplo básico
router.post("/login", (req, res) => {
  return res.json({ message: "Login route OK" });
});

export default router;