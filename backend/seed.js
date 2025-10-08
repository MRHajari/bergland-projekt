// backend/seed.js
require("dotenv").config();
const bcrypt = require("bcrypt");
const {
    sequelize,
    Person,
    LoginData,
    Accommodation,
    Event,
    Booking,
    RelayTeam,
    Route,
    Registration,
    Runtime,
    Invoice,
    Product,
    Token
} = require("./models");

module.exports = async function runSeed() {
    console.log("🌱 Starte Datenbank-Seeding...");

    try {
        await sequelize.sync({ force: true });
        console.log("✅ Tabellen neu erstellt.");

        // =====================================================
        // 👤 Personen + Logins
        // =====================================================
        const users = await Promise.all([
            Person.create({
                first_name: "Mohammad",
                last_name: "Hajari",
                email: "mohammad@test.com",
                birth_date: "1990-06-12",
            }),
            Person.create({
                first_name: "Clara",
                last_name: "Fischer",
                email: "clara@test.com",
                birth_date: "1985-09-22",
            }),
            Person.create({
                first_name: "Anna",
                last_name: "Schmidt",
                email: "anna@test.com",
                birth_date: "1994-03-10",
            }),
            Person.create({
                first_name: "Markus",
                last_name: "Weber",
                email: "markus@test.com",
                birth_date: "1988-07-19",
            }),
            Person.create({
                first_name: "Sandra",
                last_name: "Becker",
                email: "sandra@test.com",
                birth_date: "1992-01-15",
            }),
        ]);
        console.log("👤 Benutzer erstellt: Mohammad, Clara, Anna, Markus, Sandra");

        const hashedAdmin = await bcrypt.hash("Admin123!", 10);
        const hashedUser = await bcrypt.hash("User123!", 10);

        await Promise.all([
            LoginData.create({ person_id: users[0].id, password_hash: hashedAdmin, role: "admin", is_verified: true }),
            LoginData.create({ person_id: users[1].id, password_hash: hashedAdmin, role: "admin", is_verified: true }),
            LoginData.create({ person_id: users[2].id, password_hash: hashedUser, role: "user", is_verified: true }),
            LoginData.create({ person_id: users[3].id, password_hash: hashedUser, role: "user", is_verified: true }),
            LoginData.create({ person_id: users[4].id, password_hash: hashedUser, role: "user", is_verified: true }),
        ]);
        console.log("🔐 Login-Daten erstellt.");

        // =====================================================
        // 🏨 Unterkünfte
        // =====================================================
        const accommodations = await Accommodation.bulkCreate([
            {
                name: "Bergblick Hotel",
                street: "Hauptstraße 1",
                postal_code: "6020",
                city: "Innsbruck",
                country: "Österreich",
                single_rooms: 10,
                double_rooms: 15,
                multi_bed_rooms: 5,
                total_beds: 60,
            },
            {
                name: "Alpenruhe Lodge",
                street: "Talweg 7",
                postal_code: "82467",
                city: "Garmisch-Partenkirchen",
                country: "Deutschland",
                single_rooms: 5,
                double_rooms: 10,
                multi_bed_rooms: 3,
                total_beds: 30,
            },
            {
                name: "Hotel Edelweiß",
                street: "Bergstraße 5",
                postal_code: "87561",
                city: "Oberstdorf",
                country: "Deutschland",
                single_rooms: 12,
                double_rooms: 20,
                multi_bed_rooms: 4,
                total_beds: 80,
            },
        ]);
        console.log("🏨 3 Unterkünfte hinzugefügt.");

        // =====================================================
        // 🎯 Events
        // =====================================================
        const events = await Event.bulkCreate([
            {
                name: "Berglauf 2025",
                description: "Halbmarathon durch die Tiroler Alpen",
                start_date: "2025-06-21",
                end_date: "2025-06-22",
            },
            {
                name: "Pfälzer Trail Run",
                description: "10km Trail-Lauf durch das Pfälzer Bergland",
                start_date: "2025-09-14",
                end_date: "2025-09-14",
            },
            {
                name: "Winterlauf Garmisch",
                description: "5km Winterlauf durch verschneite Wälder",
                start_date: "2025-12-10",
                end_date: "2025-12-10",
            },
        ]);
        console.log("🎯 3 Events hinzugefügt.");

        // =====================================================
        // 🗺️ Routen
        // =====================================================
        const routes = await Route.bulkCreate([
            {
                name: "Tirol Panorama Strecke",
                distance_km: 21.1,
                difficulty: "schwer",
                event_id: events[0].id,
            },
            {
                name: "Pfälzer Hügelrunde",
                distance_km: 10,
                difficulty: "mittel",
                event_id: events[1].id,
            },
            {
                name: "Garmisch Schneepfad",
                distance_km: 5,
                difficulty: "leicht",
                event_id: events[2].id,
            },
        ]);
        console.log("🗺️ 3 Routen hinzugefügt.");

        // =====================================================
        // 🏃‍♂️ Teams
        // =====================================================
        const teams = await RelayTeam.bulkCreate([
            { name: "Mountain Kings", event_id: events[0].id },
            { name: "Trail Blazers", event_id: events[1].id },
            { name: "Snow Sprinters", event_id: events[2].id },
        ]);
        console.log("🏃‍♂️ 3 Relay Teams hinzugefügt.");

        // =====================================================
        // 📝 Registrierungen
        // =====================================================
        const registrations = await Registration.bulkCreate(
            [
                {
                    person_id: users[2].id,
                    event_id: events[0].id,
                    participation_type: "single",
                    wishes: "vegetarisch",
                },
                {
                    person_id: users[3].id,
                    event_id: events[1].id,
                    participation_type: "relay",
                    relay_team_id: teams[1].id,
                },
            ],
            { returning: true } // 🔥 zwingend notwendig bei SQLite
        );
        console.log("📝 2 Registrierungen hinzugefügt.");

        // =====================================================
        // ⏱️ Laufzeiten (Runtime)
        // =====================================================
        await Runtime.bulkCreate([
            { registration_id: registrations[0].id },
            { registration_id: registrations[1].id },
        ]);
        console.log("⏱️ 2 Laufzeiten hinzugefügt.");


        // =====================================================
        // 📦 Buchungen
        // =====================================================
        await Booking.bulkCreate([
            {
                person_id: users[2].id,
                accommodation_id: accommodations[0].id,
                event_id: events[0].id,
                single_beds: 1,
            },
            {
                person_id: users[3].id,
                accommodation_id: accommodations[1].id,
                event_id: events[1].id,
                double_beds: 1,
            },
        ]);
        console.log("📦 2 Buchungen hinzugefügt.");

        console.log("✅ Seeding erfolgreich!");
    } catch (err) {
        console.error("❌ Fehler beim Seeding:", err);
    }
};
