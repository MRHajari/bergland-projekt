const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { authenticateToken, authorizeAdmin } = require("../middlewares/authMiddleware");

// 🔹 Produkte ansehen (alle dürfen das)
router.get("/", productController.listProducts);
router.get("/:id", productController.getProduct);

// 🔹 Nur Admin darf Produkte erstellen, ändern oder löschen
router.post("/", authenticateToken, authorizeAdmin, productController.createProduct);
router.put("/:id", authenticateToken, authorizeAdmin, productController.updateProduct);
router.delete("/:id", authenticateToken, authorizeAdmin, productController.deleteProduct);

module.exports = router;
