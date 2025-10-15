const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const eventRegistrationController = require("../controllers/eventRegistrationController");

// 📊 Anzahl der Registrierungen pro Event (muss VOR :id stehen!)
router.get("/count-by-event", authenticateToken, eventRegistrationController.getCountByEvent);

// 📋 Alle Event-Registrierungen
router.get("/", authenticateToken, eventRegistrationController.getAllRegistrations);

// 🔍 Registrierungen nach Person-ID
router.get("/person/:personId", authenticateToken, eventRegistrationController.getByPersonId);

// 🔍 Einzelne Registrierung
router.get("/:id", authenticateToken, eventRegistrationController.getRegistrationById);

// ➕ Neue Registrierung
router.post("/", authenticateToken, eventRegistrationController.createRegistration);

// ✏️ Registrierung aktualisieren
router.put("/:id", authenticateToken, eventRegistrationController.updateRegistration);

// 🗑️ Person aus Event entfernen
router.delete("/:event_id/person/:person_id", authenticateToken, eventRegistrationController.deleteByPersonAndEvent);

// ❌ Registrierung löschen
router.delete("/:id", authenticateToken, eventRegistrationController.deleteRegistration);

module.exports = router;
