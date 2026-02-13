const express = require("express");
const router = express.Router();

const runtimeController = require("../controllers/runtimeController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

// ============================================================
// 📋 Lesen (alle eingeloggten User erlaubt)
// ============================================================

router.get("/", authenticateToken, runtimeController.getAllRuntimes);

router.get("/:id", authenticateToken, runtimeController.getRuntimeById);

router.get(
    "/registration/:registrationId",
    authenticateToken,
    runtimeController.getByRegistration
);


// ============================================================
// ✏️ Schreiben (nur Admin & Timekeeper)
// ============================================================

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
