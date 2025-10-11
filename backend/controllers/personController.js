const Person = require("../models/person");

const { personSchema } = require("../validators/personValidator");

/**
 * PersonController
 * CRUD-Logik für Personen, inkl. Filter nach owner_id (Besitzer)
 */

// 📋 Alle Personen abrufen
exports.getAllPersons = async (req, res) => {
    try {
        const { owner_id } = req.query;

        const where = owner_id ? { owner_id } : {}; // optionaler Filter
        const persons = await Person.findAll({ where });

        res.json(persons);
    } catch (error) {
        console.error("❌ Fehler beim Laden der Personen:", error);
        res.status(500).json({ message: error.message });
    }
};

// 🔍 Eine Person abrufen
exports.getPersonById = async (req, res) => {
    try {
        const person = await Person.findByPk(req.params.id);
        if (!person)
            return res.status(404).json({ message: "Person nicht gefunden" });
        res.json(person);
    } catch (error) {
        console.error("❌ Fehler beim Abrufen der Person:", error);
        res.status(500).json({ message: error.message });
    }
};

// ➕ Neue Person erstellen

exports.createPerson = async (req, res) => {
    try {
        const data = req.body;

        // 🧠 SQLite akzeptiert kein "undefined" oder leeren String als FK → auf null setzen
        if (!data.owner_id || data.owner_id === "undefined" || data.owner_id === "") {
            data.owner_id = null;
        }

        // Email leer → auf null setzen
        if (!data.email || data.email.trim() === "") {
            data.email = null;
        }

        const newPerson = await Person.create(data);
        return res.status(201).json(newPerson);
    } catch (error) {
        console.error("❌ Fehler beim Erstellen der Person:", error);
        return res.status(500).json({
            message: error.message || "Fehler beim Erstellen der Person.",
        });
    }
};


// ✏️ Person aktualisieren
exports.updatePerson = async (req, res) => {
    try {
        const person = await Person.findByPk(req.params.id);
        if (!person)
            return res.status(404).json({ message: "Person nicht gefunden" });

        const { error, value } = personSchema.validate(req.body);
        if (error)
            return res
                .status(400)
                .json({ message: error.details[0].message });

        await person.update(value);
        res.json(person);
    } catch (err) {
        console.error("❌ Fehler beim Aktualisieren der Person:", err);
        res.status(500).json({ message: err.message });
    }
};

// ❌ Person löschen
exports.deletePerson = async (req, res) => {
    try {
        const person = await Person.findByPk(req.params.id);
        if (!person)
            return res.status(404).json({ message: "Person nicht gefunden" });

        await person.destroy();
        res.json({ message: "Person erfolgreich gelöscht" });
    } catch (err) {
        console.error("❌ Fehler beim Löschen der Person:", err);
        res.status(500).json({ message: err.message });
    }
};
