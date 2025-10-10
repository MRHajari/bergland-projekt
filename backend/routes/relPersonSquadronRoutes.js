const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const relPersonSquadronController = require("../controllers/relPersonSquadronController");

// CRUD + spezielle Abfragen
router.post("/", authenticateToken, relPersonSquadronController.addPersonToSquadron);
router.get("/", authenticateToken, relPersonSquadronController.getAllRelations);
router.get("/squadron/:squadronId", authenticateToken, relPersonSquadronController.getPersonsBySquadron);
router.get("/person/:personId", authenticateToken, relPersonSquadronController.getSquadronsByPerson);
router.delete("/:id", authenticateToken, relPersonSquadronController.removeRelation);

module.exports = router;
