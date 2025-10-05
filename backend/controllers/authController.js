// backend/controllers/authController.js
const { Person, LoginData } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { registerSchema, loginSchema } = require("../validators/authValidator");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2h"; // länger fürs Testen
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

// Temporärer Refresh-Token-Speicher
let refreshTokens = [];

// 🔹 Token-Generatoren
function generateAccessToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function generateRefreshToken(payload) {
    const token = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
    refreshTokens.push(token);
    return token;
}

// 🔹 Registrierung
exports.register = async (req, res, next) => {
    try {
        const { error, value } = registerSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { first_name, last_name, email, password, role } = value;

        const existing = await Person.findOne({ where: { email } });
        if (existing) return res.status(400).json({ error: "Email already registered" });

        const person = await Person.create({ first_name, last_name, email });
        const password_hash = await bcrypt.hash(password, 10);

        await LoginData.create({
            person_id: person.id,
            password_hash,
            role: role || "user",
            last_login_at: null,
        });

        res.json({
            message: "User registered successfully",
            user: { id: person.id, email, role: role || "user" },
        });
    } catch (err) {
        next(err);
    }
};

// 🔹 Login
exports.login = async (req, res, next) => {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { email, password } = value;

        const person = await Person.findOne({ where: { email } });
        if (!person) return res.status(401).json({ error: "Invalid credentials" });

        const login = await LoginData.findOne({ where: { person_id: person.id } });
        if (!login) return res.status(401).json({ error: "Invalid credentials" });

        const valid = await bcrypt.compare(password, login.password_hash);
        if (!valid) return res.status(401).json({ error: "Invalid credentials" });

        await login.update({ last_login_at: new Date() });

        const payload = { id: person.id, role: login.role };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        // ✅ Alten Refresh-Token entfernen (nur einen pro User)
        refreshTokens = refreshTokens.filter((t) => t !== refreshToken);

        res.json({
            accessToken,
            refreshToken,
            user: {
                id: person.id,
                email: person.email,
                role: login.role,
                first_name: person.first_name,
                last_name: person.last_name,
            },
        });
    } catch (err) {
        next(err);
    }
};

// 🔹 Token-Refresh
exports.refreshToken = (req, res) => {
    const { token } = req.body || {};
    if (!token) return res.status(401).json({ error: "No token provided" });
    if (!refreshTokens.includes(token)) return res.status(403).json({ error: "Invalid refresh token" });

    jwt.verify(token, JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid refresh token" });

        // 🔁 Neue Tokens ausstellen
        const newAccessToken = generateAccessToken({ id: user.id, role: user.role });
        const newRefreshToken = generateRefreshToken({ id: user.id, role: user.role });

        // Alten Refresh-Token ersetzen
        refreshTokens = refreshTokens.filter((t) => t !== token);
        refreshTokens.push(newRefreshToken);

        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    });
};

// 🔹 Logout
exports.logout = (req, res) => {
    const { token } = req.body || {};
    refreshTokens = refreshTokens.filter((t) => t !== token);
    res.json({ message: "Logged out successfully" });
};
