const { Invoice } = require("../models");
const invoiceSchema = require("../validators/invoiceValidator");

// ➕ Neue Rechnung anlegen
exports.createInvoice = async (req, res, next) => {
    try {
        const { error } = invoiceSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const invoice = await Invoice.create(req.body);
        res.status(201).json(invoice);
    } catch (err) {
        next(err);
    }
};

// 📋 Alle Rechnungen abrufen
exports.getAllInvoices = async (req, res, next) => {
    try {
        const invoices = await Invoice.findAll();
        res.json(invoices);
    } catch (err) {
        next(err);
    }
};

// 🔍 Einzelne Rechnung abrufen
exports.getInvoiceById = async (req, res, next) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id);
        if (!invoice) return res.status(404).json({ error: "Invoice not found" });
        res.json(invoice);
    } catch (err) {
        next(err);
    }
};

// ✏️ Rechnung bearbeiten
exports.updateInvoice = async (req, res, next) => {
    try {
        const { error } = invoiceSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const invoice = await Invoice.findByPk(req.params.id);
        if (!invoice) return res.status(404).json({ error: "Invoice not found" });

        await invoice.update(req.body);
        res.json(invoice);
    } catch (err) {
        next(err);
    }
};

// ❌ Rechnung löschen
exports.deleteInvoice = async (req, res, next) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id);
        if (!invoice) return res.status(404).json({ error: "Invoice not found" });

        await invoice.destroy();
        res.json({ message: "Invoice deleted" });
    } catch (err) {
        next(err);
    }
};

// ✅ Rechnung als bezahlt markieren
exports.markAsPaid = async (req, res, next) => {
    try {
        const { id } = req.params;
        const invoice = await Invoice.findByPk(id);
        if (!invoice) return res.status(404).json({ message: "Invoice not found" });

        await invoice.update({ is_paid: true });
        res.json(invoice);
    } catch (err) {
        next(err);
    }
};
