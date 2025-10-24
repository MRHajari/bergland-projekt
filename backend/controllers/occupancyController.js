// backend/controllers/occupancyController.js
const { Occupancy, Event, Accommodation } = require("../models");
const occupancySchema = require("../validators/occupancyValidator");

// ============================================================
// ➕ Neue Belegung (Occupancy) anlegen
// ============================================================
exports.createOccupancy = async (req, res, next) => {
    try {
        const { error } = occupancySchema.validate(req.body);
        if (error)
            return res.status(400).json({ error: error.details[0].message });
        console.log("📥 Erstelle neue Belegung mit Daten:", req.body);

        const payload = {
            ...req.body,
            single_beds_total: req.body.single_beds_total || 0,
            double_beds_total: req.body.double_beds_total || 0,
            multi_beds_total: req.body.multi_beds_total || 0,
            single_beds_booked: 0,
            double_beds_booked: 0,
            multi_beds_booked: 0,
        };

        const occupancy = await Occupancy.create(payload);
        res.status(201).json(occupancy);
    } catch (err) {
        console.error("❌ Fehler beim Erstellen der Belegung:", err);
        return next(err);
    }
};

// ============================================================
// 📋 Alle Belegungen laden
// ============================================================
exports.getAll = async (req, res, next) => {
    try {
        const data = await Occupancy.findAll({
            include: [
                { model: Event, as: "event" },
                { model: Accommodation, as: "accommodation" },
            ],
        });
        res.json(data);
    } catch (err) {
        console.error("❌ Fehler beim Laden:", err);
        return next(err);
    }
};

// ============================================================
// 🔍 Belegung für ein Event laden (inkl. verfügbare Kapazität)
// ============================================================
exports.getByEvent = async (req, res, next) => {
    try {
        const data = await Occupancy.findAll({
            where: { event_id: req.params.eventId },
            include: [{ model: Accommodation, as: "accommodation" }],
        });

        // 🧮 berechnete Verfügbarkeiten anhängen (zur Sicherheit, falls Virtual nicht in JSON landet)
        const result = data.map((occ) => ({
            ...occ.toJSON(),
            available_single:
                occ.single_beds_total - occ.single_beds_booked,
            available_double:
                occ.double_beds_total - occ.double_beds_booked,
            available_multi:
                occ.multi_beds_total - occ.multi_beds_booked,
        }));

        res.json(result);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Event-Belegung:", err);
        return next(err);
    }
};

// ============================================================
// ✏️ Update einer bestehenden Belegung
// ============================================================
exports.update = async (req, res, next) => {
    try {
        const occupancy = await Occupancy.findByPk(req.params.id);
        if (!occupancy)
            return res.status(404).json({ error: "Belegung nicht gefunden" });

        await occupancy.update(req.body);
        res.json(occupancy);
    } catch (err) {
        console.error("❌ Fehler beim Aktualisieren:", err);
        return next(err);
    }
};

// ============================================================
// ❌ Belegung löschen
// ============================================================
exports.delete = async (req, res, next) => {
    try {
        const occupancy = await Occupancy.findByPk(req.params.id);
        if (!occupancy)
            return res.status(404).json({ error: "Belegung nicht gefunden" });

        await occupancy.destroy();
        res.json({ message: "✅ Occupancy gelöscht" });
    } catch (err) {
        console.error("❌ Fehler beim Löschen:", err);
        return next(err);
    }
};


// ============================================================
// 🔄 Event ↔ Accommodation Zuordnungen neu aufbauen
// ============================================================
exports.updateAssignments = async (req, res, next) => {
    try {
        const { event_id, assignments } = req.body;
        if (!event_id)
            return res.status(400).json({ error: "event_id ist erforderlich" });

        // Alte Einträge für dieses Event löschen
        await Occupancy.destroy({ where: { event_id } });

        if (Array.isArray(assignments) && assignments.length > 0) {
            console.log("📦 Eingehende Assignments:", JSON.stringify(assignments, null, 2));

            const created = [];

            for (const a of assignments) {
                // 🔍 Unterkunft laden
                const accommodation = await Accommodation.findByPk(a.accommodation_id);
                console.log(`🔍 Unterkunft geladen für ID ${a.accommodation_id}:`, accommodation ? accommodation.toJSON() : null);

                if (!accommodation) {
                    console.warn(`⚠️ Unterkunft ${a.accommodation_id} nicht gefunden – übersprungen`);
                    continue;
                }

                // 📊 Belegungseintrag mit Werten aus Unterkunft
                const occ = await Occupancy.create({
                    event_id,
                    accommodation_id: a.accommodation_id,
                    single_beds_total: accommodation.single_rooms ?? 0,
                    double_beds_total: accommodation.double_rooms ?? 0,
                    multi_beds_total: accommodation.multi_bed_rooms ?? 0,
                    single_beds_booked: 0,
                    double_beds_booked: 0,
                    multi_beds_booked: 0,
                });

                created.push(occ);
            }

            return res.status(200).json({
                message: "✅ Zuordnungen gespeichert",
                created,
            });
        }

        return res.status(200).json({
            message: "✅ Alle Zuordnungen entfernt (leer übermittelt)",
        });
    } catch (err) {
        console.error("❌ Fehler beim Aktualisieren der Zuordnungen:", err);
        return next(err);
    }
};



// ============================================================
// 🏨 Nur Unterkünfte für ein Event (inkl. verfügbarer Betten)
// ============================================================
exports.getAccommodationsByEvent = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;

        const occupancies = await Occupancy.findAll({
            where: { event_id: eventId },
            include: [
                {
                    model: Accommodation,
                    as: "accommodation",
                    attributes: [
                        "id",
                        "name",
                        "street",
                        "postal_code",
                        "city",
                        "country",
                        "description",
                    ],
                },
            ],
        });

        const accommodations = occupancies.map((occ) => {
            const acc = occ.accommodation?.toJSON() || {};

            return {
                ...acc,
                // 🔹 Daten aus occupancy (Gesamt & verfügbar)
                single_beds_total: occ.single_beds_total,
                double_beds_total: occ.double_beds_total,
                multi_beds_total: occ.multi_beds_total,

                available_single: Math.max(occ.single_beds_total - occ.single_beds_booked, 0),
                available_double: Math.max(occ.double_beds_total - occ.double_beds_booked, 0),
                available_multi: Math.max(occ.multi_beds_total - occ.multi_beds_booked, 0),

                // 🔹 Referenzen
                occupancy_id: occ.id,
                event_id: occ.event_id,
            };
        });

        res.json(accommodations);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Unterkünfte für Event:", err);
        return next(err);
    }
};


