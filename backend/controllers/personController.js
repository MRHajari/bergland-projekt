const Person = require("../models/person");
const { personSchema } = require("../validators/personValidator");

/**
 * PersonController
 * CRUD-Logik für Personen, inkl. Filter nach owner_id (Besitzer)
 */

// 📋 Alle Personen abrufen (eigene + optional Filter)
exports.getAll = async (req, res) => {
    try {
        const ownerId = req.query.owner_id || req.user?.id;
        console.log("📥 Lade Personen für owner_id:", ownerId);

        const whereClause = ownerId ? { owner_id: ownerId } : undefined;
        const persons = await Person.findAll({ where: whereClause });

        res.json(persons);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Personen:", err);
        res.status(500).json({ message: "Fehler beim Laden der Personen." });
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
exports.create = async (req, res) => {
    try {
        const { first_name, last_name, birth_date, email } = req.body;
        const owner_id = req.user?.id || req.body.owner_id;

        if (!first_name || !last_name || !owner_id)
            return res.status(400).json({ message: "Vorname, Nachname und owner_id sind erforderlich" });

        // 🔎 Doppelprüfung: existiert bereits eine Person mit gleichem Namen + Owner?
        const existing = await Person.findOne({
            where: {
                first_name: first_name.trim(),
                last_name: last_name.trim(),
                owner_id
            }
        });

        if (existing) {
            return res.status(409).json({
                message: `Die Person "${first_name} ${last_name}" ist bereits registriert.`,
                person: existing
            });
        }

        // ✳️ Optional zusätzlich prüfen: Email eindeutig?
        if (email) {
            const existingEmail = await Person.findOne({ where: { email } });
            if (existingEmail) {
                return res.status(409).json({
                    message: `Die E-Mail "${email}" wird bereits verwendet.`,
                    person: existingEmail
                });
            }
        }

        // ✅ Person anlegen
        const newPerson = await Person.create({
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            birth_date,
            email,
            owner_id,
        });

        res.status(201).json(newPerson);
    } catch (err) {
        console.error("❌ Fehler beim Erstellen einer Person:", err);
        res.status(500).json({ message: "Serverfehler beim Erstellen der Person" });
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
