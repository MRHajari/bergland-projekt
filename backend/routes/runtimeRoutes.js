const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const runtimeController = require("../controllers/runtimeController");

// Standard-CRUD
router.post("/", authenticateToken, runtimeController.createRuntime);
router.get("/", authenticateToken, runtimeController.getAllRuntimes);
router.get("/:id", authenticateToken, runtimeController.getRuntimeById);
router.put("/:id", authenticateToken, runtimeController.updateRuntime);
router.delete("/:id", authenticateToken, runtimeController.deleteRuntime);

// Erweiterte Abfragen
router.get("/person/:personId", authenticateToken, runtimeController.getByPerson);
router.get("/registration/:registrationId", authenticateToken, runtimeController.getByRegistration);

module.exports = router;
