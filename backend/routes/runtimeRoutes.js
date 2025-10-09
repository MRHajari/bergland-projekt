// backend/routes/runtimeRoutes.js
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const runtimeController = require("../controllers/runtimeController");

// ⚙️ Laufzeiten
router.post("/", authenticateToken, runtimeController.createRuntime);
router.get("/", authenticateToken, runtimeController.getAllRuntimes);
router.get("/registration/:registrationId", authenticateToken, runtimeController.getByRegistration);
router.get("/:id", authenticateToken, runtimeController.getRuntimeById);
router.put("/:id", authenticateToken, runtimeController.updateRuntime);
router.delete("/:id", authenticateToken, runtimeController.deleteRuntime);

module.exports = router;
