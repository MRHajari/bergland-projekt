require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const { sequelize, Person, User, Token } = require("./models");

const occupancyRoutes = require("./routes/occupancyRoutes");

// ============================================================
// 🚀 SERVER GRUNDAUFBAU
// ============================================================
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// ✅ 1. Middleware
// ============================================================
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.use(bodyParser.json());

// ============================================================
// ✅ 2. Root Test Route
// ============================================================
app.get("/", (req, res) => res.send("Backend is running 🚀"));

// ============================================================
// ✅ 3. Import aller Routen
// ============================================================
// 🧩 Standardmodule
app.use("/api/persons", require("./routes/personRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/accommodations", require("./routes/accommodationRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/routes", require("./routes/routeRoutes"));
app.use("/api/event-routes", require("./routes/eventRouteRoutes"));
app.use("/api/runtimes", require("./routes/runtimeRoutes"));
app.use("/api/squadrons", require("./routes/squadronRoutes"));
app.use("/api/rel-person-squadron", require("./routes/relPersonSquadronRoutes"));
app.use("/api/event-registrations", require("./routes/eventRegistrationRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/occupancies", occupancyRoutes);

// 🧾 Neue Module (voll kompatibel mit neuen Models)
app.use("/api/invoices", require("./routes/invoiceRoutes"));
app.use("/api/products", require("./routes/productRoutes"));

// ============================================================
// ✅ 4. Admin-Setup-Funktion (legt Default-Admin an)
// ============================================================
async function ensureAdminUser() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) return;
    if (await User.findOne({ where: { email: adminEmail } })) return;
    if (adminPassword.length < 12) {
        throw new Error("ADMIN_PASSWORD muss mindestens 12 Zeichen enthalten.");
    }

    const hashed = await bcrypt.hash(adminPassword, 10);
    await sequelize.transaction(async (transaction) => {
        const person = await Person.create({
            first_name: "System",
            last_name: "Administrator",
            email: adminEmail,
            birth_date: "2000-01-01",
        }, { transaction });

        const user = await User.create({
            email: adminEmail,
            password_hash: hashed,
            role: "admin",
            is_verified: true,
            person_id: person.id,
        }, { transaction });

        await person.update({ owner_id: user.id }, { transaction });
    });
}

// ============================================================
// ✅ 5. DB-Sync + Serverstart
// ============================================================
async function startServer() {
    try {
        console.log("🔄 Verbinde mit Datenbank...");

        await sequelize.sync();

        console.log("✅ Database connected.");

        // 🔑 Admin sicherstellen
        console.log("🚀 Starte ensureAdminUser()...");
        await ensureAdminUser();
        console.log("✅ ensureAdminUser() beendet.");

        // 🚀 Server starten
        return app.listen(PORT, "0.0.0.0", () => {
            console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("❌ Database connection failed:", err);
        throw err;
    }
}

app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    const statusCode = err.status === 400 ? 400 : 500;
    if (statusCode === 500) console.error(err);
    res.status(statusCode).json({
        message: statusCode === 400 ? "Ungueltige Anfrage." : "Interner Serverfehler.",
    });
});

// ============================================================
// ✅ 6. Token-Cleanup (1x täglich ablaufen lassen)
// ============================================================
if (require.main === module) {
    startServer().then(() => {
        setInterval(async () => {
            try {
                await Token.destroy({ where: { expires_at: { [Op.lt]: new Date() } } });
            } catch (err) {
                console.error("Token-Cleanup fehlgeschlagen:", err);
            }
        }, 24 * 60 * 60 * 1000).unref();
    }).catch(() => { process.exitCode = 1; });
}

module.exports = { app, startServer, ensureAdminUser };
