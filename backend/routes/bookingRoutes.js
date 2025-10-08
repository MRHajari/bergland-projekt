const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const bookingController = require("../controllers/bookingController");

router.post("/", authenticateToken, bookingController.createBooking);
router.get("/", authenticateToken, bookingController.getAllBookings);
router.get("/user/:userId", authenticateToken, bookingController.getByUser); // ⬅️ vor /:id
router.get("/:id", authenticateToken, bookingController.getBookingById);
router.put("/:id", authenticateToken, bookingController.updateBooking);
router.delete("/:id", authenticateToken, bookingController.deleteBooking);

module.exports = router;
