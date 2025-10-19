// backend/routes/occupancy.routes.js
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const occupancyController = require("../controllers/occupancyController");

// 📋 Alle Belegungen (Admin-Übersicht)
router.get("/", authenticateToken, occupancyController.getAll);

// 🔍 Belegungen eines Events
router.get("/events/:eventId/occupancies", authenticateToken, occupancyController.getByEvent);

// ➕ Neue Belegung anlegen
router.post("/", authenticateToken, occupancyController.createOccupancy);

// ✏️ Belegung aktualisieren
router.put("/:id", authenticateToken, occupancyController.update);

// ❌ Belegung löschen
router.delete("/:id", authenticateToken, occupancyController.delete);

// 🔄 Belegungen (Unterkünfte) für ein Event neu zuweisen
router.post(
    "/updateAssignments",
    authenticateToken,
    occupancyController.updateAssignments
);

// backend/routes/occupancy.routes.js
router.get(
    "/events/:eventId/accommodations",
    authenticateToken,
    occupancyController.getAccommodationsByEvent
);


module.exports = router;
