import { Router } from "express";
import { login, getMe, logout, oauthLogin } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.post("/login", login);
router.post("/oauth", oauthLogin);
router.get("/me", authenticateToken, getMe);
router.post("/logout", authenticateToken, logout);

export default router;
