require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { sequelize, Person, LoginData } = require("./models");
const bcrypt = require("bcrypt");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// ✅ Root test
app.get("/", (req, res) => res.send("Backend is running 🚀"));

// ✅ Import routes
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

// ❌ Entfernt, weil keine Online-Zahlung verwendet wird
// app.use("/api/payments", require("./routes/paymentRoutes"));
// app.use("/api/payment-integration", require("./routes/paymentIntegrationRoutes"));

// ============================================================
// ✅ Funktion: Standard-Admin automatisch anlegen
// ============================================================

async function ensureAdminUser() {
    try {
        const adminEmail = "admin@test.com";
        const adminPassword = "Admin123!";

        const existingPerson = await Person.findOne({ where: { email: adminEmail } });

        if (existingPerson) {
            console.log(`ℹ️ Admin user already exists: ${adminEmail}`);
            return;
        }

        // Hash Passwort
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Person erstellen
        const person = await Person.create({
            first_name: "System",
            last_name: "Administrator",
            email: adminEmail,
        });

        // LoginData mit Adminrolle anlegen
        await LoginData.create({
            person_id: person.id,
            password_hash: hashedPassword,
            role: "admin",
        });

        console.log("✅ Default Admin created:");
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
    } catch (err) {
        console.error("❌ Error creating default admin:", err);
    }
}

// ============================================================
// ✅ Server starten (nach DB-Sync)
// ============================================================
sequelize
    // ⚙️ Tipp: für Entwicklung einmalig auf { force: true } stellen, um alte Tabellen zu löschen
    .sync({ force: true })
    .then(async () => {
        console.log("📦 Database connected");

        // Admin prüfen/erstellen
        await ensureAdminUser();

        // Server starten
        app.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ Database connection failed:", err);
    });
