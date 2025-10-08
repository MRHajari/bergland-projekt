require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const { sequelize, Person, LoginData, Token } = require("./models");

const belegungRoutes = require("./routes/belegungRoutes");
const eventRegistrationRoutes = require("./routes/eventRegistrationRoutes"); // 🟢 NEU

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// ✅ 1. Middleware
// ============================================================
app.use(cors({
    origin: "*", // im Dev erlaubt alles — später Domain eintragen
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(bodyParser.json());

// ============================================================
// ✅ 2. Root Test Route
// ============================================================
app.get("/", (req, res) => res.send("Backend is running 🚀"));

// ============================================================
// ✅ 3. Import aller Routen
// ============================================================
app.use("/api/persons", require("./routes/personRoutes"));
app.use("/api/addresses", require("./routes/addressRoutes"));
app.use("/api/logins", require("./routes/loginDataRoutes"));
app.use("/api/accommodations", require("./routes/accommodationRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/registrations", require("./routes/registrationRoutes"));
app.use("/api/runtimes", require("./routes/runtimeRoutes"));
app.use("/api/relay-teams", require("./routes/relayTeamRoutes"));
app.use("/api/routes", require("./routes/routeRoutes"));
app.use("/api/invoices", require("./routes/invoiceRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/belegung", belegungRoutes);

// 🟢 NEU: EventRegistration-Routen einbinden
app.use("/api/event-registrations", eventRegistrationRoutes);

// ============================================================
// ✅ 4. Admin-Setup-Funktion
// ============================================================
async function ensureAdminUser() {
    try {
        const adminEmail = "admin@test.com";
        const adminPassword = "Admin123!";

        const existingPerson = await Person.findOne({ where: { email: adminEmail } });

        if (existingPerson) {
            const login = await LoginData.findOne({ where: { person_id: existingPerson.id } });
            const hashed = await bcrypt.hash(adminPassword, 10);

            if (login) {
                await login.update({ password_hash: hashed, role: "admin" });
                console.log(`🔑 Admin ${adminEmail} aktualisiert.`);
            } else {
                await LoginData.create({
                    person_id: existingPerson.id,
                    password_hash: hashed,
                    role: "admin",
                    is_verified: true,
                });
                console.log(`🆕 LoginData für Admin ${adminEmail} erstellt.`);
            }
            return;
        }

        // Falls Admin noch nicht existiert → neu anlegen
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const person = await Person.create({
            first_name: "System",
            last_name: "Administrator",
            email: adminEmail,
            birth_date: "2000-01-01",
            is_verified: true,
        });

        await LoginData.create({
            person_id: person.id,
            password_hash: hashedPassword,
            role: "admin",
            is_verified: true,
        });

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
        await sequelize.sync({ alter: true }); // ⚙️ ändere von { force: true } → { alter: true }
        console.log("📦 Database connected");

        await ensureAdminUser();

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("❌ Database connection failed:", err);
    }
}

startServer();

// ============================================================
// ✅ 6. Token-Cleanup (1x täglich)
// ============================================================
setInterval(async () => {
    await Token.destroy({ where: { expires_at: { [Op.lt]: new Date() } } });
}, 24 * 60 * 60 * 1000);
