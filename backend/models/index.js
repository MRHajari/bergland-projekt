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
const UserRegistration = require("./userRegistration"); // App-Registrierung
const Runtime = require("./runtime");
const RelayTeam = require("./relay_team");
const Route = require("./route");
const Invoice = require("./invoice");
const Product = require("./product");
const EventRegistration = require("./eventRegistration"); // Event-Anmeldung
const Token = require("./token");

// --------------------------------------------------------------
// 🧩 Debug-Log
// --------------------------------------------------------------
console.log("DEBUG MODELS:", {
    Person: !!Person?.getTableName,
    User: !!User?.getTableName,
    Address: !!Address?.getTableName,
    RelPersonAddress: !!RelPersonAddress?.getTableName,
    Accommodation: !!Accommodation?.getTableName,
    Booking: !!Booking?.getTableName,
    Event: !!Event?.getTableName,
    EventRegistration: !!EventRegistration?.getTableName,
    Token: !!Token?.getTableName,
});

// --------------------------------------------------------------
// 🔗 RELATIONEN DEFINIEREN
// --------------------------------------------------------------

// 🧍 Person ↔ User (1:1) [modernes Auth-System]
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
// 💻 UserRegistration (App-Registrierung, kein Event)
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

Booking.belongsTo(Accommodation, { foreignKey: "accommodation_id", as: "accommodation" });
Accommodation.hasMany(Booking, { foreignKey: "accommodation_id", as: "bookings" });

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
// 🟢 EventRegistration (Event-Anmeldung)
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

RelayTeam.hasMany(EventRegistration, {
    foreignKey: "relay_team_id",
    as: "eventRegistrations",
    onDelete: "SET NULL",
});
EventRegistration.belongsTo(RelayTeam, {
    foreignKey: "relay_team_id",
    as: "relayTeam",
});

// ⚙️ Runtime nur für EventRegistration (1:1)
EventRegistration.hasOne(Runtime, {
    foreignKey: "registration_id",
    as: "runtime",
    onDelete: "CASCADE",
});
Runtime.belongsTo(EventRegistration, {
    foreignKey: "registration_id",
    as: "eventRegistration",
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
    Invoice,
    Product,
    Token,
};
