const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const controller = require("../controllers/occupancyController");

router.post("/", authenticateToken, controller.createOccupancy);
router.get("/", authenticateToken, controller.getAll);
router.get("/event/:eventId", authenticateToken, controller.getByEvent);
router.put("/:id", authenticateToken, controller.update);
router.delete("/:id", authenticateToken, controller.delete);

module.exports = router;
