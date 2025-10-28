const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");

// Admin-Übersichten + Filter
router.get("/", invoiceController.listInvoices);

// Person-spezifische Abfrage
router.get("/by-person/:id_person", invoiceController.getInvoicesByPerson);

router.get("/:id", invoiceController.getInvoice);

// Aktionen
router.patch("/:id/pay", invoiceController.markAsPaid);
router.delete("/:id", invoiceController.deleteInvoice);

// Produkte an Rechnung (optional)
router.post("/:invoiceId/products/:productId", invoiceController.addProductToInvoice);
router.delete("/:invoiceId/products/:productId", invoiceController.removeProductFromInvoice);

// 🧾 Neue Rechnung aus Produktbestellung
router.post("/from-products", invoiceController.createInvoiceFromProducts);

// 🖨️ PDF erzeugen & ausliefern
router.get("/:id/pdf", invoiceController.generateInvoicePdf);

module.exports = router;
