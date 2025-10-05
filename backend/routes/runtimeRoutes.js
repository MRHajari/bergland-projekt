const express = require("express");
const router = express.Router();
const runtimeController = require("../controllers/runtimeController");

router.post("/", runtimeController.createRuntime);
router.get("/", runtimeController.getAllRuntimes);
router.get("/:id", runtimeController.getRuntimeById);
router.put("/:id", runtimeController.updateRuntime);
router.delete("/:id", runtimeController.deleteRuntime);

module.exports = router;
