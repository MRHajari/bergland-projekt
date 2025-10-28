const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");

// POST /api/invoices → neue Rechnung
router.post("/", invoiceController.createInvoice);

// GET /api/invoices → alle Rechnungen
router.get("/", invoiceController.listInvoices);

// GET /api/invoices/:id → einzelne Rechnung
router.get("/:id", invoiceController.getInvoice);

// POST /api/invoices/:id/mark-paid → Rechnung als bezahlt markieren
router.post("/:id/mark-paid", invoiceController.markAsPaid);

// GET /api/invoices/by-person/:id_person → eigene Bestellungen
router.get("/by-person/:id_person", invoiceController.getInvoicesByPerson);

// POST /api/invoices/from-products → neue Rechnung aus Produktbestellung
router.post("/from-products", invoiceController.createInvoiceFromProducts);

// DELETE /api/invoices/:id → Rechnung löschen (stornieren)
router.delete("/:id", invoiceController.deleteInvoice);

module.exports = router;
