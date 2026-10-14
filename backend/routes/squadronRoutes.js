// backend/routes/squadronRoutes.js
const express = require("express");
const router = express.Router();
const { authenticateToken, requireRole } = require("../middlewares/authMiddleware");
const squadronController = require("../controllers/squadronController");

router.post("/", authenticateToken, squadronController.createSquadron);
router.get("/", authenticateToken, squadronController.getAllSquadrons);
router.get("/event/:eventId", authenticateToken, squadronController.getByEvent);
router.get("/:id", authenticateToken, squadronController.getSquadronById);
router.put("/:id", authenticateToken, requireRole("admin"), squadronController.updateSquadron);
router.delete("/:id", authenticateToken, requireRole("admin"), squadronController.deleteSquadron);

module.exports = router;
