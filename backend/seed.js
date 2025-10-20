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
    EventRegistrationParticipant,
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
        // 🔐 BENUTZER + PERSONEN
        // =====================================================
        const hashedAdmin = await bcrypt.hash("Admin123!", 10);
        const hashedUser = await bcrypt.hash("User123!", 10);

        const userData = [
            {
                first_name: "Mohammad",
                last_name: "Hajari",
                email: "mohammad@test.com",
                birth_date: "1990-06-12",
                role: "admin",
                password_hash: hashedAdmin,
                phone: "+49 157 1234567",
                street: "Spinozastraße 18",
                postal_code: "67663",
                city: "Kaiserslautern",
                country: "Deutschland",
            },
            {
                first_name: "Clara",
                last_name: "Fischer",
                email: "clara@test.com",
                birth_date: "1985-09-22",
                role: "admin",
                password_hash: hashedAdmin,
                phone: "+49 151 9876543",
                street: "Bahnhofstraße 12",
                postal_code: "80335",
                city: "München",
                country: "Deutschland",
            },
            {
                first_name: "Anna",
                last_name: "Schmidt",
                email: "anna@test.com",
                birth_date: "1994-03-10",
                role: "user",
                password_hash: hashedUser,
                phone: "+49 170 5566778",
                street: "Rosenweg 3",
                postal_code: "50667",
                city: "Köln",
                country: "Deutschland",
            },
            {
                first_name: "Markus",
                last_name: "Weber",
                email: "markus@test.com",
                birth_date: "1988-07-19",
                role: "user",
                password_hash: hashedUser,
                phone: "+49 162 9988776",
                street: "Hauptstraße 45",
                postal_code: "70173",
                city: "Stuttgart",
                country: "Deutschland",
            },
            {
                first_name: "Sojin",
                last_name: "Hajari",
                email: "sojin@test.com",
                birth_date: "2013-05-14",
                role: "user",
                password_hash: hashedUser,
                street: "Spinozastraße 18",
                postal_code: "67663",
                city: "Kaiserslautern",
                country: "Deutschland",
            },
            {
                first_name: "Hanassa",
                last_name: "Hajari",
                email: "hanassa@test.com",
                birth_date: "2016-02-21",
                role: "user",
                password_hash: hashedUser,
                street: "Spinozastraße 18",
                postal_code: "67663",
                city: "Kaiserslautern",
                country: "Deutschland",
            },
        ];

        const users = [];
        const persons = [];

        for (const data of userData) {
            const result = await sequelize.transaction(async (t) => {
                const person = await Person.create(
                    {
                        first_name: data.first_name,
                        last_name: data.last_name,
                        birth_date: data.birth_date,
                        email: data.email,
                        phone: data.phone || null,
                        street: data.street,
                        postal_code: data.postal_code,
                        city: data.city,
                        country: data.country,
                    },
                    { transaction: t }
                );

                const user = await User.create(
                    {
                        email: data.email,
                        password_hash: data.password_hash,
                        role: data.role,
                        is_verified: true,
                        person_id: person.id,
                    },
                    { transaction: t }
                );

                await person.update({ owner_id: user.id }, { transaction: t });
                return { user, person };
            });

            users.push(result.user);
            persons.push(result.person);
        }

        console.log("🔗 Benutzer & Personen erstellt und verknüpft.");

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
        await Route.bulkCreate([
            { name: "Tirol Panorama Strecke", distance_km: 21.1, difficulty: "schwer", event_id: events[0].id },
            { name: "Pfälzer Hügelrunde", distance_km: 10, difficulty: "mittel", event_id: events[1].id },
            { name: "Isar Parkrunde", distance_km: 5, difficulty: "leicht", event_id: events[2].id },
            { name: "Winterpark Loop", distance_km: 8, difficulty: "mittel", event_id: events[3].id },
        ]);
        console.log("🗺️ Routen erstellt.");

        // =====================================================
        // 🧭 STAFFELN
        // =====================================================
        const squadrons = await Squadron.bulkCreate([
            { name: "TrailRunners Pfalz", start_number: "STF-2025-01", members_count: 4, description: "4er-Staffel Halbmarathon", event_id: events[0].id },
            { name: "AlpenTeam Tirol", start_number: "STF-2025-02", members_count: 3, description: "3er-Team auf 10 km Route", event_id: events[1].id },
            { name: "Kaiserslautern Power", start_number: "STF-2025-03", members_count: 5, description: "5er-Team Winterlauf", event_id: events[3].id },
        ]);
        console.log("🧭 Staffeln erstellt.");

        // =====================================================
        // 📝 NEUE EVENT-REGISTRIERUNGEN (Gruppenstruktur)
        // =====================================================
        console.log("📝 Erstelle Gruppen-Registrierungen ...");

        // 🔹 Mohammad meldet sich als User (bzw. seine Person) für Berglauf an
        const group1 = await EventRegistration.create({
            event_id: events[0].id,
            registered_by_person_id: persons[0].id, // ✅ Statt user_id
            phone_number: "+49 157 1234567",
            license_plate: "KL-MH-123",
            catering_type: "vegetarisch",
            wishes: "Zimmer mit Balkon",
            club: "LAC Kaiserslautern",
            start_number: "B2025-01",
            gender: "m",
            status: "bestätigt",
        });

        // 🔹 Teilnehmer dieser Registrierung
        await EventRegistrationParticipant.bulkCreate([
            {
                registration_id: group1.id,
                person_id: persons[0].id, // Mohammad selbst
                participation_type: "staffel",
                liability_accept: true,
            },
            {
                registration_id: group1.id,
                person_id: persons[4].id, // Sojin
                participation_type: "staffel",
                liability_accept: true,
            },
            {
                registration_id: group1.id,
                person_id: persons[5].id, // Hanassa
                squadron_id: squadrons[0].id,
                participation_type: "staffel",
                liability_accept: true,
            },
        ]);

        // 🔹 Anna meldet sich als User (bzw. ihre Person) für Pfälzer Trail Run an
        const group2 = await EventRegistration.create({
            event_id: events[1].id,
            registered_by_person_id: persons[2].id, // ✅ statt user_id
            phone_number: "+49 170 5566778",
            catering_type: "Standard",
            wishes: null,
            club: "TV Köln",
            start_number: "P2025-02",
            gender: "w",
            status: "in_auswahl",
        });

        await EventRegistrationParticipant.bulkCreate([
            {
                registration_id: group2.id,
                person_id: persons[2].id, // Anna selbst
                participation_type: "einzeln",
                liability_accept: true,
            },
        ]);

        console.log("✅ Gruppen-Registrierungen inkl. Teilnehmer erstellt.");


        // =====================================================
        // 💰 PRODUKTE & RECHNUNGEN
        // =====================================================
        await Product.bulkCreate([
            { name: "Startgebühr Berglauf", price: 39.5, vat: 19 },
            { name: "T-Shirt Lauf 2025", price: 15, vat: 19 },
            { name: "Medaille Gravur", price: 9.9, vat: 19 },
        ]);
        console.log("💰 Produkte erstellt.");

        await Invoice.bulkCreate([
            { person_id: persons[0].id, total_amount: 64.4, status: "bezahlt", issued_date: "2025-06-15" },
            { person_id: persons[2].id, total_amount: 54.5, status: "offen", issued_date: "2025-09-10" },
        ]);
        console.log("🧾 Rechnungen erstellt.");

        // =====================================================
        // 🛏️ BUCHUNGEN
        // =====================================================
        await Booking.bulkCreate([
            {
                user_id: users[0].id,
                accommodation_id: accommodations[0].id,
                event_id: events[0].id,
                single_beds: 1,
                double_beds: 0,
                multi_beds: 0,
            },
            {
                user_id: users[1].id,
                accommodation_id: accommodations[1].id,
                event_id: events[1].id,
                single_beds: 1,
                double_beds: 1,
                multi_beds: 0,
            },
            {
                user_id: users[2].id,
                accommodation_id: accommodations[2].id,
                event_id: events[2].id,
                single_beds: 2,
                double_beds: 0,
                multi_beds: 1,
            },
        ]);
        console.log("🛏️ Buchungen erstellt.");

        console.log("✅ Seeding erfolgreich abgeschlossen!");
    } catch (err) {
        console.error("❌ Fehler beim Seeding:", err);
    }
};
