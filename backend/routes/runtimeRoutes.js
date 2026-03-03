const express = require("express");
const router = express.Router();

const runtimeController = require("../controllers/runtimeController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

// Lesen
router.get(
    "/registration/:registrationId",
    authenticateToken,
    runtimeController.getByRegistration
);

router.get("/", authenticateToken, runtimeController.getAllRuntimes);
router.get("/:id", authenticateToken, runtimeController.getRuntimeById);

// Schreiben
router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin", "timekeeper"),
    runtimeController.createRuntime
);

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("admin", "timekeeper"),
    runtimeController.updateRuntime
);

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    runtimeController.deleteRuntime
);

module.exports = router;