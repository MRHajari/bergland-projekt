/**
 * 🌱 seed.js
 * Erstellt alle Tabellen neu und fügt Testdaten ein (inkl. Admin Mohammad Hajari).
 */

require("dotenv").config();
const bcrypt = require("bcrypt");
const {
    sequelize,
    Person,
    LoginData,
    Accommodation,
    Event,
    Product,
    Invoice,
    Route,
    RelayTeam,
    Registration,
    Runtime,
    Booking,
    Belegung,
    Token
} = require("./models");

(async () => {
    try {
        console.log("🌱 Starting database seed...");

        // 1️⃣ Verbindung aufbauen
        await sequelize.authenticate();
        console.log("✅ Database connected!");

        // 2️⃣ Tabellen komplett neu erstellen
        await sequelize.sync({ force: true }); // ⚠️ ersetzt alter:true → sicher bei Foreign Keys
        console.log("✅ All tables created (fresh)!");

        // =====================================================
        // 👤 ADMIN USERS (inkl. Mohammad Hajari)
        // =====================================================
        const adminAccounts = [
            {
                first_name: "Mohammad",
                last_name: "Hajari",
                email: "mrh@test.com",
                password: "Mrh123!",
                role: "admin",
                birth_date: "1990-01-15",
            },
            {
                first_name: "Clara",
                last_name: "Mond",
                email: "clara.admin@example.com",
                password: "Passwort123",
                role: "admin",
                birth_date: "1988-06-22",
            },
            {
                first_name: "Lisa",
                last_name: "See",
                email: "lisa.admin@example.com",
                password: "Passwort123",
                role: "admin",
                birth_date: "1992-04-12",
            },
            {
                first_name: "Tom",
                last_name: "Bergmann",
                email: "tom.admin@example.com",
                password: "Passwort123",
                role: "admin",
                birth_date: "1985-09-01",
            },
        ];

        for (const admin of adminAccounts) {
            const person = await Person.create({
                first_name: admin.first_name,
                last_name: admin.last_name,
                email: admin.email,
                birth_date: admin.birth_date,
            });

            const password_hash = await bcrypt.hash(admin.password, 10);
            await LoginData.create({
                person_id: person.id,
                password_hash,
                role: admin.role,
            });
            console.log(`🛡️ Admin erstellt: ${admin.first_name} ${admin.last_name}`);
        }

        // =====================================================
        // 👥 NORMAL USERS
        // =====================================================
        const users = [
            { first_name: "Anna", last_name: "Berg", email: "anna@example.com", password: "Passwort123", role: "user", birth_date: "1990-01-15" },
            { first_name: "Markus", last_name: "Klein", email: "markus@example.com", password: "Passwort123", role: "user", birth_date: "1989-12-05" },
            { first_name: "Felix", last_name: "Hoch", email: "felix@example.com", password: "Passwort123", role: "user", birth_date: "1993-02-18" },
            { first_name: "Sandra", last_name: "Tal", email: "sandra@example.com", password: "Passwort123", role: "user", birth_date: "1997-05-14" },
            { first_name: "Nina", last_name: "Kraft", email: "nina@example.com", password: "Passwort123", role: "user", birth_date: "1986-11-22" },
            { first_name: "Jonas", last_name: "Müller", email: "jonas@example.com", password: "Passwort123", role: "user", birth_date: "1994-03-09" },
        ];

        for (const user of users) {
            const person = await Person.create({
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                birth_date: user.birth_date,
            });

            const password_hash = await bcrypt.hash(user.password, 10);
            await LoginData.create({
                person_id: person.id,
                password_hash,
                role: user.role,
            });
            console.log(`👥 User erstellt: ${user.first_name} ${user.last_name}`);
        }

        // =====================================================
        // 🏨 ACCOMMODATIONS
        // =====================================================
        const accommodations = [
            { name: "Bergblick Hotel", city: "Innsbruck", country: "Österreich", total_beds: 60 },
            { name: "Alpenruhe Lodge", city: "Garmisch-Partenkirchen", country: "Deutschland", total_beds: 29 },
            { name: "Seehotel Panorama", city: "Zell am See", country: "Österreich", total_beds: 85 },
            { name: "Haus Sonnenschein", city: "Lienz", country: "Österreich", total_beds: 45 },
            { name: "Mountain Inn", city: "Mittenwald", country: "Deutschland", total_beds: 32 },
        ];
        await Accommodation.bulkCreate(accommodations);
        console.log(`🏨 ${accommodations.length} Unterkünfte hinzugefügt.`);

        // =====================================================
        // 🎉 EVENTS
        // =====================================================
        const events = [
            { name: "Berglauf 2025", description: "Ein anspruchsvoller Berglauf durch die Alpen mit 1500 Höhenmetern.", start_date: new Date("2025-06-15"), end_date: new Date("2025-06-16") },
            { name: "Triathlon Zell am See", description: "Schwimmen, Radfahren, Laufen – der Klassiker am See!", start_date: new Date("2025-07-20"), end_date: new Date("2025-07-21") },
            { name: "Marathon Garmisch", description: "Der traditionsreiche Alpenmarathon.", start_date: new Date("2025-09-10"), end_date: new Date("2025-09-10") },
            { name: "Alpen Trail Run", description: "Trailrun über 35 km durch das Karwendelgebirge.", start_date: new Date("2025-08-18"), end_date: new Date("2025-08-18") },
        ];
        await Event.bulkCreate(events);
        console.log(`🎯 ${events.length} Events hinzugefügt.`);

        // =====================================================
        // 🛍️ PRODUCTS
        // =====================================================
        const products = [
            { name: "Startpaket", price: 49.99, description: "Teilnahmepaket inkl. Startnummer und Trinkflasche." },
            { name: "Event T-Shirt", price: 19.99, description: "Offizielles Sportshirt mit Event-Logo." },
            { name: "Finisher-Medaille", price: 9.99, description: "Erinnerungsmedaille für erfolgreiche Teilnehmer." },
            { name: "VIP Ticket", price: 99.99, description: "Zugang zur VIP-Lounge mit Catering." },
            { name: "After-Run Massage", price: 29.99, description: "30 Minuten Massage nach dem Lauf." },
            { name: "Team-Paket", price: 149.99, description: "Startpaket für 3 Personen inklusive T-Shirts." },
        ];
        await Product.bulkCreate(products);
        console.log(`🛍️ ${products.length} Produkte hinzugefügt.`);

        console.log("✅ Datenbank-Seed erfolgreich abgeschlossen!");
    } catch (err) {
        console.error("❌ Fehler beim Seeding:", err);
    } finally {
        await sequelize.close();
        console.log("🔒 Verbindung geschlossen.");
    }
})();
