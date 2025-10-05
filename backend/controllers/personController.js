// backend/controllers/personController.js
const { Person } = require("../models");

// 🔹 Alle Personen abrufen
// Get all persons with login data (role)
exports.getAllPersons = async (req, res, next) => {
    try {
        const persons = await Person.findAll({
            include: [
                {
                    association: "loginData",
                    attributes: ["role"]
                }
            ]
        });

        // Flache Struktur: { id, first_name, ..., role }
        const result = persons.map(p => ({
            id: p.id,
            first_name: p.first_name,
            last_name: p.last_name,
            email: p.email,
            role: p.loginData?.role || "user"
        }));

        res.json(result);
    } catch (err) {
        next(err);
    }
};


// 🔹 Einzelne Person abrufen
exports.getPersonById = async (req, res, next) => {
    try {
        const person = await Person.findByPk(req.params.id);
        if (!person) return res.status(404).json({ error: "Person not found" });
        res.json(person);
    } catch (err) {
        next(err);
    }
};

// 🔹 Neue Person erstellen
exports.createPerson = async (req, res, next) => {
    try {
        const person = await Person.create(req.body);
        res.json(person);
    } catch (err) {
        next(err);
    }
};

// 🔹 Bestehende Person aktualisieren
exports.updatePerson = async (req, res, next) => {
    try {
        const person = await Person.findByPk(req.params.id);
        if (!person) return res.status(404).json({ error: "Person not found" });

        await person.update(req.body);
        res.json(person);
    } catch (err) {
        next(err);
    }
};

// 🔹 Person löschen
exports.deletePerson = async (req, res, next) => {
    try {
        const person = await Person.findByPk(req.params.id);
        if (!person) return res.status(404).json({ error: "Person not found" });

        await person.destroy();
        res.json({ message: "Person deleted successfully" });
    } catch (err) {
        next(err);
    }
};
