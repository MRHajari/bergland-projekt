// backend/routes/occupancyRoutes.js
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const occupancyController = require("../controllers/occupancyController");

// ============================================================
// 📋 Alle Belegungen (Admin-Übersicht)
// ============================================================
router.get("/", authenticateToken, occupancyController.getAll);

// ============================================================
// 🔍 Belegungen eines Events (inkl. verfügbare Betten)
// ============================================================
router.get(
    "/events/:eventId/occupancies",
    authenticateToken,
    occupancyController.getByEvent
);

// ============================================================
// 🏨 Unterkünfte eines Events mit Belegungsinfo
// ============================================================
router.get(
    "/events/:eventId/accommodations",
    authenticateToken,
    occupancyController.getAccommodationsByEvent
);

// ============================================================
// ➕ Neue Belegung anlegen
// ============================================================
router.post("/", authenticateToken, occupancyController.createOccupancy);

// ============================================================
// ✏️ Belegung aktualisieren
// ============================================================
router.put("/:id", authenticateToken, occupancyController.update);

// ============================================================
// ❌ Belegung löschen
// ============================================================
router.delete("/:id", authenticateToken, occupancyController.delete);

// ============================================================
// 🔄 Zuordnungen (Event ↔ Unterkünfte) aktualisieren
// ============================================================
router.post(
    "/updateAssignments",
    authenticateToken,
    occupancyController.updateAssignments
);

module.exports = router;
