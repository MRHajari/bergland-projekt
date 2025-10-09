// backend/routes/relPersonAddressRoutes.js
const express = require("express");
const router = express.Router();
const relPersonAddressController = require("../controllers/relPersonAddressController");
const { authenticateToken, authorizeAdmin } = require("../middlewares/authMiddleware");

// ============================================================
// 🔗 RelPersonAddress Routes
// ============================================================
router.get("/", authenticateToken, relPersonAddressController.getAll);
router.get("/:id", authenticateToken, relPersonAddressController.getById);
router.post("/", authenticateToken, authorizeAdmin, relPersonAddressController.create);
router.delete("/:id", authenticateToken, authorizeAdmin, relPersonAddressController.delete);

module.exports = router;
