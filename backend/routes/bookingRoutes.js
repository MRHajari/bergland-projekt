// backend/routes/bookingRoutes.js
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const bookingController = require("../controllers/bookingController");

// ============================================================
// 🆕 Buchung erstellen
// ============================================================
router.post("/", authenticateToken, bookingController.createBooking);

// ============================================================
// 📋 Alle Buchungen (Admin / Debug)
// ============================================================
router.get("/", authenticateToken, bookingController.getAllBookings);

// ============================================================
// 👤 Alle Buchungen eines bestimmten Users
// /api/bookings/user/:userId
// ============================================================
router.get("/user/:userId", authenticateToken, bookingController.getByUser);

// ============================================================
// 📅 Alle Buchungen eines bestimmten Events (Admin)
// /api/bookings/event/:eventId
// ============================================================
router.get("/event/:eventId", authenticateToken, bookingController.getByEvent);

// ============================================================
// 🔍 Einzelne Buchung per ID
// ============================================================
router.get("/:id", authenticateToken, bookingController.getBookingById);

// ============================================================
// ✏️ Buchung aktualisieren
// ============================================================
router.put("/:id", authenticateToken, bookingController.updateBooking);

// ============================================================
// ❌ Buchung löschen
// ============================================================
router.delete("/:id", authenticateToken, bookingController.deleteBooking);

module.exports = router;
