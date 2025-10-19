// backend/controllers/occupancyController.js
const { Occupancy, Event, Accommodation } = require("../models");
const occupancySchema = require("../validators/occupancyValidator");

// ➕ Neue Belegung anlegen
exports.createOccupancy = async (req, res, next) => {
    try {
        const { error } = occupancySchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

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

// 📋 Alle Belegungen
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

// 🔍 Belegung nach Event
exports.getByEvent = async (req, res, next) => {
    try {
        const data = await Occupancy.findAll({
            where: { event_id: req.params.eventId },
            include: [{ model: Accommodation, as: "accommodation" }],
        });
        res.json(data);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Event-Belegung:", err);
        return next(err);
    }
};

// ✏️ Update
exports.update = async (req, res, next) => {
    try {
        const occupancy = await Occupancy.findByPk(req.params.id);
        if (!occupancy) return res.status(404).json({ error: "Not found" });

        await occupancy.update(req.body);
        res.json(occupancy);
    } catch (err) {
        console.error("❌ Fehler beim Aktualisieren:", err);
        return next(err);
    }
};

// ❌ Delete
exports.delete = async (req, res, next) => {
    try {
        const occupancy = await Occupancy.findByPk(req.params.id);
        if (!occupancy) return res.status(404).json({ error: "Not found" });

        await occupancy.destroy();
        res.json({ message: "Occupancy deleted" });
    } catch (err) {
        console.error("❌ Fehler beim Löschen:", err);
        return next(err);
    }
};

// 🔄 Event ↔ Accommodation Zuordnungen aktualisieren
exports.updateAssignments = async (req, res, next) => {
    try {
        const { event_id, assignments } = req.body;

        if (!event_id) {
            return res.status(400).json({ error: "event_id ist erforderlich" });
        }

        // 🧹 Alte Zuordnungen für dieses Event löschen
        await Occupancy.destroy({ where: { event_id } });

        // 🆕 Neue Zuordnungen einfügen
        if (Array.isArray(assignments) && assignments.length > 0) {
            const created = await Promise.all(
                assignments.map((a) =>
                    Occupancy.create({
                        event_id,
                        accommodation_id: a.accommodation_id,
                        single_beds_total: a.single_beds_total || 0,
                        double_beds_total: a.double_beds_total || 0,
                        multi_beds_total: a.multi_beds_total || 0,
                        single_beds_booked: 0,
                        double_beds_booked: 0,
                        multi_beds_booked: 0,
                    })
                )
            );
            return res.status(200).json({ message: "✅ Zuordnungen gespeichert", created });
        }

        return res.status(200).json({ message: "✅ Alle Zuordnungen entfernt (leer übermittelt)" });
    } catch (err) {
        console.error("❌ Fehler beim Aktualisieren der Zuordnungen:", err);
        return next(err);
    }
};

// backend/controllers/occupancyController.js
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
                        "single_rooms",
                        "double_rooms",
                        "multi_bed_rooms",
                        "description",
                    ],
                },
            ],
        });

        // 🔹 Nur die Unterkünfte extrahieren
        const accommodations = occupancies
            .map((occ) => occ.accommodation)
            .filter((acc) => !!acc);

        res.json(accommodations);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Unterkünfte für Event:", err);
        return next(err);
    }
};
