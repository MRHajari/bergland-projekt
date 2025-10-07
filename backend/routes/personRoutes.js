const express = require("express");
const router = express.Router();
const personController = require("../controllers/personController");
const { authenticateToken, authorizeAdmin } = require("../middlewares/authMiddleware");

// 🔹 Registrierung (öffentlich)
router.post("/register", personController.registerPerson);

// 🔹 Nur Admins können Personen sehen und bearbeiten
router.get("/", authenticateToken, authorizeAdmin, personController.getAllPersons);
router.get("/:id", authenticateToken, authorizeAdmin, personController.getPersonById);
router.post("/", authenticateToken, authorizeAdmin, personController.createPerson);
router.put("/:id", authenticateToken, authorizeAdmin, personController.updatePerson);
router.delete("/:id", authenticateToken, authorizeAdmin, personController.deletePerson);

module.exports = router;
