const express = require("express");
const router = express.Router();
const relayTeamController = require("../controllers/relayTeamController");

router.post("/", relayTeamController.createRelayTeam);
router.get("/", relayTeamController.getAllRelayTeams);
router.get("/:id", relayTeamController.getRelayTeamById);
router.put("/:id", relayTeamController.updateRelayTeam);
router.delete("/:id", relayTeamController.deleteRelayTeam);

module.exports = router;
