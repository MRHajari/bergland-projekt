const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const personController = require("../controllers/personController");

/**
 * Person Routes
 * Unterstützt optionalen Filter nach owner_id (z. B. ?owner_id=<uuid>)
 */

// Alle Personen (optional: ?owner_id=<uuid>)
router.get("/", authenticateToken, personController.getAllPersons);

// Eine Person nach ID
router.get("/:id", authenticateToken, personController.getPersonById);

// Neue Person anlegen
router.post("/", authenticateToken, personController.createPerson);

// Person aktualisieren
router.put("/:id", authenticateToken, personController.updatePerson);

// Person löschen
router.delete("/:id", authenticateToken, personController.deletePerson);

module.exports = router;
