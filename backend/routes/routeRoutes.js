// backend/routes/bookingRoutes.js
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const bookingController = require("../controllers/bookingController");

// ============================================================
// Buchungen API
// ============================================================

// Alle Buchungen (Admin)
router.get("/", authenticateToken, bookingController.getAllBookings);

// Alle Buchungen eines Benutzers
router.get("/user/:userId", authenticateToken, bookingController.getBookingsByUser);

// Buchungen nach Registrierung
router.get("/by-registration/:registrationId", authenticateToken, bookingController.getAllByRegistration);

// Einzelne Buchung
router.get("/:id", authenticateToken, bookingController.getBookingById);

// Neue Buchung
router.post("/", authenticateToken, bookingController.createBooking);

// Update
router.put("/:id", authenticateToken, bookingController.updateBooking);

// Löschen
router.delete("/:id", authenticateToken, bookingController.deleteBooking);

module.exports = router;
