// backend/routes/eventRegistrationRoutes.js
const express = require("express");
const router = express.Router();
const eventRegistrationController = require("../controllers/eventRegistrationController");
const { authenticateToken } = require("../middlewares/authMiddleware");

// ============================================================
// 🔹 Öffentliche / Benutzerbezogene Routen
// ============================================================

// ➕ Neue Anmeldung zu einem Event (z. B. durch eingeloggten User)
router.post("/", authenticateToken, eventRegistrationController.createEventRegistration);

// 📋 Alle Anmeldungen abrufen (optional: Admin oder eigene)
router.get("/", authenticateToken, eventRegistrationController.getAllEventRegistrations);

// 📋 Alle Anmeldungen einer bestimmten Person
router.get("/user/:userId", authenticateToken, eventRegistrationController.getByUser);

// 🔍 Einzelne Anmeldung per ID
router.get("/:id", authenticateToken, eventRegistrationController.getEventRegistrationById);

// ✏️ Anmeldung aktualisieren
router.put("/:id", authenticateToken, eventRegistrationController.updateEventRegistration);

// 🗑️ Anmeldung löschen
router.delete("/:id", authenticateToken, eventRegistrationController.deleteEventRegistration);

module.exports = router;
