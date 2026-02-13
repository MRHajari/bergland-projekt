const express = require("express");
const router = express.Router();

const { authenticateToken, requireRole } = require("../middlewares/authMiddleware");
const runtimeController = require("../controllers/runtimeController");

// -----------------------------------------------------
// 🔒 Nur Timekeeper & Admin dürfen Laufzeiten verwalten
// -----------------------------------------------------

// ➕ Neue Laufzeit
router.post(
    "/",
    authenticateToken,
    requireRole("timekeeper", "admin"),
    runtimeController.createRuntime
);

// 📋 Alle Laufzeiten
router.get(
    "/",
    authenticateToken,
    requireRole("timekeeper", "admin"),
    runtimeController.getAllRuntimes
);

// 🔍 Laufzeit nach Anmeldung
router.get(
    "/registration/:registrationId",
    authenticateToken,
    requireRole("timekeeper", "admin"),
    runtimeController.getByRegistration
);

// 🔍 Einzelne Laufzeit
router.get(
    "/:id",
    authenticateToken,
    requireRole("timekeeper", "admin"),
    runtimeController.getRuntimeById
);

// ✏️ Aktualisieren
router.put(
    "/:id",
    authenticateToken,
    requireRole("timekeeper", "admin"),
    runtimeController.updateRuntime
);

// ❌ Löschen
router.delete(
    "/:id",
    authenticateToken,
    requireRole("timekeeper", "admin"),
    runtimeController.deleteRuntime
);

module.exports = router;
