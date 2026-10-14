// backend/controllers/occupancyController.js
const { Occupancy, Event, Accommodation, Booking } = require("../models");
const occupancySchema = require("../validators/occupancyValidator");

// ============================================================
// ➕ Neue Belegung (Occupancy) anlegen
// ============================================================
exports.createOccupancy = async (req, res, next) => {
    try {
        const { error } = occupancySchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const occupancy = await Occupancy.create({
            event_id: req.body.event_id,
            accommodation_id: req.body.accommodation_id,

            single_rooms_total: req.body.single_rooms_total ?? 0,
            double_rooms_total: req.body.double_rooms_total ?? 0,
            quad_rooms_total: req.body.quad_rooms_total ?? 0,
            quint_rooms_total: req.body.quint_rooms_total ?? 0,
            sext_rooms_total: req.body.sext_rooms_total ?? 0,

            single_rooms_booked: 0,
            double_rooms_booked: 0,
            quad_rooms_booked: 0,
            quint_rooms_booked: 0,
            sext_rooms_booked: 0,
        });

        res.status(201).json(occupancy);
    } catch (err) {
        console.error("❌ Fehler beim Erstellen der Belegung:", err);
        next(err);
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
        next(err);
    }
};

// ============================================================
// 🔍 Belegung für ein Event laden (inkl. verfügbare Kapazität)
// ============================================================
exports.getByEvent = async (req, res, next) => {
    try {
        const occupancies = await Occupancy.findAll({
            where: { event_id: req.params.eventId },
            include: [{ model: Accommodation, as: "accommodation" }],
        });

        const result = occupancies.map((occ) => ({
            ...occ.toJSON(),
            available_single: occ.available_single,
            available_double: occ.available_double,
            available_quad: occ.available_quad,
            available_quint: occ.available_quint,
            available_sext: occ.available_sext,
        }));

        res.json(result);
    } catch (err) {
        next(err);
    }
};

// ============================================================
// ✏️ Update einer bestehenden Belegung
// ============================================================
exports.update = async (req, res, next) => {
    try {
        const occupancy = await Occupancy.findByPk(req.params.id);
        if (!occupancy) {
            return res.status(404).json({ error: "Belegung nicht gefunden." });
        }

        const { error, value } = occupancySchema.validate({
            ...req.body,
            event_id: occupancy.event_id,
            accommodation_id: occupancy.accommodation_id,
        });
        if (error) return res.status(400).json({ error: error.details[0].message });
        for (const type of ["single", "double", "quad", "quint", "sext"]) {
            if ((value[`${type}_rooms_total`] ?? occupancy[`${type}_rooms_total`]) < occupancy[`${type}_rooms_booked`]) {
                return res.status(409).json({ error: "Kapazitaet darf bestehende Buchungen nicht unterschreiten." });
            }
        }
        await occupancy.update(value);
        res.json(occupancy);
    } catch (err) {
        next(err);
    }
};

// ============================================================
// ❌ Belegung löschen
// ============================================================
exports.delete = async (req, res, next) => {
    try {
        const occupancy = await Occupancy.findByPk(req.params.id);
        if (!occupancy) {
            return res.status(404).json({ error: "Belegung nicht gefunden." });
        }

        if (await Booking.count({ where: { event_id: occupancy.event_id, accommodation_id: occupancy.accommodation_id } })) {
            return res.status(409).json({ error: "Fuer diese Unterkunft bestehen Buchungen." });
        }
        await occupancy.destroy();
        res.json({ message: "Occupancy gelöscht." });
    } catch (err) {
        next(err);
    }
};


// ============================================================
// 🔄 Event ↔ Accommodation Zuordnungen neu aufbauen
// ============================================================
exports.updateAssignments = async (req, res, next) => {
    try {
        const { event_id, assignments } = req.body;
        if (!event_id || !Array.isArray(assignments) || assignments.some((entry) => !entry?.accommodation_id)) {
            return res.status(400).json({ error: "event_id und assignments[] sind erforderlich." });
        }

        const selectedIds = [...new Set(assignments.map((entry) => entry.accommodation_id))];
        const accommodations = await Accommodation.findAll({ where: { id: selectedIds } });
        if (accommodations.length !== selectedIds.length) {
            return res.status(400).json({ error: "Unbekannte Unterkunft." });
        }
        const created = await Occupancy.sequelize.transaction(async (transaction) => {
            const existing = await Occupancy.findAll({ where: { event_id }, transaction });
            for (const occupancy of existing) {
                if (selectedIds.includes(occupancy.accommodation_id)) continue;
                const bookings = await Booking.count({ where: { event_id, accommodation_id: occupancy.accommodation_id }, transaction });
                if (bookings) throw Object.assign(new Error("Fuer diese Unterkunft bestehen Buchungen."), { status: 409 });
                await occupancy.destroy({ transaction });
            }
            const result = [];
            for (const accommodation of accommodations) {
                const occupancy = existing.find((entry) => entry.accommodation_id === accommodation.id);
                if (occupancy) {
                    result.push(occupancy);
                    continue;
                }
                result.push(await Occupancy.create({
                    event_id,
                    accommodation_id: accommodation.id,
                    single_rooms_total: accommodation.single_rooms,
                    double_rooms_total: accommodation.double_rooms,
                    quad_rooms_total: accommodation.quad_rooms,
                    quint_rooms_total: accommodation.quint_rooms,
                    sext_rooms_total: accommodation.sext_rooms,
                }, { transaction }));
            }
            return result;
        });

        res.json({ message: "Zuordnungen gespeichert.", created });
    } catch (err) {
        if (err.status === 409) return res.status(409).json({ error: err.message });
        next(err);
    }
};


// ============================================================
// 🏨 Nur Unterkünfte für ein Event (inkl. verfügbarer Betten)
// ============================================================
exports.getAccommodationsByEvent = async (req, res, next) => {
    try {
        const occupancies = await Occupancy.findAll({
            where: { event_id: req.params.eventId },
            include: [{ model: Accommodation, as: "accommodation" }],
        });

        const result = occupancies.map((occ) => ({
            ...occ.accommodation.toJSON(),

            single_rooms_total: occ.single_rooms_total,
            double_rooms_total: occ.double_rooms_total,
            quad_rooms_total: occ.quad_rooms_total,
            quint_rooms_total: occ.quint_rooms_total,
            sext_rooms_total: occ.sext_rooms_total,

            available_single: occ.available_single,
            available_double: occ.available_double,
            available_quad: occ.available_quad,
            available_quint: occ.available_quint,
            available_sext: occ.available_sext,

            occupancy_id: occ.id,
            event_id: occ.event_id,
        }));

        res.json(result);
    } catch (err) {
        next(err);
    }
};


