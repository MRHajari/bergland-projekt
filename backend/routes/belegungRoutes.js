// backend/routes/belegungRoutes.js
const express = require("express");
const router = express.Router();
const belegungController = require("../controllers/belegungController");

// 🔹 CRUD
router.post("/", belegungController.createBelegung);
router.get("/", belegungController.getAllBelegungen);
router.get("/:id", belegungController.getBelegungById);
router.put("/:id", belegungController.updateBelegung);
router.delete("/:id", belegungController.deleteBelegung);

// ✅ Alle Belegungen (Anmeldungen) für ein bestimmtes Event abrufen
router.get("/event/:id", belegungController.getByEventId);

// ✅ Statistik: Anzahl Anmeldungen pro Event
router.get("/stats/count-by-event", belegungController.getCountByEvent);

module.exports = router;
