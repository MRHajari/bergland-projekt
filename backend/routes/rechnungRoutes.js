const express = require("express");
const router = express.Router();
const { createPerson, getAllPersons } = require("../controllers/personController");

router.post("/", createPerson);
router.get("/", getAllPersons);

module.exports = router;
