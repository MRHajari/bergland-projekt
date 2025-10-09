// backend/models/index.js
const sequelize = require("../config/db");

// --------------------------------------------------------------
// 🔹 Importiere alle Models
// --------------------------------------------------------------
const Person = require("./person");
const User = require("./user");
const Address = require("./address");
const RelPersonAddress = require("./rel_person_address");
const Accommodation = require("./accommodation");
const Booking = require("./booking");
const Event = require("./event");
const EventRegistration = require("./eventRegistration");
const UserRegistration = require("./userRegistration");
const RelayTeam = require("./relay_team"); // Lauftag (RunDate)
const Route = require("./route");
const Runtime = require("./runtime");
const Squadron = require("./squadron"); // Staffel
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
    Address: !!Address?.getTableName,
    Booking: !!Booking?.getTableName,
    Event: !!Event?.getTableName,
    EventRegistration: !!EventRegistration?.getTableName,
    Route: !!Route?.getTableName,
    Runtime: !!Runtime?.getTableName,
    Squadron: !!Squadron?.getTableName,
    RelayTeam: !!RelayTeam?.getTableName,
});

// --------------------------------------------------------------
// 🔗 RELATIONEN DEFINIEREN
// --------------------------------------------------------------

// 🧍 Person ↔ User (1:1)
Person.hasOne(User, {
    foreignKey: "person_id",
    as: "user",
    onDelete: "CASCADE",
});
User.belongsTo(Person, {
    foreignKey: "person_id",
    as: "person",
});

// 🧍 Person ↔ RelPersonAddress (1:n)
Person.hasMany(RelPersonAddress, {
    foreignKey: "person_id",
    as: "personAddresses",
    onDelete: "CASCADE",
});
RelPersonAddress.belongsTo(Person, {
    foreignKey: "person_id",
    as: "person",
});

// 🏠 Address ↔ RelPersonAddress (1:n)
Address.hasMany(RelPersonAddress, {
    foreignKey: "address_id",
    as: "personAddresses",
    onDelete: "CASCADE",
});
RelPersonAddress.belongsTo(Address, {
    foreignKey: "address_id",
    as: "address",
});

// --------------------------------------------------------------
// 💻 UserRegistration (App-Registrierung)
// --------------------------------------------------------------
User.hasMany(UserRegistration, {
    foreignKey: "user_id",
    as: "registrations",
    onDelete: "CASCADE",
});
UserRegistration.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
});

// --------------------------------------------------------------
// 💰 Person ↔ Invoice (1:n)
// --------------------------------------------------------------
Person.hasMany(Invoice, {
    foreignKey: "person_id",
    as: "invoices",
    onDelete: "CASCADE",
});
Invoice.belongsTo(Person, {
    foreignKey: "person_id",
    as: "person",
});

// --------------------------------------------------------------
// 🏡 Booking
// --------------------------------------------------------------
Booking.belongsTo(Event, { foreignKey: "event_id", as: "event" });
Event.hasMany(Booking, { foreignKey: "event_id", as: "bookings" });

Booking.belongsTo(Person, { foreignKey: "person_id", as: "person" });
Person.hasMany(Booking, { foreignKey: "person_id", as: "bookings" });

Booking.belongsTo(Accommodation, {
    foreignKey: "accommodation_id",
    as: "accommodation",
});
Accommodation.hasMany(Booking, {
    foreignKey: "accommodation_id",
    as: "bookings",
});


// --------------------------------------------------------------
// 🏨 Accommodation ↔ Occupancy (1:n)
// --------------------------------------------------------------

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



// --------------------------------------------------------------
// 🗺️ Event ↔ Route (1:n)
// --------------------------------------------------------------
Event.hasMany(Route, {
    foreignKey: "event_id",
    as: "routes",
    onDelete: "CASCADE",
});
Route.belongsTo(Event, {
    foreignKey: "event_id",
    as: "event",
});

// --------------------------------------------------------------
// 🕓 Route ↔ Runtime (1:n)
// --------------------------------------------------------------
Route.hasMany(Runtime, {
    foreignKey: "route_id",
    as: "runtimes",
    onDelete: "CASCADE",
});
Runtime.belongsTo(Route, {
    foreignKey: "route_id",
    as: "route",
});

// --------------------------------------------------------------
// 🕓 EventRegistration ↔ Runtime (1:n)
// --------------------------------------------------------------
EventRegistration.hasMany(Runtime, {
    foreignKey: "registration_id",
    as: "runtimes",
    onDelete: "CASCADE",
});
Runtime.belongsTo(EventRegistration, {
    foreignKey: "registration_id",
    as: "eventRegistration",
});

// --------------------------------------------------------------
// 🟢 EventRegistration ↔ Person/Event (n:1)
// --------------------------------------------------------------
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

// --------------------------------------------------------------
// 🧭 Squadron (Staffel) ↔ EventRegistration (1:n)
// --------------------------------------------------------------
Squadron.hasMany(EventRegistration, {
    foreignKey: "squadron_id",
    as: "eventRegistrations",
    onDelete: "SET NULL",
});
EventRegistration.belongsTo(Squadron, {
    foreignKey: "squadron_id",
    as: "squadron",
});

// --------------------------------------------------------------
// 🗓️ RelayTeam (Lauftag) ↔ EventRegistration (1:n)
// --------------------------------------------------------------
RelayTeam.hasMany(EventRegistration, {
    foreignKey: "relay_team_id",
    as: "eventRegistrations",
    onDelete: "SET NULL",
});
EventRegistration.belongsTo(RelayTeam, {
    foreignKey: "relay_team_id",
    as: "relayTeam",
});

// --------------------------------------------------------------
// 🗓️ RelayTeam ↔ Event & Route (n:1, n:1)
// --------------------------------------------------------------
RelayTeam.belongsTo(Event, {
    foreignKey: "event_id",
    as: "event",
});
Event.hasMany(RelayTeam, {
    foreignKey: "event_id",
    as: "relayTeams",
});

RelayTeam.belongsTo(Route, {
    foreignKey: "route_id",
    as: "route",
});
Route.hasMany(RelayTeam, {
    foreignKey: "route_id",
    as: "relayTeams",
});

// --------------------------------------------------------------
// 💰 Invoice ↔ Product (n:m)
// --------------------------------------------------------------
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
    Address,
    RelPersonAddress,
    Accommodation,
    Booking,
    Event,
    EventRegistration,
    UserRegistration,
    Runtime,
    RelayTeam,
    Route,
    Squadron,
    Occupancy,
    Invoice,
    Product,
    Token
};
