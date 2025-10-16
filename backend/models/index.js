const sequelize = require("../config/db");

// --------------------------------------------------------------
// 🔹 Importiere alle Models
// --------------------------------------------------------------
const Person = require("./person");
const User = require("./user");
const Accommodation = require("./accommodation");
const Booking = require("./booking");
const Event = require("./event");
const EventRegistration = require("./eventRegistration");
const UserRegistration = require("./userRegistration");
const Route = require("./route");
const Runtime = require("./runtime");
const Squadron = require("./squadron");
const RelPersonSquadron = require("./rel_person_squadron");
const Invoice = require("./invoice");
const Product = require("./product");
const Token = require("./token");
const Occupancy = require("./occupancy");

// --------------------------------------------------------------
// 🧩 Debug-Log
// --------------------------------------------------------------
console.log("DEBUG MODELS:", {
    Person: !!Person?.getTableName,
    User: !!User?.getTableName,
    Event: !!Event?.getTableName,
    EventRegistration: !!EventRegistration?.getTableName,
    Runtime: !!Runtime?.getTableName,
    Squadron: !!Squadron?.getTableName,
    Route: !!Route?.getTableName,
});

// --------------------------------------------------------------
// 🔗 RELATIONEN DEFINIEREN
// --------------------------------------------------------------

// 🧑‍💼 USER ↔ PERSON (1:n)
// Ein User kann mehrere Personen besitzen (owner_id → user.id)
User.hasMany(Person, {
    foreignKey: "owner_id",
    as: "persons",
    onDelete: "SET NULL",
});
Person.belongsTo(User, {
    foreignKey: "owner_id",
    as: "owner",
});

// 🧍 PERSON ↔ USER (1:1 – Login-Beziehung)
Person.hasOne(User, {
    foreignKey: "person_id",
    as: "user",
    onDelete: "CASCADE",
});
User.belongsTo(Person, {
    foreignKey: "person_id",
    as: "person",
});


// 💻 UserRegistration (App-Registrierung)
User.hasMany(UserRegistration, {
    foreignKey: "user_id",
    as: "registrations",
    onDelete: "CASCADE",
});
UserRegistration.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
});

// 💰 Person ↔ Invoice (1:n)
Person.hasMany(Invoice, {
    foreignKey: "person_id",
    as: "invoices",
    onDelete: "CASCADE",
});
Invoice.belongsTo(Person, {
    foreignKey: "person_id",
    as: "person",
});

// 🏡 Booking ↔ Event ↔ Person ↔ Accommodation
Booking.belongsTo(Event, { foreignKey: "event_id", as: "event" });
Event.hasMany(Booking, { foreignKey: "event_id", as: "bookings" });

Booking.belongsTo(Person, { foreignKey: "person_id", as: "person" });
Person.hasMany(Booking, { foreignKey: "person_id", as: "bookings" });

Event.hasMany(Squadron, {
    foreignKey: "event_id",
    as: "squadrons",
    onDelete: "CASCADE",
});
Squadron.belongsTo(Event, {
    foreignKey: "event_id",
    as: "event",
});

Booking.belongsTo(Accommodation, {
    foreignKey: "accommodation_id",
    as: "accommodation",
});
Accommodation.hasMany(Booking, {
    foreignKey: "accommodation_id",
    as: "bookings",
});

// 🏨 Accommodation ↔ Occupancy (1:n)
Accommodation.hasMany(Occupancy, {
    foreignKey: "accommodation_id",
    as: "occupancies",
    onDelete: "CASCADE",
});
Occupancy.belongsTo(Accommodation, {
    foreignKey: "accommodation_id",
    as: "accommodation",
});

// 🎯 Event ↔ Occupancy (1:n)
Event.hasMany(Occupancy, {
    foreignKey: "event_id",
    as: "occupancies",
    onDelete: "CASCADE",
});

Occupancy.belongsTo(Event, {
    foreignKey: "event_id",
    as: "event",
});

// 🗺️ Event ↔ Route (1:n)
Event.hasMany(Route, {
    foreignKey: "event_id",
    as: "routes",
    onDelete: "CASCADE",
});
Route.belongsTo(Event, {
    foreignKey: "event_id",
    as: "event",
});

// 🕓 Route ↔ Runtime (1:n)
Route.hasMany(Runtime, {
    foreignKey: "route_id",
    as: "runtimes",
    onDelete: "CASCADE",
});
Runtime.belongsTo(Route, {
    foreignKey: "route_id",
    as: "route",
});

// 🕒 Person ↔ Runtime (1:n)
Person.hasMany(Runtime, {
    foreignKey: "person_id",
    as: "runtimes",
    onDelete: "CASCADE",
});
Runtime.belongsTo(Person, {
    foreignKey: "person_id",
    as: "person",
});

// 🕓 EventRegistration ↔ Runtime (1:n)
EventRegistration.hasMany(Runtime, {
    foreignKey: "event_registration_id",
    as: "runtimes",
    onDelete: "CASCADE",
});
Runtime.belongsTo(EventRegistration, {
    foreignKey: "event_registration_id",
    as: "eventRegistration",
});

// 🟢 EventRegistration ↔ Person/Event (n:1)
Person.hasMany(EventRegistration, {
    foreignKey: "person_id",
    as: "eventRegistrations",
    onDelete: "CASCADE",
});
EventRegistration.belongsTo(Person, {
    foreignKey: "person_id",
    as: "person",
});

Event.hasMany(EventRegistration, {
    foreignKey: "event_id",
    as: "eventRegistrations",
    onDelete: "CASCADE",
});
EventRegistration.belongsTo(Event, {
    foreignKey: "event_id",
    as: "event",
});

// 🏕️ Event ↔ Accommodation (1:n)
Event.hasMany(Accommodation, {
    foreignKey: "event_id",
    as: "accommodations",
    onDelete: "CASCADE",
});
Accommodation.belongsTo(Event, {
    foreignKey: "event_id",
    as: "event",
});



// 🫂 Squadron ↔ EventRegistration (1:n)
Squadron.hasMany(EventRegistration, {
    foreignKey: "squadron_id",
    as: "eventRegistrations",
    onDelete: "SET NULL",
});
EventRegistration.belongsTo(Squadron, {
    foreignKey: "squadron_id",
    as: "squadron",
});

// 👥 Person ↔ Squadron (n:m)
Person.belongsToMany(Squadron, {
    through: RelPersonSquadron,
    foreignKey: "person_id",
    as: "squadrons",
});
Squadron.belongsToMany(Person, {
    through: RelPersonSquadron,
    foreignKey: "squadron_id",
    as: "persons",
});

// include-Unterstützung
RelPersonSquadron.belongsTo(Person, { foreignKey: "person_id", as: "person" });
RelPersonSquadron.belongsTo(Squadron, { foreignKey: "squadron_id", as: "squadron" });

// 💰 Invoice ↔ Product (n:m)
Invoice.belongsToMany(Product, {
    through: { model: "invoice_products" },
    foreignKey: "invoice_id",
    otherKey: "product_id",
    as: "products",
});
Product.belongsToMany(Invoice, {
    through: { model: "invoice_products" },
    foreignKey: "product_id",
    otherKey: "invoice_id",
    as: "invoices",
});

// --------------------------------------------------------------
// ✅ EXPORTIEREN
// --------------------------------------------------------------
module.exports = {
    sequelize,
    Person,
    User,
    Accommodation,
    Booking,
    Event,
    EventRegistration,
    UserRegistration,
    Runtime,
    Route,
    Squadron,
    RelPersonSquadron,
    Occupancy,
    Invoice,
    Product,
    Token,
};
