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
    try {
        const adminEmail = "admin@test.com";
        const adminPassword = "Admin123!";

        const existingUser = await User.findOne({ where: { email: adminEmail } });
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        if (existingUser) {
            await existingUser.update({
                password_hash: hashedPassword,
                role: "admin",
                is_verified: true,
            });

            // 🔄 Sicherstellen, dass zugehörige Person existiert
            let person = await Person.findOne({ where: { email: adminEmail } });
            if (!person) {
                person = await Person.create({
                    first_name: "System",
                    last_name: "Administrator",
                    email: adminEmail,
                    birth_date: "2000-01-01",
                    owner_id: existingUser.id,
                });
            }

            // 🔗 Beziehung wiederherstellen
            if (!existingUser.person_id) {
                await existingUser.update({ person_id: person.id });
            }

            console.log(`🔑 Admin ${adminEmail} aktualisiert und verknüpft.`);
            return;
        }

        // 🆕 Wenn kein User existiert → komplett neu anlegen
        const hashed = await bcrypt.hash(adminPassword, 10);
        const person = await Person.create({
            first_name: "System",
            last_name: "Administrator",
            email: adminEmail,
            birth_date: "2000-01-01",
        });

        const user = await User.create({
            email: adminEmail,
            password_hash: hashed,
            role: "admin",
            is_verified: true,
            person_id: person.id,
        });

        await person.update({ owner_id: user.id });

        console.log("✅ Default Admin erstellt:");
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
    } catch (err) {
        console.error("❌ Fehler beim Anlegen des Admins:", err);
    }
}

// ============================================================
// ✅ 5. DB-Sync + Serverstart
// ============================================================
async function startServer() {
    try {
        console.log("🔄 Verbinde mit Datenbank...");

        if (process.env.NODE_ENV === "development") {
            console.log("⚠️ DEV-Modus: Tabellen werden neu erstellt...");
            await sequelize.sync({ force: true });

            console.log("🌱 Starte Seeding...");
            const runSeed = require("./seed");
            await runSeed();
        } else {
            await sequelize.sync();
        }

        console.log("✅ Database connected.");

        // 🔑 Admin sicherstellen
        console.log("🚀 Starte ensureAdminUser()...");
        await ensureAdminUser();
        console.log("✅ ensureAdminUser() beendet.");

        // 🚀 Server starten
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("❌ Database connection failed:", err);
    }
}

startServer();

// ============================================================
// ✅ 6. Token-Cleanup (1x täglich ablaufen lassen)
// ============================================================
setInterval(async () => {
    await Token.destroy({
        where: { expires_at: { [Op.lt]: new Date() } },
    });
}, 24 * 60 * 60 * 1000);
