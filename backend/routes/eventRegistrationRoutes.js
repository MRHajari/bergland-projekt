const express = require("express");
const router = express.Router();
const eventRegistrationController = require("../controllers/eventRegistrationController");
const { authenticateToken, requireRole } = require("../middlewares/authMiddleware");
const { requirePersonAccess, requireRegistrationAccess } = require("../middlewares/ownershipMiddleware");

router.use(authenticateToken);

// ======================================================
// 🎟️ Event Registration Routes (bereinigt & konsistent)
// ======================================================

// ➕ Gruppenregistrierung erstellen
router.post(
    "/group",
    requirePersonAccess((req) => req.body?.registered_by_person_id),
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
    requireRole("admin", "timekeeper"),
    eventRegistrationController.getAllRegistrations
);

// 🔍 Registrierung nach ID (⚠️ MUSS ganz unten bleiben)
router.get(
    "/:id",
    requireRegistrationAccess((req) => req.params.id),
    eventRegistrationController.getRegistrationById
);

// 🔍 Registrierungen einer Person abrufen
router.get(
    "/person/:personId",
    requirePersonAccess((req) => req.params.personId),
    eventRegistrationController.getRegistrationsByPerson
);

// ✏️ Registrierung bearbeiten (nur Kopf-Daten)
router.put(
    "/:id",
    requireRegistrationAccess((req) => req.params.id),
    eventRegistrationController.updateRegistration
);

// ➕ Teilnehmer zu Registrierung hinzufügen
router.post(
    "/participant",
    requireRegistrationAccess((req) => req.body?.registration_id),
    requirePersonAccess((req) => req.body?.person_id),
    eventRegistrationController.addParticipant
);

// ✏️ Startnummer eines Teilnehmers ändern (Admin)
// PUT /event-registrations/participant/:participantId/start-number
router.put(
    "/participant/:participantId/start-number",
    requireRole("admin"),
    eventRegistrationController.updateParticipantStartNumber
);

// ❌ Registrierung löschen
router.delete("/participant/:participantId", eventRegistrationController.deleteParticipant);

router.delete(
    "/:id",
    requireRegistrationAccess((req) => req.params.id),
    eventRegistrationController.deleteRegistration
);

module.exports = router;
