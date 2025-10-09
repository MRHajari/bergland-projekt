// backend/seed.js
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
    RelayTeam,
    Route,
    EventRegistration,
    Runtime,
    Invoice,
    Product,
    Token,
} = require("./models");

module.exports = async function runSeed() {
    console.log("🌱 Starte Datenbank-Seeding...");

    try {
        // ------------------------------------------------------
        // 🔄 DB reset
        // ------------------------------------------------------
        await sequelize.sync({ force: true });
        console.log("✅ Tabellen neu erstellt.");

        // =====================================================
        // 👤 Personen
        // =====================================================
        const persons = await Promise.all([
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
        console.log("👤 Personen erstellt: Mohammad, Clara, Anna, Markus, Sandra");

        // =====================================================
        // 🔐 Benutzer (User)
        // =====================================================
        const hashedAdmin = await bcrypt.hash("Admin123!", 10);
        const hashedUser = await bcrypt.hash("User123!", 10);

        await Promise.all([
            User.create({
                email: "mohammad@test.com",
                password_hash: hashedAdmin,
                role: "admin",
                is_verified: true,
                person_id: persons[0].id,
            }),
            User.create({
                email: "clara@test.com",
                password_hash: hashedAdmin,
                role: "admin",
                is_verified: true,
                person_id: persons[1].id,
            }),
            User.create({
                email: "anna@test.com",
                password_hash: hashedUser,
                role: "user",
                is_verified: true,
                person_id: persons[2].id,
            }),
            User.create({
                email: "markus@test.com",
                password_hash: hashedUser,
                role: "user",
                is_verified: true,
                person_id: persons[3].id,
            }),
            User.create({
                email: "sandra@test.com",
                password_hash: hashedUser,
                role: "user",
                is_verified: true,
                person_id: persons[4].id,
            }),
        ]);
        console.log("🔐 User erstellt (Admins & Users).");

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
            {
                street: "Marktplatz 5",
                postal_code: "50667",
                city: "Köln",
                country: "Deutschland",
            },
            {
                street: "Hauptstraße 44",
                postal_code: "20095",
                city: "Hamburg",
                country: "Deutschland",
            },
            {
                street: "Schlossweg 7",
                postal_code: "69117",
                city: "Heidelberg",
                country: "Deutschland",
            },
        ]);
        console.log("🏠 Adressen erstellt.");

        // =====================================================
        // 🔗 RelPersonAddress (Zuordnung)
        // =====================================================
        await RelPersonAddress.bulkCreate([
            { person_id: persons[0].id, address_id: addresses[0].id },
            { person_id: persons[1].id, address_id: addresses[1].id },
            { person_id: persons[2].id, address_id: addresses[2].id },
            { person_id: persons[3].id, address_id: addresses[3].id },
            { person_id: persons[4].id, address_id: addresses[4].id },
        ]);
        console.log("🔗 Personen mit Adressen verknüpft.");

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
        // 🎯 Events (inkl. Anmeldeschluss)
        // =====================================================
        const events = await Event.bulkCreate([
            {
                name: "Berglauf 2025",
                description: "Halbmarathon durch die Tiroler Alpen",
                start_date: "2025-06-21",
                end_date: "2025-06-22",
                registration_deadline: "2025-06-10", // ⏰ 10 Tage vor Start
            },
            {
                name: "Pfälzer Trail Run",
                description: "10 km Trail-Lauf durch das Pfälzer Bergland",
                start_date: "2025-09-14",
                end_date: "2025-09-14",
                registration_deadline: "2025-09-07", // ⏰ 1 Woche vorher
            },
            {
                name: "Winterlauf Garmisch",
                description: "5 km Winterlauf durch verschneite Wälder",
                start_date: "2025-12-10",
                end_date: "2025-12-10",
                registration_deadline: "2025-11-30", // ⏰ 10 Tage vorher
            },
        ]);
        console.log("🎯 3 Events mit Anmeldeschluss hinzugefügt.");


        // =====================================================
        // 🗺️ Routen
        // =====================================================
        await Route.bulkCreate([
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
        console.log("🗺️ Routen hinzugefügt.");

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
        // 📝 Event-Registrierungen
        // =====================================================
        const regs = await EventRegistration.bulkCreate(
            [
                {
                    person_id: persons[2].id,
                    event_id: events[0].id,
                    participation_type: "single",
                    wishes: "vegetarisch",
                },
                {
                    person_id: persons[3].id,
                    event_id: events[1].id,
                    participation_type: "relay",
                    relay_team_id: teams[1].id,
                },
            ],
            { returning: true }
        );
        console.log("📝 Event-Registrierungen hinzugefügt.");

        // =====================================================
        // 🛍️ Produkte
        // =====================================================
        const products = await Product.bulkCreate([
            {
                name: "Startgebühr Halbmarathon",
                description: "Teilnahmegebühr für den Berglauf 2025",
                price: 49.5,
            },
            {
                name: "Pfälzer Trail Shirt",
                description: "Offizielles Laufshirt aus atmungsaktivem Material",
                price: 25.0,
            },
            {
                name: "Finisher Medaille",
                description: "Limitierte Teilnehmer-Medaille",
                price: 10.0,
            },
        ]);
        console.log("🛍️ 3 Produkte hinzugefügt.");

        // =====================================================
        // 💰 Beispielrechnung (Invoice) mit Produkten
        // =====================================================
        const invoice = await Invoice.create({
            person_id: persons[2].id,
            total_amount: 84.5,
            issued_at: new Date(),
            paid: false,
        });
        await invoice.addProducts([products[0], products[1]]);
        console.log("💰 Beispielrechnung hinzugefügt und mit Produkten verknüpft.");

        // =====================================================
        // ⏱️ Laufzeiten
        // =====================================================
        await Runtime.bulkCreate([
            { registration_id: regs[0].id },
            { registration_id: regs[1].id },
        ]);
        console.log("⏱️ 2 Laufzeiten hinzugefügt.");

        // =====================================================
        // 📦 Buchungen
        // =====================================================
        await Booking.bulkCreate([
            {
                person_id: persons[2].id,
                accommodation_id: accommodations[0].id,
                event_id: events[0].id,
                single_beds: 1,
            },
            {
                person_id: persons[3].id,
                accommodation_id: accommodations[1].id,
                event_id: events[1].id,
                double_beds: 1,
            },
        ]);
        console.log("📦 2 Buchungen hinzugefügt.");

        console.log("✅ Seeding erfolgreich abgeschlossen!");
    } catch (err) {
        console.error("❌ Fehler beim Seeding:", err);
    }
};
