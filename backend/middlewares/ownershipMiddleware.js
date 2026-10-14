const { Person, EventRegistration, Invoice, Booking } = require("../models");

function requireOwnership(model, selectId, personField) {
    return async (req, res, next) => {
        if (req.user.role === "admin") return next();
        const id = selectId(req);
        if (!id) return res.status(400).json({ message: "Datensatz-ID fehlt." });
        const record = await model.findByPk(id);
        if (!record) return res.status(404).json({ message: "Datensatz nicht gefunden." });
        const person = personField ? await Person.findByPk(record[personField]) : record;
        const ownerId = model === Booking ? record.user_id : person?.owner_id;
        if (ownerId !== req.user.id) {
            return res.status(403).json({ message: "Keine Berechtigung." });
        }
        next();
    };
}

exports.requirePersonAccess = (selectId) => requireOwnership(Person, selectId);
exports.requireRegistrationAccess = (selectId) => requireOwnership(EventRegistration, selectId, "registered_by_person_id");
exports.requireInvoiceAccess = (selectId) => requireOwnership(Invoice, selectId, "id_person");
exports.requireBookingAccess = (selectId) => requireOwnership(Booking, selectId);