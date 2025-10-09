// backend/routes/eventRoutes.js
const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { authenticateToken, authorizeAdmin } = require("../middlewares/authMiddleware");

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
router.post("/", authenticateToken, authorizeAdmin, eventController.createEvent);

// ✏️ Event aktualisieren
router.put("/:id", authenticateToken, authorizeAdmin, eventController.updateEvent);

// 🗑️ Event löschen
router.delete("/:id", authenticateToken, authorizeAdmin, eventController.deleteEvent);

module.exports = router;
