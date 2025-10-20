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

// 🟢 Nur Status aktualisieren (Admin)
router.put("/:id/status", authenticateToken, eventRegistrationController.updateRegistrationStatus);

// 🗑️ Person aus Event entfernen
router.delete("/:event_id/person/:person_id", authenticateToken, eventRegistrationController.deleteByPersonAndEvent);

// ❌ Registrierung löschen
router.delete("/:id", authenticateToken, eventRegistrationController.deleteRegistration);

// 🔍 Registrierungen nach Event-ID
router.get("/event/:eventId", authenticateToken, eventRegistrationController.getByEventId);

// 🧩 Gruppen-Registrierung
router.post("/group", authenticateToken, eventRegistrationController.createGroupRegistration);

// 🧩 Gruppen nach Event
router.get("/group/event/:eventId", authenticateToken, eventRegistrationController.getGroupByEvent);

// ➕ Teilnehmer zu bestehender Registrierung hinzufügen ✅
router.post("/participant", authenticateToken, eventRegistrationController.addParticipant);

// 🔍 Registrierungen nach User-ID
router.get("/user/:userId", authenticateToken, eventRegistrationController.getByUserId);

module.exports = router;
