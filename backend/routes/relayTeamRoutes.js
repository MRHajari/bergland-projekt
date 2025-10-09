// backend/routes/relayTeamRoutes.js
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const relayTeamController = require("../controllers/relayTeamController");

router.post("/", authenticateToken, relayTeamController.createRelayTeam);
router.get("/", authenticateToken, relayTeamController.getAllRelayTeams);
router.get("/event/:eventId", authenticateToken, relayTeamController.getByEvent);
router.get("/:id", authenticateToken, relayTeamController.getRelayTeamById);
router.put("/:id", authenticateToken, relayTeamController.updateRelayTeam);
router.delete("/:id", authenticateToken, relayTeamController.deleteRelayTeam);

module.exports = router;
