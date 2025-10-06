const express = require("express");
const router = express.Router();
const belegungController = require("../controllers/belegungController");

// 🟢 Erweiterte Routen
router.get("/event/:id", belegungController.getByEventId);
router.get("/stats/count-by-event", belegungController.getCountByEvent);
router.get("/user/:userId/event/:eventId", belegungController.getByUserAndEvent);
router.delete("/user/:userId/event/:eventId", belegungController.deleteByUserAndEvent);

// 🔹 Standard CRUD
router.post("/", belegungController.createBelegung);
router.get("/", belegungController.getAllBelegungen);
router.get("/:id", belegungController.getBelegungById);
router.put("/:id", belegungController.updateBelegung);
router.delete("/:id", belegungController.deleteBelegung);

module.exports = router;
