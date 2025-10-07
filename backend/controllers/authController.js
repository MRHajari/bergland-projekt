// ============================================================
// 🔹 AUTH CONTROLLER – Registrierung, Login, Tokens
// ============================================================
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Person, LoginData, Token, sequelize } = require("../models");
const { registerSchema, loginSchema } = require("../validators/authValidator");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2h";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

// ============================================================
// 🔹 Token-Generatoren
// ============================================================
function generateAccessToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

async function generateRefreshToken(payload) {
    const token = jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
    });

    const decoded = jwt.decode(token);
    const expiresAt = new Date(decoded.exp * 1000);

    await Token.create({
        person_id: payload.user.id,
        token,
        expires_at: expiresAt,
    });

    return token;
}

// ============================================================
// 🔹 Registrierung
// ============================================================
exports.register = async (req, res, next) => {
    try {
        // 1️⃣ Eingaben validieren
        const { error } = registerSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { first_name, last_name, birth_date, email, password } = req.body;

        // 2️⃣ E-Mail prüfen
        const existing = await Person.findOne({ where: { email } });
        if (existing) {
            return res
                .status(409)
                .json({ error: "Diese E-Mail ist bereits registriert." });
        }

        // 3️⃣ Passwort hashen
        const password_hash = await bcrypt.hash(password, 10);

        // 4️⃣ Transaktion: Person + LoginData
        const result = await sequelize.transaction(async (t) => {
            const person = await Person.create(
                { first_name, last_name, birth_date, email },
                { transaction: t }
            );

            const login = await LoginData.create(
                { person_id: person.id, password_hash, role: "user" },
                { transaction: t }
            );

            return { person, login };
        });

        // 5️⃣ Antwort
        res.status(201).json({
            message: "Registrierung erfolgreich",
            user: {
                id: result.person.id,
                first_name: result.person.first_name,
                last_name: result.person.last_name,
                birth_date: result.person.birth_date,
                email: result.person.email,
                role: result.login.role,
            },
        });
    } catch (err) {
        console.error("❌ Fehler bei Registrierung:", err);
        next(err);
    }
};

// ============================================================
// 🔹 Login
// ============================================================
exports.login = async (req, res, next) => {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { email, password } = value;

        // Person finden
        const person = await Person.findOne({ where: { email } });
        if (!person) return res.status(401).json({ error: "Ungültige Zugangsdaten" });

        // LoginData abrufen
        const login = await LoginData.findOne({ where: { person_id: person.id } });
        if (!login) return res.status(401).json({ error: "Ungültige Zugangsdaten" });

        // Passwort prüfen
        const valid = await bcrypt.compare(password, login.password_hash);
        if (!valid) return res.status(401).json({ error: "Ungültige Zugangsdaten" });

        // Letzter Login speichern
        await login.update({ last_login_at: new Date() });

        // Payload für Tokens
        const payload = {
            user: {
                id: person.id,
                email: person.email,
                first_name: person.first_name,
                last_name: person.last_name,
                role: login.role,
            },
        };

        // Tokens generieren
        const accessToken = generateAccessToken(payload);
        const refreshToken = await generateRefreshToken(payload);

        res.json({
            accessToken,
            refreshToken,
            user: payload.user,
        });
    } catch (err) {
        console.error("❌ Fehler beim Login:", err);
        next(err);
    }
};

// ============================================================
// 🔹 Token-Refresh
// ============================================================
exports.refreshToken = async (req, res) => {
    const { token } = req.body || {};
    if (!token) return res.status(401).json({ error: "Kein Token angegeben" });

    const storedToken = await Token.findOne({
        where: { token, revoked: false },
    });
    if (!storedToken)
        return res.status(403).json({ error: "Ungültiger oder widerrufener Token" });

    try {
        const { user } = jwt.verify(token, JWT_REFRESH_SECRET);

        const newAccessToken = generateAccessToken({ user });
        const newRefreshToken = await generateRefreshToken({ user });

        // alten Token widerrufen
        storedToken.revoked = true;
        await storedToken.save();

        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (err) {
        res.status(403).json({ error: "Ungültiger Refresh-Token" });
    }
};

// ============================================================
// 🔹 Logout
// ============================================================
exports.logout = async (req, res) => {
    const { token } = req.body || {};
    if (!token) return res.status(400).json({ error: "Kein Token angegeben" });

    const storedToken = await Token.findOne({ where: { token } });
    if (storedToken) {
        storedToken.revoked = true;
        await storedToken.save();
    }

    res.json({ message: "Erfolgreich ausgeloggt" });
};
