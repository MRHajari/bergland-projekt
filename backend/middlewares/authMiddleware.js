const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

// ============================================================
// 🔹 Middleware: prüft Access Token
// ============================================================
exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token =
        authHeader?.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : null;

    if (!token) {
        return res.status(401).json({
            code: "AUTH_TOKEN_MISSING",
            message: "Kein Zugriff – Token fehlt",
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded.user || decoded;

        if (!req.user?.id) {
            return res.status(401).json({
                code: "AUTH_TOKEN_INVALID",
                message: "Token ungültig oder unvollständig",
            });
        }

        next();
    } catch (err) {
        const isExpired = err?.name === "TokenExpiredError";

        return res.status(401).json({
            code: isExpired ? "AUTH_TOKEN_EXPIRED" : "AUTH_TOKEN_INVALID",
            message: isExpired
                ? "Token abgelaufen"
                : "Token ungültig oder abgelaufen",
        });
    }
};

// ============================================================
// 🔹 Rollenbasierte Autorisierung (flexibel)
// ============================================================
exports.requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Nicht authentifiziert" });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Keine Berechtigung für diese Aktion",
            });
        }

        next();
    };
};
