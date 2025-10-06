const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { registerSchema, loginSchema } = require("../validators/authValidator");
const { Person, LoginData, Token } = require("../models"); // ✅ nur diese Zeile!

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2h";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

// 🔹 Token-Generatoren
function generateAccessToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

async function generateRefreshToken(payload) {
    const token = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
    const decoded = jwt.decode(token);
    const expiresAt = new Date(decoded.exp * 1000);

    await Token.create({
        person_id: payload.user.id, // ✅ angepasst auf deine neue Payload-Struktur
        token,
        expires_at: expiresAt,
    });

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

        const payload = {
            user: {
                id: person.id,
                email: person.email,
                first_name: person.first_name,
                last_name: person.last_name,
                role: login.role,
            },
        };

        // ✅ Tokens generieren
        const accessToken = generateAccessToken(payload);
        const refreshToken = await generateRefreshToken(payload);

        res.json({
            accessToken,
            refreshToken,
            user: payload.user,
        });
    } catch (err) {
        next(err);
    }
};

// 🔹 Token-Refresh
exports.refreshToken = async (req, res) => {
    const { token } = req.body || {};
    if (!token) return res.status(401).json({ error: "No token provided" });

    const storedToken = await Token.findOne({ where: { token, revoked: false } });
    if (!storedToken) return res.status(403).json({ error: "Invalid or revoked token" });

    try {
        const { user } = jwt.verify(token, JWT_REFRESH_SECRET);

        const newAccessToken = generateAccessToken({ user });
        const newRefreshToken = await generateRefreshToken({ user });

        storedToken.revoked = true;
        await storedToken.save();

        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (err) {
        res.status(403).json({ error: "Invalid refresh token" });
    }
};

// 🔹 Logout
exports.logout = async (req, res) => {
    const { token } = req.body || {};
    if (!token) return res.status(400).json({ error: "No token provided" });

    const storedToken = await Token.findOne({ where: { token } });
    if (storedToken) {
        storedToken.revoked = true;
        await storedToken.save();
    }

    res.json({ message: "Logged out successfully" });
};
