const express = require("express");
const router = express.Router();
const eventRegistrationController = require("../controllers/eventRegistrationController");

// ======================================================
// 🎟️ Event Registration Routes (bereinigt & konsistent)
// ======================================================

// ➕ Gruppenregistrierung erstellen
router.post(
    "/group",
    eventRegistrationController.createGroupRegistration
);

// 🔍 Gruppen-Registrierungen eines Events
router.get(
    "/group/event/:eventId",
    eventRegistrationController.getGroupByEvent
);

// 📋 Alle Registrierungen
router.get(
    "/",
    eventRegistrationController.getAllRegistrations
);

// 🔍 Registrierung nach ID (⚠️ MUSS ganz unten bleiben)
router.get(
    "/:id",
    eventRegistrationController.getRegistrationById
);

// 🔍 Registrierungen einer Person abrufen
router.get(
    "/person/:personId",
    eventRegistrationController.getRegistrationsByPerson
);

// ✏️ Registrierung bearbeiten (nur Kopf-Daten)
router.put(
    "/:id",
    eventRegistrationController.updateRegistration
);

// ➕ Teilnehmer zu Registrierung hinzufügen
router.post(
    "/participant",
    eventRegistrationController.addParticipant
);

// ✏️ Startnummer eines Teilnehmers ändern (Admin)
// PUT /event-registrations/participant/:participantId/start-number
router.put(
    "/participant/:participantId/start-number",
    eventRegistrationController.updateParticipantStartNumber
);

// ❌ Registrierung löschen
router.delete(
    "/:id",
    eventRegistrationController.deleteRegistration
);

module.exports = router;
