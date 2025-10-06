// backend/controllers/belegungController.js
const { Belegung } = require("../models");
const belegungSchema = require("../validators/belegungValidator");

// 🔹 Neue Belegung anlegen (Event-Anmeldung)
exports.createBelegung = async (req, res, next) => {
    try {
        console.log("📩 Neue Belegung erhalten:", req.body); // <---- WICHTIG!

        const { id_event, id_person } = req.body;
        if (!id_event || !id_person) {
            console.warn("⚠️ Ungültige Daten:", req.body);
            return res.status(400).json({ message: "Event-ID oder Benutzer-ID fehlt" });
        }

        const existing = await Belegung.findOne({ where: { id_event, id_person } });
        if (existing) {
            return res.status(400).json({ message: "Benutzer ist bereits angemeldet." });
        }

        const belegung = await Belegung.create({ id_event, id_person });
        res.json({ message: "Anmeldung erfolgreich!", belegung });
    } catch (err) {
        console.error("❌ Fehler bei Belegung:", err);
        res.status(500).json({ message: "Serverfehler bei Anmeldung" });
    }
};


// 🔹 Alle Belegungen abrufen
exports.getAllBelegungen = async (req, res, next) => {
    try {
        const belegungen = await Belegung.findAll();
        res.json(belegungen);
    } catch (err) {
        next(err);
    }
};

// 🔹 Belegung nach ID abrufen
exports.getBelegungById = async (req, res, next) => {
    try {
        const belegung = await Belegung.findByPk(req.params.id);
        if (!belegung) return res.status(404).json({ error: "Belegung nicht gefunden" });
        res.json(belegung);
    } catch (err) {
        next(err);
    }
};

// 🔹 Belegung aktualisieren
exports.updateBelegung = async (req, res, next) => {
    try {
        const { error } = belegungSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const belegung = await Belegung.findByPk(req.params.id);
        if (!belegung) return res.status(404).json({ error: "Belegung nicht gefunden" });

        await belegung.update(req.body);
        res.json(belegung);
    } catch (err) {
        next(err);
    }
};

// 🔹 Belegung löschen
exports.deleteBelegung = async (req, res, next) => {
    try {
        const belegung = await Belegung.findByPk(req.params.id);
        if (!belegung) return res.status(404).json({ error: "Belegung nicht gefunden" });

        await belegung.destroy();
        res.json({ message: "Belegung gelöscht" });
    } catch (err) {
        next(err);
    }
};
