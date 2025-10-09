// backend/routes/squadronRoutes.js
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const squadronController = require("../controllers/squadronController");

router.post("/", authenticateToken, squadronController.createSquadron);
router.get("/", authenticateToken, squadronController.getAllSquadrons);
router.get("/event/:eventId", authenticateToken, squadronController.getByEvent);
router.get("/:id", authenticateToken, squadronController.getSquadronById);
router.put("/:id", authenticateToken, squadronController.updateSquadron);
router.delete("/:id", authenticateToken, squadronController.deleteSquadron);

module.exports = router;
