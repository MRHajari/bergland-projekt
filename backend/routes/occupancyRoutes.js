const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const occupancyController = require("../controllers/occupancyController");

router.post("/", authenticateToken, occupancyController.createOccupancy);
router.get("/", authenticateToken, occupancyController.getAll);
router.get("/event/:eventId", authenticateToken, occupancyController.getByEvent);
router.put("/:id", authenticateToken, occupancyController.update);
router.delete("/:id", authenticateToken, occupancyController.delete);
router.post("/updateAssignments", authenticateToken, occupancyController.updateAssignments);


module.exports = router;
