// backend/routes/bookingRoutes.js
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const bookingController = require("../controllers/bookingController");
const { requireBookingAccess, requireRegistrationAccess } = require("../middlewares/ownershipMiddleware");

// ============================================================
// ➕ Neue Buchung erstellen
// ============================================================
router.post("/", authenticateToken, requireRegistrationAccess((req) => req.body?.event_registration_id), bookingController.createBooking);

// ============================================================
// 📋 Alle Buchungen (Admin / Debug)
// ============================================================
router.get("/", authenticateToken, bookingController.getAllBookings);

// ============================================================
// 👤 Alle Buchungen eines Benutzers (über alle Events)
// /api/bookings/by-user/:userId
// ============================================================
router.get(
    "/by-user/:userId",
    authenticateToken,
    bookingController.getBookingsByUser
);


// ============================================================
// 🔍 Buchung für bestimmte EventRegistration
// /api/bookings/by-registration/:registrationId
// ============================================================
router.get(
    "/by-registration/:registrationId",
    authenticateToken,
    requireRegistrationAccess((req) => req.params.registrationId),
    bookingController.getByEventRegistration
);

// ============================================================
// ✨ NEU: Alle Buchungen für eine Registrierung (mehrere Unterkünfte möglich)
// /api/bookings/by-registration/:registrationId/all
// ============================================================
router.get(
    "/by-registration/:registrationId/all",
    authenticateToken, // ✅ korrigiert!
    requireRegistrationAccess((req) => req.params.registrationId),
    bookingController.getAllByRegistration
);

// ============================================================
// 🔍 Einzelne Buchung per ID
// ============================================================
router.get("/:id", authenticateToken, requireBookingAccess((req) => req.params.id), bookingController.getBookingById);

// ============================================================
// ✏️ Buchung aktualisieren
// ============================================================
router.put("/:id", authenticateToken, requireBookingAccess((req) => req.params.id), bookingController.updateBooking);

// ============================================================
// ❌ Buchung löschen
// ============================================================
router.delete("/:id", authenticateToken, requireBookingAccess((req) => req.params.id), bookingController.deleteBooking);

module.exports = router;
