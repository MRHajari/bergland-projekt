require("dotenv").config();
const bcrypt = require("bcrypt");
const {
    sequelize,
    Person,
    User,
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
        // 🔐 BENUTZER
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
            User.create({
                email: "sojin@test.com",
                password_hash: hashedUser,
                role: "user",
                is_verified: true,
            }),
            User.create({
                email: "hanassa@test.com",
                password_hash: hashedUser,
                role: "user",
                is_verified: true,
            }),
        ]);
        console.log("🔐 Benutzer erstellt.");

        // =====================================================
        // 👤 PERSONEN (mit Adresse)
        // =====================================================
        const persons = await Promise.all([
            Person.create({
                first_name: "Mohammad",
                last_name: "Hajari",
                email: "mohammad@test.com",
                birth_date: "1990-06-12",
                phone: "+49 157 1234567",
                street: "Spinozastraße 18",
                postal_code: "67663",
                city: "Kaiserslautern",
                country: "Deutschland",
                owner_id: users[0].id,
            }),
            Person.create({
                first_name: "Clara",
                last_name: "Fischer",
                email: "clara@test.com",
                birth_date: "1985-09-22",
                phone: "+49 151 9876543",
                street: "Bahnhofstraße 12",
                postal_code: "80335",
                city: "München",
                country: "Deutschland",
                owner_id: users[0].id,
            }),
            Person.create({
                first_name: "Anna",
                last_name: "Schmidt",
                email: "anna@test.com",
                birth_date: "1994-03-10",
                phone: "+49 170 5566778",
                street: "Rosenweg 3",
                postal_code: "50667",
                city: "Köln",
                country: "Deutschland",
                owner_id: users[1].id,
            }),
            Person.create({
                first_name: "Markus",
                last_name: "Weber",
                email: "markus@test.com",
                birth_date: "1988-07-19",
                phone: "+49 162 9988776",
                street: "Hauptstraße 45",
                postal_code: "70173",
                city: "Stuttgart",
                country: "Deutschland",
                owner_id: users[1].id,
            }),
            Person.create({
                first_name: "Sojin",
                last_name: "Hajari",
                email: "sojin@test.com",
                birth_date: "2013-05-14",
                phone: null,
                street: "Spinozastraße 18",
                postal_code: "67663",
                city: "Kaiserslautern",
                country: "Deutschland",
                owner_id: users[0].id,
            }),
            Person.create({
                first_name: "Hanassa",
                last_name: "Hajari",
                email: "hanassa@test.com",
                birth_date: "2016-02-21",
                phone: null,
                street: "Spinozastraße 18",
                postal_code: "67663",
                city: "Kaiserslautern",
                country: "Deutschland",
                owner_id: users[0].id,
            }),
            Person.create({
                first_name: "Lukas",
                last_name: "Bauer",
                email: "lukas@test.com",
                birth_date: "1991-09-05",
                phone: "+49 171 2345678",
                street: "Talweg 9",
                postal_code: "82467",
                city: "Garmisch-Partenkirchen",
                country: "Deutschland",
                owner_id: users[2].id,
            }),
            Person.create({
                first_name: "Julia",
                last_name: "Keller",
                email: "julia@test.com",
                birth_date: "1997-11-12",
                phone: "+49 176 9988775",
                street: "Am Hang 4",
                postal_code: "6020",
                city: "Innsbruck",
                country: "Österreich",
                owner_id: users[2].id,
            }),
        ]);
        console.log("👤 Personen mit Adressen erstellt.");

        // Benutzer ↔ Personen (1:1)
        await Promise.all([
            users[0].update({ person_id: persons[0].id }),
            users[1].update({ person_id: persons[1].id }),
            users[2].update({ person_id: persons[2].id }),
            users[3].update({ person_id: persons[3].id }),
            users[4].update({ person_id: persons[4].id }),
            users[5].update({ person_id: persons[5].id }),
        ]);
        console.log("🔗 User-Person-Beziehungen gesetzt.");

        // =====================================================
        // 🏨 UNTERKÜNFTE
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
            {
                name: "Pfälzer Hof",
                street: "Marktplatz 3",
                postal_code: "67655",
                city: "Kaiserslautern",
                country: "Deutschland",
                single_rooms: 6,
                double_rooms: 10,
                multi_bed_rooms: 2,
                total_beds: 28,
            },
        ]);
        console.log("🏨 Unterkünfte hinzugefügt.");

        // =====================================================
        // 🎯 EVENTS
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
            {
                name: "Herbstlauf München",
                description: "5 km Fun-Run für Familien und Einsteiger",
                start_date: "2025-10-05",
                end_date: "2025-10-05",
                registration_deadline: "2025-09-30",
            },
            {
                name: "Winterlauf Kaiserslautern",
                description: "Lauf durch den winterlichen Stadtpark",
                start_date: "2025-12-07",
                end_date: "2025-12-07",
                registration_deadline: "2025-11-25",
            },
        ]);
        console.log("🎯 Events erstellt.");

        // =====================================================
        // 🗺️ ROUTEN
        // =====================================================
        const routes = await Route.bulkCreate([
            { name: "Tirol Panorama Strecke", distance_km: 21.1, difficulty: "schwer", event_id: events[0].id },
            { name: "Pfälzer Hügelrunde", distance_km: 10, difficulty: "mittel", event_id: events[1].id },
            { name: "Isar Parkrunde", distance_km: 5, difficulty: "leicht", event_id: events[2].id },
            { name: "Winterpark Loop", distance_km: 8, difficulty: "mittel", event_id: events[3].id },
        ]);
        console.log("🗺️ Routen erstellt.");

        // =====================================================
        // 🧭 STAFFELN (Squadrons)
        // =====================================================
        const squadrons = await Squadron.bulkCreate([
            { name: "TrailRunners Pfalz", start_number: "STF-2025-01", members_count: 4, description: "4er-Staffel Halbmarathon", event_id: events[0].id },
            { name: "AlpenTeam Tirol", start_number: "STF-2025-02", members_count: 3, description: "3er-Team auf 10 km Route", event_id: events[1].id },
            { name: "Kaiserslautern Power", start_number: "STF-2025-03", members_count: 5, description: "5er-Team Winterlauf", event_id: events[3].id },
        ]);
        console.log("🧭 Staffeln erstellt.");

        // =====================================================
        // 👥 PERSON ↔ STAFFEL (n:m)
        // =====================================================
        await RelPersonSquadron.bulkCreate([
            { person_id: persons[0].id, squadron_id: squadrons[0].id, note: "Teamleiter" },
            { person_id: persons[1].id, squadron_id: squadrons[0].id, note: "Mitläuferin" },
            { person_id: persons[2].id, squadron_id: squadrons[1].id, note: "Läuferin" },
            { person_id: persons[3].id, squadron_id: squadrons[1].id, note: "Backup" },
            { person_id: persons[4].id, squadron_id: squadrons[2].id, note: "Jugendlauf" },
            { person_id: persons[5].id, squadron_id: squadrons[2].id, note: "Jugendlauf" },
        ]);
        console.log("👥 Personen mit Staffeln verknüpft.");

        // =====================================================
        // 📝 EVENT-REGISTRIERUNGEN
        // =====================================================
        await EventRegistration.bulkCreate([
            {
                person_id: persons[0].id,
                event_id: events[0].id,
                squadron_id: squadrons[0].id,
                participation_type: "einzeln",
                wishes: "vegetarisch",
                liability_accept: true,
                status: "bestätigt",
            },
            {
                person_id: persons[2].id,
                event_id: events[1].id,
                squadron_id: squadrons[1].id,
                participation_type: "staffel",
                wishes: "ohne Fleisch",
                liability_accept: true,
                status: "in_auswahl",
            },
            {
                person_id: persons[4].id,
                event_id: events[2].id,
                squadron_id: null,
                participation_type: "familie",
                wishes: "mit Kind",
                liability_accept: true,
                status: "bestätigt",
            },
            {
                person_id: persons[5].id,
                event_id: events[3].id,
                squadron_id: squadrons[2].id,
                participation_type: "staffel",
                wishes: "vegetarisch",
                liability_accept: true,
                status: "offen",
            },
        ]);
        console.log("📝 Event-Registrierungen erstellt.");

        // =====================================================
        // 💰 PRODUKTE & RECHNUNGEN
        // =====================================================
        const products = await Product.bulkCreate([
            { name: "Startgebühr Berglauf", price: 39.5, vat: 19 },
            { name: "T-Shirt Lauf 2025", price: 15, vat: 19 },
            { name: "Medaille Gravur", price: 9.9, vat: 19 },
        ]);
        console.log("💰 Produkte erstellt.");

        const invoices = await Invoice.bulkCreate([
            { person_id: persons[0].id, total_amount: 64.4, status: "bezahlt", issued_date: "2025-06-15" },
            { person_id: persons[2].id, total_amount: 54.5, status: "offen", issued_date: "2025-09-10" },
        ]);
        console.log("🧾 Rechnungen erstellt.");

        // =====================================================
        // 🛏️ BUCHUNGEN
        // =====================================================
        await Booking.bulkCreate([
            { person_id: persons[0].id, accommodation_id: accommodations[0].id, event_id: events[0].id, nights: 2, total_price: 150 },
            { person_id: persons[1].id, accommodation_id: accommodations[1].id, event_id: events[1].id, nights: 1, total_price: 90 },
            { person_id: persons[2].id, accommodation_id: accommodations[2].id, event_id: events[2].id, nights: 2, total_price: 120 },
        ]);
        console.log("🛏️ Buchungen erstellt.");

        // =====================================================
        // ✅ FERTIG
        // =====================================================
        console.log("✅ Seeding erfolgreich abgeschlossen!");
    } catch (err) {
        console.error("❌ Fehler beim Seeding:", err);
    }
};
