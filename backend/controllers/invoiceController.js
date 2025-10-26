const { Op } = require("sequelize");
const Invoice = require("../models/invoice");
const Product = require("../models/product");
const RelInvoiceProduct = require("../models/rel_invoice_product");
const invoiceSchema = require("../validators/invoiceValidator");

// =========================================================
// 🧾 RECHNUNGEN (INVOICES) CONTROLLER
// =========================================================

// 🔹 1️⃣ Neue Rechnung automatisch nach Bestellung erstellen
exports.createInvoice = async (req, res) => {
    try {
        const { id_person, produkte } = req.body;

        if (!id_person || !produkte || produkte.length === 0) {
            return res
                .status(400)
                .json({ message: "id_person und produkte[] sind erforderlich." });
        }

        // Produkte abrufen und Gesamtbetrag berechnen
        const items = await Product.findAll({
            where: { id_produkt: { [Op.in]: produkte } },
        });

        if (items.length === 0) {
            return res.status(400).json({ message: "Keine gültigen Produkte gefunden." });
        }

        const total = items.reduce((sum, p) => sum + p.preis, 0);

        // Rechnungsnummer generieren (z. B. R-2025-0001)
        const rechnungsNummer = `R-${new Date().getFullYear()}-${Math.floor(
            Math.random() * 10000
        )
            .toString()
            .padStart(4, "0")}`;

        // Validierung (optional, falls du sie aktiv nutzen willst)
        const { error } = invoiceSchema.validate({
            rechnungs_nr: rechnungsNummer,
            id_person,
            betrag_gesamt: total,
        });
        if (error) {
            return res
                .status(400)
                .json({ message: "Validierungsfehler", details: error.details });
        }

        // Rechnung speichern
        const invoice = await Invoice.create({
            rechnungs_nr: rechnungsNummer,
            id_person,
            betrag_gesamt: total,
        });

        // Relationstabelle befüllen (Rechnung ↔ Produkte)
        const rels = produkte.map((id_produkt) => ({
            id_rechnung: invoice.id_rechnung,
            id_produkt,
        }));
        await RelInvoiceProduct.bulkCreate(rels);

        res.status(201).json({
            message: "Rechnung erfolgreich erstellt.",
            invoice,
        });
    } catch (error) {
        console.error("❌ Fehler beim Erstellen der Rechnung:", error);
        res.status(500).json({ message: "Interner Serverfehler" });
    }
};

// 🔹 2️⃣ Alle Rechnungen abrufen (Admin-Übersicht)
exports.listInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.findAll({
            include: [
                {
                    association: "kunde",
                },
                {
                    model: RelInvoiceProduct,
                    as: "products",
                    include: [{ model: Product, as: "product" }],
                },
            ],
            order: [["datum", "DESC"]],
        });

        res.json(invoices);
    } catch (error) {
        console.error("❌ Fehler beim Laden der Rechnungen:", error);
        res.status(500).json({ message: "Interner Serverfehler" });
    }
};

// 🔹 3️⃣ Einzelne Rechnung mit Produkten abrufen
exports.getInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id, {
            include: [
                {
                    association: "kunde",
                },
                {
                    model: RelInvoiceProduct,
                    as: "products",
                    include: [{ model: Product, as: "product" }],
                },
            ],
        });

        if (!invoice) {
            return res.status(404).json({ message: "Rechnung nicht gefunden." });
        }

        res.json(invoice);
    } catch (error) {
        console.error("❌ Fehler beim Abrufen der Rechnung:", error);
        res.status(500).json({ message: "Interner Serverfehler" });
    }
};

// 🔹 4️⃣ Rechnung als bezahlt markieren
exports.markAsPaid = async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id);

        if (!invoice) {
            return res.status(404).json({ message: "Rechnung nicht gefunden." });
        }

        await invoice.update({
            ist_bezahlt: true,
            bezahlt_am: new Date(),
        });

        res.json({
            message: "✅ Rechnung wurde als bezahlt markiert.",
            invoice,
        });
    } catch (error) {
        console.error("❌ Fehler beim Markieren als bezahlt:", error);
        res.status(500).json({ message: "Interner Serverfehler" });
    }
};
