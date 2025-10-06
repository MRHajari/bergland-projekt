const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

// 🔹 Authentifizierung: prüft Token und fügt Benutzer zu req.user hinzu
exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        console.warn("🚫 Kein Token im Header");
        return res.status(401).json({ message: "Kein Token übermittelt" });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.warn("🚫 Ungültiges oder abgelaufenes Token:", err.message);
            return res.status(403).json({ message: "Ungültiges oder abgelaufenes Token" });
        }

        // 🔥 Wichtig: Falls Payload verschachtelt ist (z. B. { user: {...} })
        req.user = decoded.user || decoded;

        console.log("✅ Token erfolgreich verifiziert. Benutzer:", req.user);
        next();
    });
};

// 🔹 Autorisierung: erlaubt nur Admins
exports.authorizeAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        console.warn("🚫 Zugriff verweigert – kein Admin:", req.user);
        return res.status(403).json({ error: "Forbidden: Admins only" });
    }

    next();
};
