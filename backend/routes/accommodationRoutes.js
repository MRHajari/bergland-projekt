// backend/routes/accommodationRoutes.js
const express = require("express");
const router = express.Router();
const accommodationController = require("../controllers/accommodationController");

// ➕ Unterkunft erstellen (Admin)
router.post("/", accommodationController.createAccommodation);

// 📋 Alle Unterkünfte abrufen (mit optional event_id + user_id)
router.get("/", accommodationController.getAllAccommodations);

// 🔍 Einzelne Unterkunft abrufen
router.get("/:id", accommodationController.getAccommodationById);

// ✏️ Unterkunft aktualisieren
router.put("/:id", accommodationController.updateAccommodation);

// ❌ Unterkunft löschen
router.delete("/:id", accommodationController.deleteAccommodation);

module.exports = router;
