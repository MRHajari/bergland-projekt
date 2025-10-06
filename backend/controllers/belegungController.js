const { Belegung, Person, sequelize, Event } = require("../models");
const belegungSchema = require("../validators/belegungValidator");

// 🔹 Neue Belegung anlegen (Event-Anmeldung)
exports.createBelegung = async (req, res) => {
    try {
        console.log("📩 Neue Belegung erhalten:", req.body);

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
exports.getAllBelegungen = async (_req, res) => {
    try {
        const belegungen = await Belegung.findAll();
        res.json(belegungen);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Fehler beim Abrufen der Belegungen" });
    }
};

// 🔹 Belegung nach ID abrufen
exports.getBelegungById = async (req, res) => {
    try {
        const belegung = await Belegung.findByPk(req.params.id);
        if (!belegung) return res.status(404).json({ error: "Belegung nicht gefunden" });
        res.json(belegung);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Fehler beim Abrufen" });
    }
};

// 🔹 Belegung aktualisieren
exports.updateBelegung = async (req, res) => {
    try {
        const { error } = belegungSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const belegung = await Belegung.findByPk(req.params.id);
        if (!belegung) return res.status(404).json({ error: "Belegung nicht gefunden" });

        await belegung.update(req.body);
        res.json(belegung);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Fehler beim Aktualisieren" });
    }
};

// 🔹 Belegung löschen
exports.deleteBelegung = async (req, res) => {
    try {
        const belegung = await Belegung.findByPk(req.params.id);
        if (!belegung) return res.status(404).json({ error: "Belegung nicht gefunden" });

        await belegung.destroy();
        res.json({ message: "Belegung gelöscht" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Fehler beim Löschen" });
    }
};

// ✅ Liste aller Anmeldungen für ein Event inkl. Personendaten
exports.getByEventId = async (req, res) => {
    try {
        const eventId = req.params.id;
        console.log("🔍 Lade Belegungen für Event:", eventId);

        const belegungen = await Belegung.findAll({
            where: { id_event: eventId },
            include: [
                {
                    model: Person,
                    as: "person",
                    attributes: ["id", "first_name", "last_name", "email"]
                },
                {
                    model: Event,
                    as: "event",
                    attributes: ["id", "name", "start_date", "end_date"]
                }
            ],
        });

        res.json(belegungen);
    } catch (err) {
        console.error("❌ Fehler beim Abrufen der Belegungen:", err);
        res.status(500).json({ error: "Serverfehler beim Laden der Belegungen" });
    }
};

// ✅ Zählwerte: Anzahl Anmeldungen pro Event (für Admin-Übersicht)
exports.getCountByEvent = async (_req, res) => {
    try {
        const rows = await Belegung.findAll({
            attributes: [
                "id_event",
                [sequelize.fn("COUNT", sequelize.col("id_event")), "count"],
            ],
            group: ["id_event"],
            raw: true,
        });

        const counts = rows.reduce((acc, r) => {
            acc[r.id_event] = Number(r.count);
            return acc;
        }, {});

        res.json(counts);
    } catch (err) {
        console.error("❌ Fehler bei Count-Query:", err);
        res.status(500).json({ message: "Serverfehler bei Count-Query" });
    }
};

// ✅ Einzelne Belegung (ob User bei Event angemeldet ist)
exports.getByUserAndEvent = async (req, res) => {
    try {
        const { userId, eventId } = req.params;
        const belegung = await Belegung.findOne({
            where: { id_person: userId, id_event: eventId },
        });

        res.json({ registered: !!belegung });
    } catch (err) {
        console.error("❌ Fehler bei getByUserAndEvent:", err);
        res.status(500).json({ message: "Serverfehler bei getByUserAndEvent" });
    }
};

// ✅ Anmeldung stornieren
exports.deleteByUserAndEvent = async (req, res) => {
    try {
        const { userId, eventId } = req.params;
        const deleted = await Belegung.destroy({
            where: { id_person: userId, id_event: eventId },
        });

        if (!deleted) {
            return res.status(404).json({ message: "Keine Anmeldung zum Löschen gefunden." });
        }

        res.json({ message: "Anmeldung storniert." });
    } catch (err) {
        console.error("❌ Fehler bei deleteByUserAndEvent:", err);
        res.status(500).json({ message: "Serverfehler beim Löschen" });
    }
};
