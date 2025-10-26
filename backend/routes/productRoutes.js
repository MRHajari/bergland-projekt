const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// 🔹 Alle Produkte abrufen
router.get("/", productController.listProducts);

// 🔹 Einzelnes Produkt abrufen
router.get("/:id", productController.getProduct);

// 🔹 Neues Produkt erstellen
router.post("/", productController.createProduct);

// 🔹 Produkt aktualisieren
router.put("/:id", productController.updateProduct);

// 🔹 Produkt löschen
router.delete("/:id", productController.deleteProduct);

module.exports = router;
