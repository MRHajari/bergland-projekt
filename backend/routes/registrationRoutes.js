const express = require("express");
const router = express.Router();
const registrationController = require("../controllers/registrationController");


router.post("/", registrationController.registerPerson);
router.get("/", registrationController.getAllPersons); // optional

module.exports = router;
