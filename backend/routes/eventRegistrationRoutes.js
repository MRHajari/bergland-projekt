const express = require("express");
const router = express.Router();
const eventRegistrationController = require("../controllers/eventRegistrationController");
const { authenticateToken } = require("../middlewares/authMiddleware");

// 🔒 Authentifizierte Routen
router.post("/", authenticateToken, eventRegistrationController.createEventRegistration);
router.get("/", eventRegistrationController.getAllEventRegistrations);
router.get("/:id", eventRegistrationController.getEventRegistrationById);
router.put("/:id", authenticateToken, eventRegistrationController.updateEventRegistration);
router.delete("/:id", authenticateToken, eventRegistrationController.deleteEventRegistration);
router.get('/user/:userId', authenticateToken, eventRegistrationController.getByUser);


module.exports = router;
