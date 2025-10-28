const { Op } = require("sequelize");
const PDFDocument = require("pdfkit"); // 📦 npm install pdfkit
const Invoice = require("../models/invoice");
const Product = require("../models/product");
const RelInvoiceProduct = require("../models/rel_invoice_product");
const invoiceSchema = require("../validators/invoiceValidator");
const Person = require("../models/person");

// =========================================================
// 🧾 RECHNUNGEN (INVOICES) CONTROLLER
// =========================================================

// 🧩 Helper: Monatsfilter-Bereich
function monthRange(year, month) {
    const start = new Date(Number(year), Number(month) - 1, 1, 0, 0, 0);
    const end = new Date(Number(year), Number(month), 1, 0, 0, 0);
    return { start, end };
}

// =========================================================
// 1️⃣ Neue Rechnung automatisch nach Bestellung erstellen
// =========================================================
exports.createInvoice = async (req, res) => {
    try {
        const { id_person, produkte } = req.body;

        if (!id_person || !produkte || produkte.length === 0) {
            return res.status(400).json({
                message: "id_person und produkte[] sind erforderlich.",
            });
        }

        // Produkte abrufen und Gesamtbetrag berechnen
        const items = await Product.findAll({
            where: { id_produkt: { [Op.in]: produkte } },
        });

        if (items.length === 0) {
            return res.status(400).json({ message: "Keine gültigen Produkte gefunden." });
        }

        const total = items.reduce((sum, p) => sum + Number(p.preis), 0);

        // Rechnungsnummer generieren (z. B. R-2025-0001)
        const rechnungsNummer = `R-${new Date().getFullYear()}-${Math.floor(
            Math.random() * 10000
        )
            .toString()
            .padStart(4, "0")}`;

        // Validierung
        const { error } = invoiceSchema.validate({
            rechnungs_nr: rechnungsNummer,
            id_person,
            betrag_gesamt: total,
        });
        if (error) {
            return res.status(400).json({
                message: "Validierungsfehler",
                details: error.details,
            });
        }

        // Rechnung speichern
        const invoice = await Invoice.create({
            rechnungs_nr: rechnungsNummer,
            id_person,
            betrag_gesamt: total,
        });

        // Relationstabelle befüllen
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

// =========================================================
// 2️⃣ Alle Rechnungen abrufen (mit Filtern für Admin)
// =========================================================
exports.listInvoices = async (req, res) => {
    try {
        const { status, month, year } = req.query;
        const whereClause = {};

        // Optional: Filter nach Status
        if (status === "offen") whereClause.ist_bezahlt = false;
        if (status === "bezahlt") whereClause.ist_bezahlt = true;

        // Optional: Filter nach Monat / Jahr
        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            whereClause.datum = { [Op.between]: [startDate, endDate] };
        }

        const invoices = await Invoice.findAll({
            where: whereClause,
            include: [
                { association: "kunde" },
                {
                    model: RelInvoiceProduct,
                    as: "productRelations",
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


// =========================================================
// 3️⃣ Einzelne Rechnung mit Produkten abrufen
// =========================================================
exports.getInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id, {
            include: [
                { association: "kunde" },
                {
                    model: RelInvoiceProduct,
                    as: "productRelations",
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

// =========================================================
// 4️⃣ Rechnung als bezahlt markieren
// =========================================================
exports.markAsPaid = async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id);
        if (!invoice) return res.status(404).json({ message: "Rechnung nicht gefunden." });

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

// =========================================================
// 5️⃣ Rechnung aus Produktbestellung mit Mengen erstellen
// =========================================================
exports.createInvoiceFromProducts = async (req, res) => {
    try {
        const { id_person, items } = req.body; // items = [{ id_produkt, menge }]
        if (!id_person || !Array.isArray(items) || items.length === 0) {
            return res
                .status(400)
                .json({ message: "id_person und items[] sind erforderlich." });
        }

        const productIds = items.map((i) => i.id_produkt);
        const products = await Product.findAll({
            where: { id_produkt: { [Op.in]: productIds } },
        });

        if (products.length === 0) {
            return res.status(400).json({ message: "Keine gültigen Produkte gefunden." });
        }

        const total = items.reduce((sum, i) => {
            const p = products.find((prod) => prod.id_produkt === i.id_produkt);
            return p ? sum + Number(p.preis) * (i.menge || 1) : sum;
        }, 0);

        const rechnungsNummer = `R-${new Date().getFullYear()}-${Math.floor(
            Math.random() * 10000
        )
            .toString()
            .padStart(4, "0")}`;

        const invoice = await Invoice.create({
            rechnungs_nr: rechnungsNummer,
            id_person,
            betrag_gesamt: total,
        });

        const rels = items.map((i) => ({
            id_rechnung: invoice.id_rechnung,
            id_produkt: i.id_produkt,
            menge: i.menge || 1,
        }));
        await RelInvoiceProduct.bulkCreate(rels);

        res.status(201).json({
            message: "🧾 Rechnung erfolgreich erstellt.",
            invoice,
            total,
        });
    } catch (error) {
        console.error("❌ Fehler beim Erstellen der Rechnung aus Produkten:", error);
        res.status(500).json({ message: "Interner Serverfehler" });
    }
};

// =========================================================
// 6️⃣ Rechnungen einer Person abrufen
// =========================================================
exports.getInvoicesByPerson = async (req, res) => {
    try {
        const { id_person } = req.params;
        const invoices = await Invoice.findAll({
            where: { id_person },
            include: [
                {
                    model: RelInvoiceProduct,
                    as: "productRelations",
                    include: [{ model: Product, as: "product" }],
                },
            ],
            order: [["datum", "DESC"]],
        });
        res.json(invoices);
    } catch (error) {
        console.error("❌ Fehler beim Laden der Benutzerrechnungen:", error);
        res.status(500).json({ message: "Interner Serverfehler" });
    }
};

// =========================================================
// 7️⃣ Rechnung aktualisieren
// =========================================================
exports.updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await Invoice.findByPk(id);
        if (!invoice) return res.status(404).json({ message: "Rechnung nicht gefunden." });

        const { error, value } = invoiceSchema.validate(req.body, { allowUnknown: true });
        if (error) return res.status(400).json({ message: error.details[0].message });

        await invoice.update(value);
        res.json({
            message: "💾 Rechnung erfolgreich aktualisiert.",
            invoice,
        });
    } catch (error) {
        console.error("❌ Fehler beim Aktualisieren der Rechnung:", error);
        res.status(500).json({ message: "Interner Serverfehler" });
    }
};

// =========================================================
// 8️⃣ Rechnung löschen
// =========================================================
exports.deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await Invoice.findByPk(id);
        if (!invoice) return res.status(404).json({ message: "Rechnung nicht gefunden." });

        await invoice.destroy();
        res.json({ message: "🗑️ Rechnung wurde erfolgreich gelöscht." });
    } catch (error) {
        console.error("❌ Fehler beim Löschen der Rechnung:", error);
        res.status(500).json({ message: "Interner Serverfehler" });
    }
};

// =========================================================
// 9️⃣ Produkte zu Rechnung hinzufügen / entfernen
// =========================================================
exports.addProductToInvoice = async (req, res) => {
    try {
        const { invoiceId, productId } = req.params;

        const invoice = await Invoice.findByPk(invoiceId);
        const product = await Product.findByPk(productId);

        if (!invoice || !product) {
            return res.status(404).json({ message: "Rechnung oder Produkt nicht gefunden." });
        }

        await RelInvoiceProduct.create({
            id_rechnung: invoiceId,
            id_produkt: productId,
        });

        res.json({
            message: `✅ Produkt "${product.produkt_name}" zur Rechnung ${invoice.rechnungs_nr} hinzugefügt.`,
        });
    } catch (error) {
        console.error("❌ Fehler beim Hinzufügen des Produkts zur Rechnung:", error);
        res.status(500).json({ message: "Interner Serverfehler" });
    }
};

exports.removeProductFromInvoice = async (req, res) => {
    try {
        const { invoiceId, productId } = req.params;

        const deleted = await RelInvoiceProduct.destroy({
            where: {
                id_rechnung: invoiceId,
                id_produkt: productId,
            },
        });

        if (!deleted) {
            return res.status(404).json({ message: "Verknüpfung nicht gefunden." });
        }

        res.json({ message: "🗑️ Produkt wurde aus der Rechnung entfernt." });
    } catch (error) {
        console.error("❌ Fehler beim Entfernen des Produkts aus der Rechnung:", error);
        res.status(500).json({ message: "Interner Serverfehler" });
    }
};

// =========================================================
// 🔟 PDF-Erzeugung für Druck / Download
// =========================================================
exports.generateInvoicePdf = async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id, {
            include: [
                { association: "kunde" },
                {
                    model: RelInvoiceProduct,
                    as: "productRelations",
                    include: [{ model: Product, as: "product" }],
                },
            ],
        });

        if (!invoice) return res.status(404).json({ message: "Rechnung nicht gefunden." });

        const seller = {
            name: process.env.SELLER_NAME || "Bergland Events",
            street: process.env.SELLER_STREET || "Spinozastraße 18",
            zipCity: process.env.SELLER_ZIPCITY || "67663 Kaiserslautern",
            country: process.env.SELLER_COUNTRY || "Deutschland",
            email: process.env.SELLER_EMAIL || "info@bergland.local",
            phone: process.env.SELLER_PHONE || "+49 000 000000",
            vatId: process.env.SELLER_VATID || "DE123456789",
        };

        // PDF-Antwortheader
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="${invoice.rechnungs_nr}.pdf"`);

        const doc = new PDFDocument({ margin: 50 });
        doc.pipe(res);

        // Kopf
        doc.fontSize(20).text("RECHNUNG", { align: "right" });
        doc.fontSize(10).text(`Rechnungs-Nr.: ${invoice.rechnungs_nr}`, { align: "right" });
        doc.text(`Datum: ${new Date(invoice.datum).toLocaleDateString("de-DE")}`, { align: "right" });
        if (invoice.ist_bezahlt)
            doc.text(`Status: bezahlt am ${invoice.bezahlt_am ? new Date(invoice.bezahlt_am).toLocaleDateString("de-DE") : "-"}`, { align: "right" });

        doc.moveDown(1.2);
        doc.fontSize(12).text(`${seller.name}\n${seller.street}\n${seller.zipCity}\n${seller.country}`);
        doc.text(`E-Mail: ${seller.email}\nTel: ${seller.phone}\nUSt-ID: ${seller.vatId}`);

        doc.moveDown(1);
        const k = invoice.kunde;
        if (k) {
            doc.text(`Rechnung an:\n${k.first_name} ${k.last_name}`);
            if (k.street) doc.text(k.street);
            if (k.postal_code || k.city)
                doc.text(`${k.postal_code || ""} ${k.city || ""}`);
            if (k.country) doc.text(k.country);
        }

        // Positionen
        doc.moveDown(1.5);
        doc.fontSize(12).text("Positionen:", { underline: true });
        doc.moveDown(0.3);

        doc.fontSize(10);
        doc.text("Artikel", 50);
        doc.text("Menge", 300, undefined, { width: 60, align: "right" });
        doc.text("Einzelpreis", 360, undefined, { width: 80, align: "right" });
        doc.text("Gesamt", 440, undefined, { width: 80, align: "right" });
        doc.moveDown(0.2);
        doc.moveTo(50, doc.y).lineTo(520, doc.y).stroke();

        let sum = 0;
        invoice.productRelations.forEach((rel) => {
            const p = rel.product;
            const menge = rel.menge || 1;
            const netto = Number(p.preis) * menge;
            sum += netto;

            doc.moveDown(0.3);
            doc.text(p.produkt_name, 50);
            doc.text(String(menge), 300, undefined, { width: 60, align: "right" });
            doc.text(`${Number(p.preis).toFixed(2)} €`, 360, undefined, { width: 80, align: "right" });
            doc.text(`${netto.toFixed(2)} €`, 440, undefined, { width: 80, align: "right" });
        });

        doc.moveDown(1);
        doc.fontSize(12).text(`Gesamtsumme: ${sum.toFixed(2)} €`, { align: "right" });

        doc.moveDown(2);
        doc.fontSize(10).text("Vielen Dank für Ihre Teilnahme am Bergland-Event!", { align: "center" });

        doc.end();
    } catch (error) {
        console.error("❌ Fehler beim Erzeugen des PDFs:", error);
        res.status(500).json({ message: "Interner Serverfehler beim PDF-Export" });
    }
};
