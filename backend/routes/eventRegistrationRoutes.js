const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const eventRegistrationController = require("../controllers/eventRegistrationController");

// 📋 Alle Event-Registrierungen abrufen
router.get("/", authenticateToken, eventRegistrationController.getAllRegistrations);

// 🗑️ Registrierung einer bestimmten Person aus einem Event löschen
router.delete(
    "/:event_id/person/:person_id",
    authenticateToken,
    eventRegistrationController.deleteByPersonAndEvent
);

// 🔍 Registrierungen nach Person-ID abrufen
router.get(
    "/person/:personId",
    authenticateToken,
    eventRegistrationController.getByPersonId
);

// 🔍 Einzelne Registrierung nach ID abrufen
router.get("/:id", authenticateToken, eventRegistrationController.getRegistrationById);

// ➕ Neue Registrierung anlegen
router.post("/", authenticateToken, eventRegistrationController.createRegistration);

// ✏️ Registrierung aktualisieren
router.put("/:id", authenticateToken, eventRegistrationController.updateRegistration);

// ❌ Registrierung löschen (nach ID)
router.delete("/:id", authenticateToken, eventRegistrationController.deleteRegistration);

module.exports = router;
