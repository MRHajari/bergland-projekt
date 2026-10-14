// backend/routes/eventRouteRoutes.js
const express = require("express");
const router = express.Router();
const { authenticateToken, requireRole } = require("../middlewares/authMiddleware");
const c = require("../controllers/eventRouteController");

router.get("/", authenticateToken, c.getAllEventRoutes);
router.get("/event/:eventId", authenticateToken, c.getEventRoutesByEvent);
router.post("/", authenticateToken, requireRole("admin"), c.createEventRoute);
router.post("/bulk/:eventId", authenticateToken, requireRole("admin"), c.bulkAssign);
router.delete("/:id", authenticateToken, requireRole("admin"), c.deleteEventRoute);

module.exports = router;

