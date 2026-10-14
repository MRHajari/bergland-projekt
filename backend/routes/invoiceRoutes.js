const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");
const { authenticateToken, requireRole } = require("../middlewares/authMiddleware");
const { requirePersonAccess, requireInvoiceAccess } = require("../middlewares/ownershipMiddleware");

router.use(authenticateToken);

// Admin-Übersichten + Filter
router.get("/", requireRole("admin"), invoiceController.listInvoices);

// Person-spezifische Abfrage
router.get("/by-person/:id_person", requirePersonAccess((req) => req.params.id_person), invoiceController.getInvoicesByPerson);

router.get("/:id", requireInvoiceAccess((req) => req.params.id), invoiceController.getInvoice);

// Aktionen
router.patch("/:id/pay", requireRole("admin"), invoiceController.markAsPaid);
router.delete("/:id", requireInvoiceAccess((req) => req.params.id), invoiceController.deleteInvoice);

// Produkte an Rechnung (optional)
router.post("/:invoiceId/products/:productId", requireRole("admin"), invoiceController.addProductToInvoice);
router.delete("/:invoiceId/products/:productId", requireRole("admin"), invoiceController.removeProductFromInvoice);

// 🧾 Neue Rechnung aus Produktbestellung
router.post("/from-products", requirePersonAccess((req) => req.body?.id_person), invoiceController.createInvoiceFromProducts);

// 🖨️ PDF erzeugen & ausliefern
router.get("/:id/pdf", requireInvoiceAccess((req) => req.params.id), invoiceController.generateInvoicePdf);

module.exports = router;
