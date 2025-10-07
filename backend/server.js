require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { sequelize, Person, LoginData } = require("./models");
const bcrypt = require("bcrypt");
const belegungRoutes = require('./routes/belegungRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CORS ganz oben!
app.use(cors({
    origin: '*', // im Dev erlaubt alle
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

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
app.use('/api/belegung', belegungRoutes);

// ============================================================
// ✅ Funktion: Standard-Admin automatisch anlegen
// ============================================================
async function ensureAdminUser() {
    try {
        const adminEmail = "admin@test.com";
        const adminPassword = "Admin123!";

        const existingPerson = await Person.findOne({ where: { email: adminEmail } });

        if (existingPerson) {
            const login = await LoginData.findOne({ where: { person_id: existingPerson.id } });
            if (login) {
                const newHashed = await bcrypt.hash(adminPassword, 10);
                await login.update({ password_hash: newHashed, role: 'admin' }); // Rolle absichern
                console.log(`🔑 Passwort und Rolle für Admin ${adminEmail} wurden aktualisiert.`);
            } else {
                // falls Person existiert, aber LoginData fehlt
                const newHashed = await bcrypt.hash(adminPassword, 10);
                await LoginData.create({
                    person_id: existingPerson.id,
                    password_hash: newHashed,
                    role: "admin",
                });
                console.log(`🆕 LoginData für bestehenden Admin ${adminEmail} erstellt.`);
            }
            return;
        }

        // Hash Passwort
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Person erstellen
        const person = await Person.create({
            first_name: "System",
            last_name: "Administrator",
            email: adminEmail,
            birth_date: "2000-01-01", // 🆕 Geburtsdatum hinzugefügt
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
// ✅ Server starten (nach DB-Sync) only vor dewelopmen
// ============================================================
sequelize
// ⚙️ Nutze "alter: true"
async function startServer() {
    try {
        await sequelize.sync({ force: true }); // oder .sync()
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




setInterval(async () => {
    await Token.destroy({ where: { expires_at: { [Op.lt]: new Date() } } });
}, 24 * 60 * 60 * 1000); // einmal pro Tag
