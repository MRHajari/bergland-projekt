// backend/routes/accommodationRoutes.js
const express = require("express");
const router = express.Router();
const { authenticateToken, requireRole } = require("../middlewares/authMiddleware");
const accommodationController = require("../controllers/accommodationController");

// ======================================================
// ➕ Unterkunft erstellen (Admin)
// ======================================================
router.post("/", authenticateToken, requireRole("admin"), accommodationController.createAccommodation);

// ======================================================
// 📋 Alle Unterkünfte abrufen
// ======================================================
router.get("/", accommodationController.getAllAccommodations);

// ======================================================
// 🏨 Unterkünfte nach Event-ID (inkl. Verfügbarkeit)
// ======================================================
router.get(
    "/by-event/:eventId",
    authenticateToken,
    accommodationController.getAccommodationsByEvent
);

// ======================================================
// 🔍 Einzelne Unterkunft abrufen
// ======================================================
router.get("/:id", accommodationController.getAccommodationById);

// ======================================================
// ✏️ Unterkunft aktualisieren
// ======================================================
router.put("/:id", authenticateToken, requireRole("admin"), accommodationController.updateAccommodation);

// ======================================================
// ❌ Unterkunft löschen
// ======================================================
router.delete("/:id", authenticateToken, requireRole("admin"), accommodationController.deleteAccommodation);

module.exports = router;
