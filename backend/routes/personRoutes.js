const express = require("express");
const router = express.Router();
const personController = require("../controllers/personController");

router.get("/", personController.getAllPersons);
router.get("/:id", personController.getPersonById);
router.post("/", personController.createPerson);
router.put("/:id", personController.updatePerson);
router.delete("/:id", personController.deletePerson);

module.exports = router;
