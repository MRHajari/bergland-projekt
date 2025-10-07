// backend/controllers/personController.js
const { Person, LoginData } = require("../models");
const bcrypt = require("bcrypt");

// 🔹 Alle Personen abrufen
// Get all persons with login data (role)
// 🔹 Get all persons with login data (role)
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

        // Flat structure: { id, first_name, ..., role }
        const result = persons.map(p => ({
            id: p.id,
            first_name: p.first_name,
            last_name: p.last_name,
            email: p.email,
            birth_date: p.birth_date, // 🆕 Include birth date
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

exports.registerPerson = async (req, res, next) => {
    try {
        const { first_name, last_name, email, password, birth_date } = req.body;

        // Prüfen, ob E-Mail schon existiert
        const existing = await Person.findOne({ where: { email } });
        if (existing) {
            return res.status(400).json({ message: "E-Mail ist bereits registriert" });
        }

        // Neue Person anlegen
        const person = await Person.create({
            first_name,
            last_name,
            email,
            birth_date,
        });

        // Passwort speichern in LoginData
        const hashedPassword = await bcrypt.hash(password, 10);
        await LoginData.create({
            person_id: person.id,
            password_hash: hashedPassword,
            role: "user", // Standardrolle
        });

        res.status(201).json({
            message: "Registrierung erfolgreich",
            person: {
                id: person.id,
                first_name: person.first_name,
                last_name: person.last_name,
                email: person.email,
                birth_date: person.birth_date,
            },
        });
    } catch (err) {
        next(err);
    }
};
