const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const routeController = require("../controllers/routeController");

// ==============================
// ROUTE API
// ==============================

// Alle Strecken
router.get("/", authenticateToken, routeController.getAllRoutes);

// Strecken eines Events
router.get("/event/:eventId", authenticateToken, routeController.getRoutesByEvent);

// Einzelne Strecke
router.get("/:id", authenticateToken, routeController.getRouteById);

// Neue Strecke
router.post("/", authenticateToken, routeController.createRoute);

// Update
router.put("/:id", authenticateToken, routeController.updateRoute);

// Löschen
router.delete("/:id", authenticateToken, routeController.deleteRoute);

module.exports = router;
