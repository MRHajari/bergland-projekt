const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const personController = require("../controllers/personController");

console.log("✅ Loaded personController keys:", Object.keys(personController));

// 🔹 Alle Personen (optional: ?owner_id=<uuid>)
router.get("/", authenticateToken, personController.getAll);

// 🔹 Eine Person nach ID
router.get("/:id", authenticateToken, personController.getPersonById);

// 🔹 Neue Person anlegen
router.post("/", authenticateToken, personController.create);

// 🔹 Person aktualisieren
router.put("/:id", authenticateToken, personController.updatePerson);

// 🔹 Person löschen
router.delete("/:id", authenticateToken, personController.deletePerson);

module.exports = router;
