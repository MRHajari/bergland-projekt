// ============================================================
// 🔹 AUTH CONTROLLER – Registrierung, Login, Tokens, Verifikation (Mailtrap SMTP via Nodemailer)
// ============================================================

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { User, Person, Token, sequelize } = require("../models");
const { registerSchema, loginSchema } = require("../validators/authValidator");
const dotenv = require("dotenv");

dotenv.config();

// ============================================================
// 🔹 ENV Variablen
// ============================================================
const {
    JWT_SECRET,
    JWT_REFRESH_SECRET,
    JWT_EXPIRES_IN = "8h",
    JWT_REFRESH_EXPIRES_IN = "30d",
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
    secure: false, // bei Port 587 -> false
    tls: {
        rejectUnauthorized: false, // optional für lokale Tests
    },
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
        user_id: payload.user.id,
        token,
        expires_at: expiresAt,
    });

    return token;
}

// ============================================================
// 🔹 Registrierung – legt automatisch Person + User an
// ============================================================
exports.register = async (req, res, next) => {
    try {
        const { error, value } = registerSchema.validate(req.body);
        if (error)
            return res.status(400).json({ error: error.details[0].message });

        const {
            first_name,
            last_name,
            birth_date,
            email,
            password,
            phone,
            street,
            postal_code,
            city,
            country,
        } = value;

        // 🧩 E-Mail schon vorhanden?
        const existing = await User.findOne({ where: { email } });
        if (existing)
            return res
                .status(409)
                .json({ error: "Diese E-Mail ist bereits registriert." });

        const password_hash = await bcrypt.hash(password, 10);

        // ✅ Transaktion: Person & User gemeinsam anlegen
        const result = await sequelize.transaction(async (t) => {
            // 1️⃣ Person erstellen – jetzt mit Adressdaten
            const person = await Person.create(
                {
                    first_name,
                    last_name,
                    birth_date,
                    email,
                    phone,
                    street,
                    postal_code,
                    city,
                    country,
                },
                { transaction: t }
            );

            // 2️⃣ User erstellen (verweist auf Person)
            const user = await User.create(
                {
                    email,
                    password_hash,
                    role: "user",
                    is_verified: false,
                    person_id: person.id,
                },
                { transaction: t }
            );

            // 3️⃣ Owner-ID der Person = eigener User
            await person.update({ owner_id: user.id }, { transaction: t });

            return { person, user };
        });

        const { person, user } = result;

        // =====================================================
        // 📧 Verifikationslink erzeugen und senden
        // =====================================================
        const emailToken = jwt.sign({ email }, EMAIL_SECRET, { expiresIn: "1d" });
        const verifyUrl = `http://localhost:4200/verify/${emailToken}`;

        await transporter.sendMail({
            from: '"Pfälzer Bergland" <no-reply@bergland.de>',
            to: email,
            subject: "Bitte bestätige deine E-Mail-Adresse",
            html: `
        <p>Hallo ${first_name},</p>
        <p>Bitte bestätige deine Registrierung durch Klick auf folgenden Link:</p>
        <p><a href="${verifyUrl}" target="_blank">${verifyUrl}</a></p>
        <p>Dieser Link ist 24 Stunden gültig.</p>
        <p>Viele Grüße<br/>Pfälzer Bergland Team</p>
      `,
        });

        // =====================================================
        // ✅ Erfolgsmeldung
        // =====================================================
        res.status(201).json({
            message:
                "Registrierung erfolgreich. Bitte prüfe deine E-Mail zur Verifizierung.",
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                person_id: person.id,
            },
            person: {
                id: person.id,
                first_name: person.first_name,
                last_name: person.last_name,
                email: person.email,
                phone: person.phone,
                street: person.street,
                postal_code: person.postal_code,
                city: person.city,
                country: person.country,
            },
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

        const user = await User.findOne({ where: { email } });
        if (!user)
            return res.status(404).json({ error: "Benutzer nicht gefunden." });

        if (user.is_verified)
            return res.json({ message: "E-Mail wurde bereits bestätigt." });

        await user.update({ is_verified: true });

        res.json({
            message: "E-Mail erfolgreich bestätigt! Du kannst dich jetzt einloggen.",
        });
    } catch (err) {
        console.error("❌ Fehler bei E-Mail-Verifikation:", err);
        res.status(400).json({ error: "Ungültiger oder abgelaufener Link." });
    }
};

// ============================================================
// 🔹 Login (mit person_id im Response)
// ============================================================
exports.login = async (req, res, next) => {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error)
            return res.status(400).json({ error: error.details[0].message });

        const { email, password } = value;

        const user = await User.findOne({
            where: { email },
            include: [{ model: Person, as: "person" }],
        });

        if (!user)
            return res.status(401).json({ error: "Ungültige Zugangsdaten." });

        if (!user.is_verified)
            return res
                .status(403)
                .json({ error: "Bitte bestätige zuerst deine E-Mail-Adresse." });

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid)
            return res.status(401).json({ error: "Ungültige Zugangsdaten." });

        await user.update({ last_login_at: new Date() });

        // ✅ Payload enthält person_id
        const payload = {
            user: {
                id: user.id,
                email: user.email,
                first_name: user.person?.first_name,
                last_name: user.person?.last_name,
                role: user.role,
                person_id: user.person?.id || user.person_id, // ✅ wichtig!
            },
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = await generateRefreshToken(payload);

        // ✅ Vollständiges Response inkl. person_id
        res.json({
            accessToken,
            refreshToken,
            user: {
                ...payload.user,
                person_id: user.person?.id || user.person_id, // 🔥 doppelte Sicherheit
            },
        });
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

        // ✅ echten User aus DB holen
        const dbUser = await User.findByPk(user.id, { include: [{ model: Person, as: "person" }] });
        if (!dbUser) return res.status(404).json({ error: "Benutzer nicht gefunden." });

        // 🧩 Falls person_id im DB-Eintrag fehlt → nachziehen
        if (!dbUser.person_id) {
            const p = await Person.findOne({ where: { email: dbUser.email } });
            if (p) {
                await dbUser.update({ person_id: p.id });
            } else {
                const created = await Person.create({
                    first_name: dbUser.person?.first_name || "Vorname",
                    last_name: dbUser.person?.last_name || "Nachname",
                    email: dbUser.email,
                    owner_id: dbUser.id,
                });
                await dbUser.update({ person_id: created.id });
            }
            await dbUser.reload({ include: [{ model: Person, as: "person" }] });
        }

        const newPayload = {
            user: {
                id: dbUser.id,
                email: dbUser.email,
                role: dbUser.role,
                person_id: dbUser.person_id,
                first_name: dbUser.person?.first_name,
                last_name: dbUser.person?.last_name,
            },
        };

        const newAccessToken = generateAccessToken(newPayload);
        const newRefreshToken = await generateRefreshToken(newPayload);

        storedToken.revoked = true;
        await storedToken.save();

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            user: newPayload.user,
        });
    } catch (err) {
        console.error("❌ Refresh fehlgeschlagen:", err);
        res.status(403).json({ error: "Ungültiger oder abgelaufener Refresh-Token." });
    }
};


// ============================================================
// 🔹 Logout
// ============================================================
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
