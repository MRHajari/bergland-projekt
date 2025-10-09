// backend/routes/addressRoutes.js
const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");
const { authenticateToken, authorizeAdmin } = require("../middlewares/authMiddleware");

// ============================================================
// 🧭 Address Routes
// ============================================================
router.get("/", authenticateToken, addressController.getAll);
router.get("/:id", authenticateToken, addressController.getById);
router.post("/", authenticateToken, authorizeAdmin, addressController.create);
router.put("/:id", authenticateToken, authorizeAdmin, addressController.update);
router.delete("/:id", authenticateToken, authorizeAdmin, addressController.delete);

module.exports = router;
