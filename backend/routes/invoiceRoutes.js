const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");

// CRUD
router.post("/", invoiceController.createInvoice);
router.get("/", invoiceController.getAllInvoices);
router.get("/:id", invoiceController.getInvoiceById);
router.put("/:id", invoiceController.updateInvoice);
router.delete("/:id", invoiceController.deleteInvoice);

// ✅ Route: Als bezahlt markieren
router.patch("/:id/mark-paid", invoiceController.markAsPaid);



module.exports = router;
