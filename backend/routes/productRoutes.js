const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { authenticateToken, requireRole } = require("../middlewares/authMiddleware");

router.get("/", productController.listProducts);
router.get("/:id", productController.getProduct);
router.use(authenticateToken, requireRole("admin"));
router.post("/", productController.createProduct);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
