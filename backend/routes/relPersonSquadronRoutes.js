const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const { requirePersonAccess } = require("../middlewares/ownershipMiddleware");
const relPersonSquadronController = require("../controllers/relPersonSquadronController");

// CRUD + spezielle Abfragen
router.post("/", authenticateToken, requirePersonAccess((req) => req.body?.person_id), relPersonSquadronController.addPersonToSquadron);
router.get("/", authenticateToken, relPersonSquadronController.getAllRelations);
router.get("/squadron/:squadronId", authenticateToken, relPersonSquadronController.getPersonsBySquadron);
router.get("/person/:personId", authenticateToken, requirePersonAccess((req) => req.params.personId), relPersonSquadronController.getSquadronsByPerson);
router.delete("/:id", authenticateToken, relPersonSquadronController.removeRelation);

module.exports = router;
