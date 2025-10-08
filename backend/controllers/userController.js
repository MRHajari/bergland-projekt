const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Person = require("../models/person");
const { userSchema } = require("../validators/userValidator");

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({ include: [{ model: Person, as: "person" }] });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, { include: [{ model: Person, as: "person" }] });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { error, value } = userSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { email, password, role, person_id } = value;

        const existing = await User.findOne({ where: { email } });
        if (existing) return res.status(400).json({ message: "Email already in use" });

        const hash = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            email,
            password_hash: hash,
            role,
            person_id: person_id || null,
        });

        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const { error, value } = userSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { email, password, role, person_id } = value;
        const updates = { email, role, person_id };

        if (password) updates.password_hash = await bcrypt.hash(password, 10);

        await user.update(updates);
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        await user.destroy();
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
