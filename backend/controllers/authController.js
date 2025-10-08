// ============================================================
// 🔹 AUTH CONTROLLER – Registrierung, Login, Tokens, Verifikation (Mailtrap SMTP via Nodemailer)
// ============================================================

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { Person, LoginData, Token, sequelize } = require("../models");
const { registerSchema, loginSchema } = require("../validators/authValidator");
const dotenv = require("dotenv");

dotenv.config();

// ============================================================
// 🔹 ENV Variablen
// ============================================================
const {
    JWT_SECRET,
    JWT_REFRESH_SECRET,
    JWT_EXPIRES_IN = "2h",
    JWT_REFRESH_EXPIRES_IN = "7d",
    EMAIL_SECRET,
    MAIL_HOST,
    MAIL_PORT,
    MAIL_USER,
    MAIL_PASS,
} = process.env;

// ============================================================
// 🔹 Mailtrap SMTP Transporter einrichten
// ============================================================
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
    secure: false,
    tls: { rejectUnauthorized: false },
});

// ✅ Verbindung testen
(async () => {
    try {
        await transporter.verify();
        console.log("✅ Mailtrap SMTP verbunden!");
    } catch (err) {
        console.error("❌ Mailtrap Verbindung fehlgeschlagen:", err.message);
    }
})();




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
// 🔹 Registrierung mit E-Mail-Verifikation
// ============================================================
exports.register = async (req, res, next) => {
    try {
        const { error } = registerSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { first_name, last_name, birth_date, email, password } = req.body;

        const existing = await Person.findOne({ where: { email } });
        if (existing)
            return res.status(409).json({ error: "Diese E-Mail ist bereits registriert." });

        const password_hash = await bcrypt.hash(password, 10);

        const result = await sequelize.transaction(async (t) => {
            const person = await Person.create(
                { first_name, last_name, birth_date, email },
                { transaction: t }
            );

            const login = await LoginData.create(
                { person_id: person.id, password_hash, role: "user", is_verified: false },
                { transaction: t }
            );

            return { person, login };
        });

        // 🔹 Verifikationslink erzeugen
        const emailToken = jwt.sign({ email }, EMAIL_SECRET, { expiresIn: "1d" });
        const verifyUrl = `http://localhost:4200/verify/${emailToken}`;

        // 🔹 Mail senden via Mailtrap SMTP
        await transporter.sendMail({
            from: '"Pfälzer Bergland" <no-reply@bergland.de>',
            to: email,
            subject: "Bitte bestätige deine E-Mail-Adresse",
            html: `
        <p>Hallo ${first_name},</p>
        <p>Bitte bestätige deine Registrierung durch Klick auf den folgenden Link:</p>
        <p><a href="${verifyUrl}" target="_blank">${verifyUrl}</a></p>
        <p>Dieser Link ist 24 Stunden gültig.</p>
        <p>Viele Grüße<br/>Pfälzer Bergland Team</p>
      `,
        });

        res.status(201).json({
            message:
                "Registrierung erfolgreich. Bitte prüfe deine Mailtrap-Inbox, um dein Konto zu bestätigen.",
        });
    } catch (err) {
        console.error("❌ Fehler bei Registrierung:", err);
        next(err);
    }
};

// ============================================================
// 🔹 E-Mail-Verifikation
// ============================================================
exports.verifyEmail = async (req, res) => {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, EMAIL_SECRET);
        const { email } = decoded;

        const person = await Person.findOne({ where: { email } });
        if (!person) return res.status(404).json({ error: "Benutzer nicht gefunden." });

        const login = await LoginData.findOne({ where: { person_id: person.id } });
        if (!login) return res.status(404).json({ error: "Login-Daten nicht gefunden." });

        if (login.is_verified)
            return res.json({ message: "E-Mail wurde bereits bestätigt." });

        await login.update({ is_verified: true });

        res.json({ message: "E-Mail erfolgreich bestätigt! Du kannst dich jetzt einloggen." });
    } catch (err) {
        console.error("❌ Fehler bei E-Mail-Verifikation:", err);
        res.status(400).json({ error: "Ungültiger oder abgelaufener Link." });
    }
};

// ============================================================
// 🔹 Login (nur wenn verifiziert)
// ============================================================
exports.login = async (req, res, next) => {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { email, password } = value;

        const person = await Person.findOne({ where: { email } });
        if (!person) return res.status(401).json({ error: "Ungültige Zugangsdaten." });

        const login = await LoginData.findOne({ where: { person_id: person.id } });


        if (!login) return res.status(401).json({ error: "Ungültige Zugangsdaten." });

        console.log('valid ----: ', login);

        if (!login.is_verified)
            return res.status(403).json({
                error: "Bitte bestätige zuerst deine E-Mail-Adresse.",
            });

        const valid = await bcrypt.compare(password, login.password_hash);
        console.log('valid ----: ', valid);
        if (!valid) return res.status(401).json({ error: "Ungültige Zugangsdaten." });

        await login.update({ last_login_at: new Date() });

        const payload = {
            user: {
                id: person.id,
                email: person.email,
                first_name: person.first_name,
                last_name: person.last_name,
                role: login.role,
            },
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = await generateRefreshToken(payload);

        res.json({ accessToken, refreshToken, user: payload.user });
    } catch (err) {
        console.error("❌ Fehler beim Login:", err);
        next(err);
    }
};

// ============================================================
// 🔹 Token-Refresh & Logout
// ============================================================
exports.refreshToken = async (req, res) => {
    const { token } = req.body || {};
    if (!token) return res.status(401).json({ error: "Kein Token angegeben." });

    const storedToken = await Token.findOne({ where: { token, revoked: false } });
    if (!storedToken)
        return res.status(403).json({ error: "Ungültiger oder widerrufener Token." });

    try {
        const { user } = jwt.verify(token, JWT_REFRESH_SECRET);
        const newAccessToken = generateAccessToken({ user });
        const newRefreshToken = await generateRefreshToken({ user });

        storedToken.revoked = true;
        await storedToken.save();

        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch {
        res.status(403).json({ error: "Ungültiger Refresh-Token." });
    }
};

exports.logout = async (req, res) => {
    const { token } = req.body || {};
    if (!token) return res.status(400).json({ error: "Kein Token angegeben." });

    const storedToken = await Token.findOne({ where: { token } });
    if (storedToken) {
        storedToken.revoked = true;
        await storedToken.save();
    }

    res.json({ message: "Erfolgreich ausgeloggt." });
};
