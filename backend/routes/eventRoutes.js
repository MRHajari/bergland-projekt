// backend/routes/eventRoutes.js
const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { authenticateToken, authorizeAdmin } = require("../middlewares/authMiddleware");

// Jeder eingeloggte Nutzer darf Events sehen
router.get("/", authenticateToken, eventController.getAllEvents);
router.get("/:id", authenticateToken, eventController.getEventById);

// Nur Admin darf Events anlegen, ändern oder löschen
router.post("/", authenticateToken, authorizeAdmin, eventController.createEvent);
router.put("/:id", authenticateToken, authorizeAdmin, eventController.updateEvent);
router.delete("/:id", authenticateToken, authorizeAdmin, eventController.deleteEvent);

module.exports = router;
