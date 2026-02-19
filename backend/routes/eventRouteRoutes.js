// backend/routes/eventRouteRoutes.js
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const c = require("../controllers/eventRouteController");

router.get("/", authenticateToken, c.getAllEventRoutes);
router.get("/event/:eventId", authenticateToken, c.getEventRoutesByEvent);
router.post("/", authenticateToken, c.createEventRoute);
router.post("/bulk/:eventId", authenticateToken, c.bulkAssign);
router.delete("/:id", authenticateToken, c.deleteEventRoute);

module.exports = router;

