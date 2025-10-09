// backend/routes/routeRoutes.js
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const routeController = require("../controllers/routeController");

// ⚠️ Reihenfolge wichtig: spezialisierte Routen vor "/:id"
router.post("/", authenticateToken, routeController.createRoute);
router.get("/", authenticateToken, routeController.getAllRoutes);
router.get("/event/:eventId", authenticateToken, routeController.getRoutesByEvent);
router.get("/:id", authenticateToken, routeController.getRouteById);
router.put("/:id", authenticateToken, routeController.updateRoute);
router.delete("/:id", authenticateToken, routeController.deleteRoute);

module.exports = router;
