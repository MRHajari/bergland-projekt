const express = require("express");
const router = express.Router();
const eventRegistrationController = require("../controllers/eventRegistrationController");

// ======================================================
// 🎟️ Event Registration Routes
// ======================================================

// ➕ Gruppenregistrierung erstellen
router.post("/group", eventRegistrationController.createGroupRegistration);

// 🔍 Gruppen-Registrierungen eines Events
router.get("/group/event/:eventId", eventRegistrationController.getGroupByEvent);

// 🔍 Registrierungen eines Users
router.get("/user/:userId", eventRegistrationController.getByUserId);

// 📊 Anzahl aller Registrierungen pro Event abrufen (für Admin)
router.get("/count-by-event", eventRegistrationController.getCountByEvent);

// 📋 Alle Registrierungen
router.get("/", eventRegistrationController.getAllRegistrations);

// 🔍 Registrierung nach ID (⚠️ muss **ganz unten** bleiben)
router.get("/:id", eventRegistrationController.getRegistrationById);

// 🟢 Status ändern
router.put("/:id/status", eventRegistrationController.updateRegistrationStatus);

// ✏️ Registrierung bearbeiten
router.put("/:id", eventRegistrationController.updateRegistration);

// ❌ Registrierung löschen
router.delete("/:id", eventRegistrationController.deleteRegistration);

module.exports = router;
