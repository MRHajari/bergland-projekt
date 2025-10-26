const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");

// POST /api/rechnungen → neue Rechnung (nach Bestellung)
router.post("/", invoiceController.createInvoice);

// GET /api/rechnungen → alle Rechnungen (Admin)
router.get("/", invoiceController.listInvoices);

// GET /api/rechnungen/:id → einzelne Rechnung
router.get("/:id", invoiceController.getInvoice);

// POST /api/rechnungen/:id/mark-paid → Rechnung als bezahlt markieren
router.post("/:id/mark-paid", invoiceController.markAsPaid);

module.exports = router;
