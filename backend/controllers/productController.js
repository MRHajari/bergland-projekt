const Product = require("../models/product");
const productSchema = require("../validators/productValidator");

// =========================================================
// 🏷️ PRODUKT-CONTROLLER
// =========================================================

// 🔹 Alle Produkte abrufen
exports.listProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            order: [["produkt_name", "ASC"]],
        });
        res.json(products);
    } catch (error) {
        console.error("❌ Fehler beim Laden der Produkte:", error);
        res.status(500).json({ message: "Interner Serverfehler" });
    }
};

// 🔹 Einzelnes Produkt abrufen
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Produkt nicht gefunden." });
        }

        res.json(product);
    } catch (error) {
        console.error("❌ Fehler beim Abrufen des Produkts:", error);
        res.status(500).json({ message: "Interner Serverfehler" });
    }
};

// 🔹 Neues Produkt erstellen
exports.createProduct = async (req, res) => {
    try {
        const { error, value } = productSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({
                message: "Validierungsfehler",
                details: error.details.map((d) => d.message),
            });
        }

        const newProduct = await Product.create(value);
        res.status(201).json({
            message: "Produkt erfolgreich erstellt.",
            product: newProduct,
        });
    } catch (error) {
        console.error("❌ Fehler beim Erstellen des Produkts:", error);
        res.status(500).json({ message: "Interner Serverfehler" });
    }
};

// 🔹 Produkt aktualisieren
exports.updateProduct = async (req, res) => {
    try {
        const { error, value } = productSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({
                message: "Validierungsfehler",
                details: error.details.map((d) => d.message),
            });
        }

        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Produkt nicht gefunden." });
        }

        await product.update(value);
        res.json({
            message: "Produkt erfolgreich aktualisiert.",
            product,
        });
    } catch (error) {
        console.error("❌ Fehler beim Aktualisieren des Produkts:", error);
        res.status(500).json({ message: "Interner Serverfehler" });
    }
};

// 🔹 Produkt löschen
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Produkt nicht gefunden." });
        }

        await product.destroy();
        res.json({ message: "Produkt erfolgreich gelöscht." });
    } catch (error) {
        console.error("❌ Fehler beim Löschen des Produkts:", error);
        res.status(500).json({ message: "Interner Serverfehler" });
    }
};
