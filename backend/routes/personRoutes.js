const express = require("express");
const router = express.Router();
const personController = require("../controllers/personController");
const { authenticateToken, authorizeAdmin } = require("../middlewares/authMiddleware");

// Lesen: nur für eingeloggte Benutzer (oder Admins)
router.get("/", authenticateToken, authorizeAdmin, personController.getAllPersons);
router.get("/:id", authenticateToken, authorizeAdmin, personController.getPersonById);

// Schreiben: nur Admins
router.post("/", authenticateToken, authorizeAdmin, personController.createPerson);
router.put("/:id", authenticateToken, authorizeAdmin, personController.updatePerson);
router.delete("/:id", authenticateToken, authorizeAdmin, personController.deletePerson);

module.exports = router;
