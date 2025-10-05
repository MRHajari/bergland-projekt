const express = require("express");
const router = express.Router();
const loginDataController = require("../controllers/loginDataController");

router.post("/", loginDataController.createLoginData);
router.get("/", loginDataController.getAllLoginData);
router.get("/:id", loginDataController.getLoginDataById);
router.put("/:id", loginDataController.updateLoginData);
router.delete("/:id", loginDataController.deleteLoginData);
router.put("/role/:personId", loginDataController.updateRole);


module.exports = router;
