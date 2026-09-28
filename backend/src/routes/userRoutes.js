import { Router } from "express";
import { getAll, getById, create, update, toggleStatus, remove } from "../controllers/userController.js";
import { authenticateToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = Router();

router.get("/", authenticateToken, requireRole(["Admin"]), getAll);
router.get("/:id", authenticateToken, requireRole(["Admin"]), getById);
router.post("/", authenticateToken, requireRole(["Admin"]), create);
router.put("/:id", authenticateToken, requireRole(["Admin"]), update);
router.patch("/:id/status", authenticateToken, requireRole(["Admin"]), toggleStatus);
router.delete("/:id", authenticateToken, requireRole(["Admin"]), remove);

export default router;
