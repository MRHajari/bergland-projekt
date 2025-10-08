// routes/userRegistrationRoutes.js
const express = require("express");
const router = express.Router();
const userRegistrationController = require("../controllers/userRegistrationController");

// ✅ GET alle UserRegistrierungen
router.get("/", userRegistrationController.findAll);

// ✅ GET einzelne UserRegistration
router.get("/:id", userRegistrationController.findById);

// ✅ POST neue Registrierung
router.post("/", userRegistrationController.create);

// ✅ DELETE Registrierung
router.delete("/:id", userRegistrationController.delete);

module.exports = router;
