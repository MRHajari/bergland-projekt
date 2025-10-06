// backend/routes/belegungRoutes.js
const express = require("express");
const router = express.Router();
const belegungController = require("../controllers/belegungController");

// Standard-CRUD-Routen
router.post("/", belegungController.createBelegung);
router.get("/", belegungController.getAllBelegungen);
router.get("/:id", belegungController.getBelegungById);
router.put("/:id", belegungController.updateBelegung);
router.delete("/:id", belegungController.deleteBelegung);

module.exports = router;
