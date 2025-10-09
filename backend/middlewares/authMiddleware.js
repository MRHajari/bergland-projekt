// backend/middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;


// ============================================================
// 🔹 Middleware: prüft Access Token und hängt Benutzer an req.user
// ============================================================
exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
        console.warn("🚫 Kein Token im Header übermittelt");
        return res.status(401).json({ message: "Kein Zugriff – Token fehlt" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // ✅ falls Token-Struktur { user: {...} }
        req.user = decoded.user || decoded;

        if (!req.user?.id) {
            console.warn("⚠️ Token gültig, aber keine Benutzer-ID im Payload");
            return res.status(403).json({ message: "Token ungültig oder unvollständig" });
        }

        // Optional: Debug nur im Dev-Modus
        if (process.env.NODE_ENV === "development") {
            console.log("✅ Token verifiziert:", req.user.email || req.user.id);
        }

        next();
    } catch (err) {
        console.warn("🚫 Token ungültig oder abgelaufen:", err.message);
        return res.status(403).json({ message: "Token ungültig oder abgelaufen" });
    }
};

// ============================================================
// 🔹 Autorisierung: nur Admins erlaubt
// ============================================================
exports.authorizeAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Nicht authentifiziert" });
    }

    if (req.user.role !== "admin") {
        console.warn("🚫 Zugriff verweigert – kein Admin:", req.user.email || req.user.id);
        return res.status(403).json({ error: "Zugriff verweigert – Admins only" });
    }

    next();
};
