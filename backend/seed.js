require("dotenv").config();
const bcrypt = require("bcrypt");
const {
    sequelize,
    Person,
    LoginData,
    Accommodation,
    Event,
    Product,
} = require("./models");

(async () => {
    try {
        console.log("🌱 Starte erweiterten Daten-Seed...");

        // 1️⃣ Verbindung herstellen
        await sequelize.authenticate();
        console.log("✅ DB-Verbindung erfolgreich!");

        // 2️⃣ Tabellen erstellen (nur falls nicht vorhanden)
        await sequelize.sync(); // ⚡ erstellt alle Tabellen, ohne Daten zu löschen
        console.log("✅ Tabellen erstellt oder bereits vorhanden!");

        // =====================================================
        // 👤 ADMIN-BENUTZER
        // =====================================================
        const adminEmail = "admin@example.com";
        const adminPassword = "ChangeMe123!";

        let adminPerson = await Person.findOne({ where: { email: adminEmail } });
        if (!adminPerson) {
            adminPerson = await Person.create({
                first_name: "Admin",
                last_name: "User",
                email: adminEmail,
            });
            console.log("👤 Admin-Person erstellt.");
        }

        let adminLogin = await LoginData.findOne({
            where: { person_id: adminPerson.id },
        });
        if (!adminLogin) {
            const password_hash = await bcrypt.hash(adminPassword, 10);
            await LoginData.create({
                person_id: adminPerson.id,
                password_hash,
                role: "admin",
            });
            console.log(`🔑 Admin-Login erstellt: ${adminEmail}`);
        } else {
            console.log(`ℹ️ Admin existiert bereits: ${adminEmail}`);
        }

        // =====================================================
        // 👥 BEISPIEL-USERS
        // =====================================================
        const users = [
            { first_name: "Admin", last_name: "User", email: "admin@test.com", password: "Admin123!", role: "admin" },
            { first_name: "Admin1", last_name: "User", email: "admin1@test.com", password: "Admin123!", role: "admin" },
            { first_name: "Anna", last_name: "Berg", email: "anna@example.com", password: "Passwort123", role: "user" },
            { first_name: "Tom", last_name: "Lauf", email: "tom@example.com", password: "Passwort123", role: "user" },
            { first_name: "Lisa", last_name: "See", email: "lisa@example.com", password: "Passwort123", role: "admin" },
            { first_name: "Markus", last_name: "Klein", email: "markus@example.com", password: "Passwort123", role: "user" },
            { first_name: "Sven", last_name: "Lang", email: "sven@example.com", password: "Passwort123", role: "admin" },
            { first_name: "Clara", last_name: "Mond", email: "clara@example.com", password: "Passwort123", role: "user" },
        ];

        for (const user of users) {
            let person = await Person.findOne({ where: { email: user.email } });
            if (!person) {
                person = await Person.create({
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                });
            }

            const loginExists = await LoginData.findOne({
                where: { person_id: person.id },
            });
            if (!loginExists) {
                const password_hash = await bcrypt.hash(user.password, 10);
                await LoginData.create({
                    person_id: person.id,
                    password_hash,
                    role: user.role || "user",
                });
                console.log(`👤 ${user.role === "admin" ? "Admin" : "Benutzer"} erstellt: ${user.email}`);
            }
        }



        // =====================================================
        // 🏨 UNTERKÜNFTE
        // =====================================================
        const accommodations = [
            { name: "Bergblick Hotel", city: "Innsbruck", country: "Österreich", total_beds: 60 },
            { name: "Alpenruhe Lodge", city: "Garmisch-Partenkirchen", country: "Deutschland", total_beds: 29 },
            { name: "Seehotel Panorama", city: "Zell am See", country: "Österreich", total_beds: 85 },
            { name: "Sporthotel Tirol", city: "Going", country: "Österreich", total_beds: 50 },
            { name: "Lakeside Resort", city: "Konstanz", country: "Deutschland", total_beds: 70 },
        ];

        for (const acc of accommodations) {
            const found = await Accommodation.findOne({ where: { name: acc.name } });
            if (!found) {
                await Accommodation.create(acc);
                console.log(`🏨 Unterkunft erstellt: ${acc.name}`);
            }
        }

        // =====================================================
        // 🎉 EVENTS
        // =====================================================
        const events = [
            { name: "Berglauf 2025", description: "Ein anspruchsvoller Berglauf durch die Alpen mit 1500 Höhenmetern.", start_date: new Date("2025-06-15"), end_date: new Date("2025-06-16") },
            { name: "Triathlon Zell am See", description: "Schwimmen, Radfahren, Laufen – der Klassiker am See!", start_date: new Date("2025-07-20"), end_date: new Date("2025-07-21") },
            { name: "Marathon Garmisch", description: "Der traditionsreiche Alpenmarathon für Profis und Hobbysportler.", start_date: new Date("2025-09-10"), end_date: new Date("2025-09-10") },
            { name: "Winterlauf Kitzbühel", description: "Ein frostiger Lauf mit atemberaubender Kulisse!", start_date: new Date("2025-12-10"), end_date: new Date("2025-12-10") },
            { name: "Sommertrail Davos", description: "Lauferlebnis auf 1800m Höhe mit spektakulärer Aussicht.", start_date: new Date("2025-08-02"), end_date: new Date("2025-08-03") },
        ];

        for (const ev of events) {
            const found = await Event.findOne({ where: { name: ev.name } });
            if (!found) {
                await Event.create(ev);
                console.log(`🎯 Event erstellt: ${ev.name}`);
            }
        }

        // =====================================================
        // 🛍️ PRODUKTE
        // =====================================================
        const products = [
            { name: "Startpaket", price: 49.99, description: "Teilnahmepaket inkl. Startnummer und Trinkflasche." },
            { name: "Event T-Shirt", price: 19.99, description: "Offizielles Sportshirt mit Event-Logo." },
            { name: "Finisher-Medaille", price: 9.99, description: "Erinnerungsmedaille für erfolgreiche Teilnehmer." },
            { name: "VIP-Paket", price: 199.99, description: "Premium-Paket mit Hotelübernachtung und Massageservice." },
            { name: "Laufmütze", price: 14.99, description: "Leichte, atmungsaktive Mütze für Läufer." },
            { name: "Trinkgürtel", price: 24.99, description: "Praktischer Laufgürtel mit Trinkflasche." },
        ];

        for (const p of products) {
            const found = await Product.findOne({ where: { name: p.name } });
            if (!found) {
                await Product.create(p);
                console.log(`🛍️ Produkt erstellt: ${p.name}`);
            }
        }

        // =====================================================
        console.log("✅ Seed erfolgreich abgeschlossen!");
    } catch (err) {
        console.error("❌ Fehler beim Seeding:", err);
    } finally {
        await sequelize.close();
        console.log("🔒 Verbindung geschlossen.");
    }
})();
