const { Person } = require("../models");
const bcrypt = require("bcryptjs");

// Neue Person registrieren
exports.registerPerson = async (req, res, next) => {
    try {
        const { first_name, last_name, email, password, birth_date } = req.body;

        // Prüfen, ob Person existiert
        const existing = await Person.findOne({ where: { email } });
        if (existing)
            return res.status(400).json({ message: "E-Mail ist bereits registriert" });

        // Person erstellen
        const person = await Person.create({
            first_name,
            last_name,
            email,
            password,
            birth_date,
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

// (Optional) alle Personen abrufen
exports.getAllPersons = async (req, res, next) => {
    try {
        const persons = await Person.findAll();
        res.json(persons);
    } catch (err) {
        next(err);
    }
};
