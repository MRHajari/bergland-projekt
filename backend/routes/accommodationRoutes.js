const express = require("express");
const router = express.Router();
const accommodationController = require("../controllers/accommodationController");

router.post("/", accommodationController.createAccommodation);
router.get("/", accommodationController.getAllAccommodations);
router.get("/:id", accommodationController.getAccommodationById);
router.put("/:id", accommodationController.updateAccommodation);
router.delete("/:id", accommodationController.deleteAccommodation);

module.exports = router;
