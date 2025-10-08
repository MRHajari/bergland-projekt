const Person = require("../models/person");
const { personSchema } = require("../validators/personValidator");

exports.getAllPersons = async (req, res) => {
    try {
        const persons = await Person.findAll();
        res.json(persons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPersonById = async (req, res) => {
    try {
        const person = await Person.findByPk(req.params.id);
        if (!person) return res.status(404).json({ message: "Person not found" });
        res.json(person);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createPerson = async (req, res) => {
    try {
        const { error, value } = personSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const person = await Person.create(value);
        res.status(201).json(person);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updatePerson = async (req, res) => {
    try {
        const person = await Person.findByPk(req.params.id);
        if (!person) return res.status(404).json({ message: "Person not found" });

        const { error, value } = personSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        await person.update(value);
        res.json(person);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deletePerson = async (req, res) => {
    try {
        const person = await Person.findByPk(req.params.id);
        if (!person) return res.status(404).json({ message: "Person not found" });

        await person.destroy();
        res.json({ message: "Person deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
