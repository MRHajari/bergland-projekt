const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// ============================================================
// 🔹 AUTH ROUTES
// ============================================================

// Registrierung mit Mail-Verifikation
router.post("/register", authController.register);

// E-Mail-Verifikation (Link aus Mail)
router.get("/verify/:token", authController.verifyEmail);

// Login (nur wenn verifiziert)
router.post("/login", authController.login);

// Refresh Token
router.post("/refresh-token", authController.refreshToken);

// Logout
router.post("/logout", authController.logout);

module.exports = router;
