require("dotenv").config();
const bcrypt = require("bcrypt");
const {
    sequelize,
    Person,
    User,
    Address,
    RelPersonAddress,
    Accommodation,
    Event,
    Booking,
    Route,
    EventRegistration,
    Runtime,
    Squadron,
    RelPersonSquadron,
    Occupancy,
    Invoice,
    Product,
    Token,
} = require("./models");

module.exports = async function runSeed() {
    console.log("🌱 Starte Datenbank-Seeding...");

    try {
        await sequelize.sync({ force: true });
        console.log("✅ Tabellen neu erstellt.");

        // =====================================================
        // 🔐 Benutzer zuerst erstellen
        // =====================================================
        const hashedAdmin = await bcrypt.hash("Admin123!", 10);
        const hashedUser = await bcrypt.hash("User123!", 10);

        const users = await Promise.all([
            User.create({
                email: "mohammad@test.com",
                password_hash: hashedAdmin,
                role: "admin",
                is_verified: true,
            }),
            User.create({
                email: "clara@test.com",
                password_hash: hashedAdmin,
                role: "admin",
                is_verified: true,
            }),
            User.create({
                email: "anna@test.com",
                password_hash: hashedUser,
                role: "user",
                is_verified: true,
            }),
            User.create({
                email: "markus@test.com",
                password_hash: hashedUser,
                role: "user",
                is_verified: true,
            }),
        ]);
        console.log("🔐 Benutzer erstellt.");

        // =====================================================
        // 👤 Personen jetzt mit owner_id → user.id
        // =====================================================
        const persons = await Promise.all([
            Person.create({
                first_name: "Mohammad",
                last_name: "Hajari",
                email: "mohammad@test.com",
                birth_date: "1990-06-12",
                owner_id: users[0].id,
            }),
            Person.create({
                first_name: "Clara",
                last_name: "Fischer",
                email: "clara@test.com",
                birth_date: "1985-09-22",
                owner_id: users[0].id, // 👈 gehört Mohammad
            }),
            Person.create({
                first_name: "Anna",
                last_name: "Schmidt",
                email: "anna@test.com",
                birth_date: "1994-03-10",
                owner_id: users[0].id,
            }),
            Person.create({
                first_name: "Markus",
                last_name: "Weber",
                email: "markus@test.com",
                birth_date: "1988-07-19",
                owner_id: users[0].id,
            }),
        ]);
        console.log("👤 Personen erstellt und Owner gesetzt.");

        // Jetzt Benutzer ↔ Personen verknüpfen (1:1 Beziehung)
        await Promise.all([
            users[0].update({ person_id: persons[0].id }),
            users[1].update({ person_id: persons[1].id }),
            users[2].update({ person_id: persons[2].id }),
            users[3].update({ person_id: persons[3].id }),
        ]);
        console.log("🔗 User-Person-Beziehungen gesetzt.");

        // =====================================================
        // 🏠 Adressen
        // =====================================================
        const addresses = await Address.bulkCreate([
            {
                street: "Spinozastraße 18",
                postal_code: "67663",
                city: "Kaiserslautern",
                country: "Deutschland",
            },
            {
                street: "Bahnhofstraße 12",
                postal_code: "80335",
                city: "München",
                country: "Deutschland",
            },
        ]);

        await RelPersonAddress.bulkCreate([
            { person_id: persons[0].id, address_id: addresses[0].id },
            { person_id: persons[1].id, address_id: addresses[1].id },
        ]);
        console.log("🏠 Adressen verknüpft.");

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
                single_rooms: 8,
                double_rooms: 12,
                multi_bed_rooms: 4,
                total_beds: 44,
            },
        ]);
        console.log("🏨 Unterkünfte hinzugefügt.");

        // =====================================================
        // 🎯 Events
        // =====================================================
        const events = await Event.bulkCreate([
            {
                name: "Berglauf 2025",
                description: "Halbmarathon durch die Tiroler Alpen",
                start_date: "2025-06-21",
                end_date: "2025-06-22",
                registration_deadline: "2025-06-10",
            },
            {
                name: "Pfälzer Trail Run",
                description: "10 km Trail-Lauf durch das Pfälzer Bergland",
                start_date: "2025-09-14",
                end_date: "2025-09-14",
                registration_deadline: "2025-09-07",
            },
        ]);
        console.log("🎯 Events erstellt.");

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
        ]);
        console.log("🗺️ Routen erstellt.");

        // =====================================================
        // 🧭 Staffeln (Squadron)
        // =====================================================
        const squadrons = await Squadron.bulkCreate([
            {
                name: "TrailRunners Pfalz",
                start_number: "STF-2025-01",
                members_count: 4,
                description: "4er-Staffel Halbmarathon",
                event_id: events[0].id,
            },
            {
                name: "AlpenTeam Tirol",
                start_number: "STF-2025-02",
                members_count: 3,
                description: "3er-Team auf 10 km Route",
                event_id: events[1].id,
            },
        ]);
        console.log("🧭 Staffeln erstellt.");

        // =====================================================
        // 👥 Personen ↔ Staffeln
        // =====================================================
        await RelPersonSquadron.bulkCreate([
            { person_id: persons[0].id, squadron_id: squadrons[0].id, note: "Teamleiter" },
            { person_id: persons[1].id, squadron_id: squadrons[0].id, note: "Mitläufer" },
            { person_id: persons[2].id, squadron_id: squadrons[1].id, note: "Läuferin" },
            { person_id: persons[3].id, squadron_id: squadrons[1].id, note: "Backup" },
        ]);
        console.log("👥 Personen mit Staffeln verknüpft.");

        // =====================================================
        // 📝 Event-Registrierungen
        // =====================================================
        const regs = await EventRegistration.bulkCreate(
            [
                {
                    person_id: persons[2].id,
                    event_id: events[0].id,
                    squadron_id: squadrons[0].id,
                    participation_type: "einzeln",
                    wishes: "vegetarisch",
                    liability_accept: true,
                    status: "in_auswahl",
                },
                {
                    person_id: persons[3].id,
                    event_id: events[1].id,
                    squadron_id: squadrons[1].id,
                    participation_type: "staffel",
                    wishes: "ohne Fleisch",
                    liability_accept: true,
                    status: "bestätigt",
                },
            ],
            { returning: true }
        );
        console.log("📝 Event-Registrierungen erstellt.");

        // Rest deines Seeds (Runtime, Product, Invoice, Booking) kannst du unverändert lassen
        // --------------------------------------------------------

        console.log("✅ Seeding erfolgreich abgeschlossen!");
    } catch (err) {
        console.error("❌ Fehler beim Seeding:", err);
    }
};
