// backend/routes/eventRegistrationRoutes.js
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const eventRegistrationController = require("../controllers/eventRegistrationController");

// Reihenfolge beachten (spezifische zuerst)
router.post("/", authenticateToken, eventRegistrationController.createRegistration);
router.get("/", authenticateToken, eventRegistrationController.getAllRegistrations);
router.get("/event/:eventId", authenticateToken, eventRegistrationController.getByEvent);
router.get("/person/:personId", authenticateToken, eventRegistrationController.getByPerson);
router.get("/:id", authenticateToken, eventRegistrationController.getRegistrationById);
router.put("/:id", authenticateToken, eventRegistrationController.updateRegistration);
router.delete("/:id", authenticateToken, eventRegistrationController.deleteRegistration);

module.exports = router;
