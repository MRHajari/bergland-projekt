const { Op } = require("sequelize");
const PDFDocument = require("pdfkit"); // 📦 npm install pdfkit
const Invoice = require("../models/invoice");
const Product = require("../models/product");
const RelInvoiceProduct = require("../models/rel_invoice_product");
const invoiceSchema = require("../validators/invoiceValidator");
const Person = require("../models/person");
const { randomUUID } = require("node:crypto");
const Joi = require("joi");

const orderSchema = Joi.object({
    id_person: Joi.string().uuid().required(),
    items: Joi.array().items(Joi.object({
        id_produkt: Joi.string().uuid().required(),
        menge: Joi.number().integer().min(1).max(10000).default(1),
    })).min(1).max(100).unique("id_produkt").required(),
});

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
            const { start, end } = monthRange(year, month);
            whereClause.datum = { [Op.gte]: start, [Op.lt]: end };
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
        const { error, value } = orderSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });
        const { id_person, items } = value;

        const productIds = items.map((i) => i.id_produkt);
        const products = await Product.findAll({
            where: { id_produkt: { [Op.in]: productIds } },
        });

        if (products.length !== productIds.length) {
            return res.status(400).json({ message: "Keine gültigen Produkte gefunden." });
        }

        const total = items.reduce((sum, item) => {
            const product = products.find((candidate) => candidate.id_produkt === item.id_produkt);
            return sum + Math.round(Number(product.preis) * 100) * item.menge;
        }, 0) / 100;
        const rechnungsNummer = `R-${new Date().getFullYear()}-${randomUUID()}`;

        const invoice = await Invoice.sequelize.transaction(async (transaction) => {
            const created = await Invoice.create({
                rechnungs_nr: rechnungsNummer,
                id_person,
                betrag_gesamt: total,
            }, { transaction });
            const rels = items.map((item) => ({
                id_rechnung: created.id_rechnung,
                id_produkt: item.id_produkt,
                menge: item.menge,
            }));
            await RelInvoiceProduct.bulkCreate(rels, { transaction, validate: true });
            return created;
        });

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
        if (req.user.role !== "admin" && invoice.ist_bezahlt) {
            return res.status(409).json({ message: "Bezahlte Rechnungen koennen nicht storniert werden." });
        }

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

        // 🧾 Absender (Verkäufer)
        const seller = {
            name: "Kreisverwaltung Bürgerbüro Pfälzer Bergland",
            street: "Trierer Straße 49-51",
            zipCity: "66869 Kusel",
            country: "Deutschland",
            phone: "+49 6381 424 270",
            fax: "+49 6381 424 280",
            email: "info@pfaelzerbergland.de",
        };

        // 📄 PDF-Header
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="${invoice.rechnungs_nr}.pdf"`);

        const doc = new PDFDocument({ margin: 50 });
        doc.pipe(res);

        // ================================
        // 🏢 Kopfbereich
        // ================================
        doc
            .fontSize(18)
            .text("Rechnung", { align: "right", underline: true })
            .moveDown(0.5);

        doc
            .fontSize(10)
            .text(`Rechnungs-Nr.: ${invoice.rechnungs_nr}`, { align: "right" })
            .text(`Datum: ${new Date(invoice.datum).toLocaleDateString("de-DE")}`, { align: "right" });

        if (invoice.ist_bezahlt) {
            const bezahltAm = invoice.bezahlt_am
                ? new Date(invoice.bezahlt_am).toLocaleDateString("de-DE")
                : "-";
            doc.text(`Status: bezahlt am ${bezahltAm}`, { align: "right" });
        }

        // ================================
        // 📍 Absender (links oben)
        // ================================
        doc.moveDown(1.5);
        doc
            .fontSize(12)
            .text(seller.name)
            .text(seller.street)
            .text(seller.zipCity)
            .text(seller.country)
            .text(`Telefon: ${seller.phone}`)
            .text(`Fax: ${seller.fax}`)
            .text(`E-Mail: ${seller.email}`)
            .moveDown(1.5);

        // ================================
        // 👤 Rechnungsempfänger (Kunde)
        // ================================
        const k = invoice.kunde;
        doc
            .fontSize(12)
            .text("Rechnung an:", { underline: true })
            .moveDown(0.3);

        if (k) {
            doc
                .text(`${k.first_name || ""} ${k.last_name || ""}`)
                .text(k.street || "")
                .text(`${k.postal_code || ""} ${k.city || ""}`)
                .text(k.country || "")
                .text(k.phone ? `Telefon: ${k.phone}` : "")
                .text(k.email ? `E-Mail: ${k.email}` : "");
        } else {
            doc.text("Unbekannter Kunde (Daten fehlen)");
        }

        // ================================
        // 🧾 Positionen-Tabelle (optimiert)
        // ================================
        doc.moveDown(2);
        doc.fontSize(12).text("Positionen:", { underline: true });
        doc.moveDown(0.3);

        const startX = 50;
        const colArtikel = startX;
        const colMenge = 300;
        const colEinzelpreis = 380;
        const colGesamt = 470;

        doc.fontSize(10);
        const headerY = doc.y;
        doc.text("Artikel", colArtikel);
        doc.text("Menge", colMenge, headerY, { width: 40, align: "right" });
        doc.text("Einzelpreis", colEinzelpreis, headerY, { width: 60, align: "right" });
        doc.text("Gesamt", colGesamt, headerY, { width: 60, align: "right" });
        doc.moveDown(0.2);
        doc.moveTo(startX, doc.y).lineTo(540, doc.y).stroke();

        let sum = 0;
        let yPos = doc.y + 5;
        const lineHeight = 16; // Einheitliche Zeilenhöhe

        invoice.productRelations.forEach((rel) => {
            const p = rel.product;
            const menge = rel.menge || 1;
            const netto = Number(p.preis) * menge;
            sum += netto;

            doc.text(p.produkt_name, colArtikel, yPos);
            doc.text(String(menge), colMenge, yPos, { width: 40, align: "right" });
            doc.text(`${Number(p.preis).toFixed(2)} €`, colEinzelpreis, yPos, { width: 60, align: "right" });
            doc.text(`${netto.toFixed(2)} €`, colGesamt, yPos, { width: 60, align: "right", });
            doc.moveDown(1);
            yPos += lineHeight;
        });

        // Linie unter Tabelle
        doc.moveTo(startX, yPos - 5).lineTo(540, yPos - 5).stroke();
        doc.moveDown(1.5);

        // ================================
        // 💶 Gesamtsumme & Fußtext
        // ================================

        // Linie über der Gesamtsumme
        doc.moveTo(startX, yPos - 3).lineTo(540, yPos - 3).stroke();

        // Gesamtsumme exakt unter "Gesamt" ausrichten
        doc
            .fontSize(12)
            .font("Helvetica-Bold")
            .text(`Gesamtsumme: ${sum.toFixed(2)} €`, colGesamt - 100, yPos + 10, {
                width: 160,
                align: "right",
            })
            .font("Helvetica");

        // 🧩 Cursor zurücksetzen, bevor neuer Text folgt
        doc.moveDown(2);
        doc.x = startX;

        // Fußtext mittig und leicht eingerückt
        doc
            .fontSize(10)
            .text("Vielen Dank für Ihre Teilnahme am Bergland-Event!", {
                align: "center",
                width: 400,
            });


        doc.end();
    } catch (error) {
        console.error("❌ Fehler beim Erzeugen des PDFs:", error);
        res.status(500).json({ message: "Interner Serverfehler beim PDF-Export" });
    }
};

