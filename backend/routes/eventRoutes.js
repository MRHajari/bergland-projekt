const express = require("express");
const router = express.Router();

const eventController = require("../controllers/eventController");
const { authenticateToken, requireRole } = require("../middlewares/authMiddleware");

// ============================================================
// 🔹 Öffentliche Routen (sichtbar für alle Benutzer)
// ============================================================

// 📅 Alle Events abrufen
router.get("/", eventController.getAllEvents);

// 📅 Event nach ID abrufen
router.get("/:id", eventController.getEventById);

// ============================================================
// 🔐 Admin-Routen (CRUD geschützt)
// ============================================================

// ➕ Neues Event erstellen
router.post(
    "/",
    authenticateToken,
    requireRole("admin"),
    eventController.createEvent
);

// ✏️ Event aktualisieren
router.put(
    "/:id",
    authenticateToken,
    requireRole("admin"),
    eventController.updateEvent
);

// 🗑️ Event löschen
router.delete(
    "/:id",
    authenticateToken,
    requireRole("admin"),
    eventController.deleteEvent
);

// ============================================================
// 🏨 Unterkünfte (Occupancies) für ein Event abrufen
// ============================================================
const { getByEvent } = require("../controllers/occupancyController");
router.get("/:eventId/occupancies", authenticateToken, getByEvent);

module.exports = router;
