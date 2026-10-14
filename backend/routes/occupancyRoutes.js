// backend/routes/occupancyRoutes.js
const express = require("express");
const router = express.Router();
const { authenticateToken, requireRole } = require("../middlewares/authMiddleware");
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
router.post("/", authenticateToken, requireRole("admin"), occupancyController.createOccupancy);

// ============================================================
// ✏️ Belegung aktualisieren
// ============================================================
router.put("/:id", authenticateToken, requireRole("admin"), occupancyController.update);

// ============================================================
// ❌ Belegung löschen
// ============================================================
router.delete("/:id", authenticateToken, requireRole("admin"), occupancyController.delete);

// ============================================================
// 🔄 Zuordnungen (Event ↔ Unterkünfte) aktualisieren
// ============================================================
router.post(
    "/updateAssignments",
    authenticateToken,
    requireRole("admin"),
    occupancyController.updateAssignments
);

module.exports = router;
