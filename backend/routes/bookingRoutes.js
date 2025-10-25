// backend/routes/bookingRoutes.js
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const bookingController = require("../controllers/bookingController");

// ============================================================
// ➕ Neue Buchung erstellen
// ============================================================
router.post("/", authenticateToken, bookingController.createBooking);

// ============================================================
// 📋 Alle Buchungen (Admin / Debug)
// ============================================================
router.get("/", authenticateToken, bookingController.getAllBookings);

// ============================================================
// 🔍 Buchung für bestimmte EventRegistration
// /api/bookings/by-registration/:registrationId
// ============================================================
router.get(
    "/by-registration/:registrationId",
    authenticateToken,
    bookingController.getByEventRegistration
);

// ============================================================
// ✨ NEU: Alle Buchungen für eine Registrierung (mehrere Unterkünfte möglich)
// /api/bookings/by-registration/:registrationId/all
// ============================================================
router.get(
    "/by-registration/:registrationId/all",
    authenticateToken, // ✅ korrigiert!
    bookingController.getAllByRegistration
);

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
