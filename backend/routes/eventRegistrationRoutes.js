const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const eventRegistrationController = require("../controllers/eventRegistrationController");

/**
 * 🎟️ Event Registration Routes
 * Steuert CRUD-Operationen für Anmeldungen einer Person zu einem Event.
 * Nur authentifizierte Benutzer dürfen Änderungen vornehmen.
 */

// 📋 Alle Event-Registrierungen abrufen
// Optional: später Filter hinzufügen (?event_id=... oder ?person_id=...)
router.get("/", authenticateToken, eventRegistrationController.getAllRegistrations);

// 🔍 Einzelne Registrierung nach ID abrufen
router.get("/:id", authenticateToken, eventRegistrationController.getRegistrationById);

// ➕ Neue Registrierung anlegen
router.post("/", authenticateToken, eventRegistrationController.createRegistration);

// ✏️ Registrierung aktualisieren
router.put("/:id", authenticateToken, eventRegistrationController.updateRegistration);

// ❌ Registrierung löschen
router.delete("/:id", authenticateToken, eventRegistrationController.deleteRegistration);

module.exports = router;
