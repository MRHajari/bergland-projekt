const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            if (err.name === "TokenExpiredError") {
                console.warn("⏰ Token expired at:", err.expiredAt);
                return res.status(401).json({ error: "Token expired" });
            }
            console.error("❌ Invalid token:", err.message);
            return res.status(403).json({ error: "Invalid token" });
        }

        req.user = user;
        next();
    });
};

exports.authorizeAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        console.warn("🚫 Forbidden: user is not admin", req.user);
        return res.status(403).json({ error: "Forbidden: Admins only" });
    }
    next();
};
