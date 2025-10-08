/**
 * 🌱 seed.js — Erstellt die Tabellen neu und fügt Testdaten ein
 * Kompatibel mit aktuellem Bergland-Projekt (EventRegistration-System)
 */

require("dotenv").config();
const bcrypt = require("bcrypt");
const {
    sequelize,
    Person,
    LoginData,
    Accommodation,
    Event,
    Route,
    RelayTeam,
    EventRegistration,
    Runtime,
    Booking,
    Invoice,
    Product,
    Token,
} = require("./models");

(async () => {
    try {
        console.log("🌱 Starte Datenbank-Seeding...");

        // 1️⃣ Verbindung aufbauen
        await sequelize.authenticate();
        console.log("✅ Verbindung hergestellt.");

        // 2️⃣ Tabellen komplett neu erstellen
        await sequelize.sync({ force: true });
        console.log("✅ Tabellen neu erstellt.");

        // =====================================================
        // 👥 BENUTZER (Admins + User)
        // =====================================================
        const usersData = [
            { first_name: "Mohammad", last_name: "Hajari", email: "mrh@test.com", password: "Mrh123!", role: "admin" },
            { first_name: "Clara", last_name: "Mond", email: "clara.admin@example.com", password: "Passwort123", role: "admin" },
            { first_name: "Anna", last_name: "Berg", email: "anna@example.com", password: "Passwort123", role: "user" },
            { first_name: "Markus", last_name: "Klein", email: "markus@example.com", password: "Passwort123", role: "user" },
            { first_name: "Sandra", last_name: "Tal", email: "sandra@example.com", password: "Passwort123", role: "user" },
        ];

        const users = [];
        for (const u of usersData) {
            const person = await Person.create({
                first_name: u.first_name,
                last_name: u.last_name,
                email: u.email,
                birth_date: "1990-01-01",
                verifyd: true,
            });

            const password_hash = await bcrypt.hash(u.password, 10);
            await LoginData.create({
                person_id: person.id,
                password_hash,
                role: u.role,
                verifyd: true,
            });

            users.push(person);
            console.log(`👤 Benutzer erstellt: ${u.first_name} (${u.role})`);
        }

        // =====================================================
        // 🏨 UNTERKÜNFTE
        // =====================================================
        const accommodations = await Accommodation.bulkCreate([
            { name: "Bergblick Hotel", street: "Hauptstraße 1", city: "Innsbruck", country: "Österreich", total_beds: 60 },
            { name: "Alpenruhe Lodge", street: "Talweg 7", city: "Garmisch-Partenkirchen", country: "Deutschland", total_beds: 30 },
        ]);
        console.log(`🏨 ${accommodations.length} Unterkünfte hinzugefügt.`);

        // =====================================================
        // 🎉 EVENTS
        // =====================================================
        const events = await Event.bulkCreate([
            { name: "Berglauf 2025", description: "Ein anspruchsvoller Lauf durch die Alpen.", start_date: new Date("2025-06-15"), end_date: new Date("2025-06-16") },
            { name: "Triathlon Zell am See", description: "Schwimmen, Radfahren, Laufen – der Klassiker am See!", start_date: new Date("2025-07-20"), end_date: new Date("2025-07-21") },
        ], { returning: true });
        console.log(`🎯 ${events.length} Events hinzugefügt.`);

        // =====================================================
        // 🗺️ ROUTEN
        // =====================================================
        const routes = await Route.bulkCreate([
            { event_id: events[0].id, name: "Alpenroute 12 km", distance_km: 12 },
            { event_id: events[1].id, name: "Triathlon Strecke", distance_km: 42 },
        ]);
        console.log(`🗺️ ${routes.length} Routen hinzugefügt.`);

        // =====================================================
        // 🏃‍♂️ RELAY TEAMS
        // =====================================================
        const relayTeams = await RelayTeam.bulkCreate([
            { name: "Team Bergsteiger" },
            { name: "Team Marathonis" },
            { name: "TriPower Zell" },
        ], { returning: true });
        console.log(`🏃‍♂️ ${relayTeams.length} Relay-Teams hinzugefügt.`);

        // =====================================================
        // 📝 EVENT REGISTRATIONS (neues System)
        // =====================================================
        const eventRegistrations = await EventRegistration.bulkCreate([
            {
                person_id: users[2].id,  // Anna
                event_id: events[0].id,
                relay_team_id: relayTeams[0].id,
                participation_type: "einzeln",
                catering_type: "vegetarisch",
                wishes: "Bitte frühe Startzeit",
                gender: "w",
                club: "Laufteam Kaiserslautern",
                liability_accept: true,
                status: "bestätigt",
            },
            {
                person_id: users[3].id,  // Markus
                event_id: events[1].id,
                relay_team_id: relayTeams[1].id,
                participation_type: "staffel",
                catering_type: "vegan",
                wishes: "Nachmittag bevorzugt",
                gender: "m",
                club: "Triathlon Freunde",
                liability_accept: true,
                status: "bestätigt",
            },
        ], { returning: true });
        console.log(`📝 ${eventRegistrations.length} EventRegistrations hinzugefügt.`);

        // =====================================================
        // ⏱️ RUNTIMES
        // =====================================================
        await Runtime.bulkCreate([
            {
                registration_id: eventRegistrations[0].id,
                start_time: "2025-06-15T08:00:00",
                end_time: "2025-06-15T09:45:00",
                duration: 6300,
            },
            {
                registration_id: eventRegistrations[1].id,
                start_time: "2025-07-20T09:00:00",
                end_time: "2025-07-20T11:30:00",
                duration: 9000,
            },
        ]);
        console.log("⏱️ Runtimes hinzugefügt.");

        // =====================================================
        // 🏨 BOOKINGS
        // =====================================================
        await Booking.bulkCreate([
            {
                person_id: users[2].id, // Anna
                accommodation_id: accommodations[0].id,
                event_id: events[0].id,
                check_in: new Date("2025-06-14"),
                check_out: new Date("2025-06-17"),
            },
            {
                person_id: users[3].id, // Markus
                accommodation_id: accommodations[1].id,
                event_id: events[1].id,
                check_in: new Date("2025-07-19"),
                check_out: new Date("2025-07-22"),
            },
        ]);
        console.log("📦 Bookings hinzugefügt.");

        // =====================================================
        // 💰 PRODUCTS & INVOICES
        // =====================================================
        const products = await Product.bulkCreate([
            { name: "Startpaket", price: 49.99, description: "Teilnahmepaket inkl. Startnummer und Trinkflasche." },
            { name: "Event T-Shirt", price: 19.99, description: "Offizielles Sportshirt mit Event-Logo." },
        ]);

        const invoices = await Invoice.bulkCreate([
            { person_id: users[2].id, total_amount: 69.98, status: "bezahlt" },
            { person_id: users[3].id, total_amount: 19.99, status: "offen" },
        ]);
        console.log("💰 Produkte & Rechnungen hinzugefügt.");

        // =====================================================
        // 🔐 TOKENS
        // =====================================================
        await Token.bulkCreate([
            { person_id: users[0].id, token: "abc123", type: "auth", expires_at: new Date("2026-01-01") },
            { person_id: users[2].id, token: "def456", type: "verify", expires_at: new Date("2026-01-01") },
        ]);
        console.log("🔐 Tokens hinzugefügt.");

        // =====================================================
        // ✅ Fertig!
        // =====================================================
        console.log("✅ Datenbank-Seeding erfolgreich abgeschlossen!");
    } catch (err) {
        console.error("❌ Fehler beim Seeding:", err);
    } finally {
        await sequelize.close();
        console.log("🔒 Verbindung geschlossen.");
    }
})();
