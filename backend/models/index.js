// backend/models/index.js
const sequelize = require("../config/db");
const EventRegistrationParticipant = require("./eventRegistrationParticipant");

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

// 💻 USER ↔ USERREGISTRATION (1:n)
User.hasMany(UserRegistration, {
    foreignKey: "user_id",
    as: "registrations",
    onDelete: "CASCADE",
});
UserRegistration.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
});

// 💰 PERSON ↔ INVOICE (1:n)
Person.hasMany(Invoice, {
    foreignKey: "person_id",
    as: "invoices",
    onDelete: "CASCADE",
});
Invoice.belongsTo(Person, {
    foreignKey: "person_id",
    as: "person",
});

// 🏨 BOOKING ↔ EVENTREGISTRATION ↔ ACCOMMODATION
EventRegistration.hasOne(Booking, {
    foreignKey: "event_registration_id",
    as: "booking",
    onDelete: "CASCADE",
});
Booking.belongsTo(EventRegistration, {
    foreignKey: "event_registration_id",
    as: "eventRegistration",
});

Accommodation.hasMany(Booking, {
    foreignKey: "accommodation_id",
    as: "bookings",
    onDelete: "CASCADE",
});
Booking.belongsTo(Accommodation, {
    foreignKey: "accommodation_id",
    as: "accommodation",
});

// 🪪 EVENT ↔ SQUADRON (1:n)
Event.hasMany(Squadron, {
    foreignKey: "event_id",
    as: "squadrons",
    onDelete: "CASCADE",
});
Squadron.belongsTo(Event, {
    foreignKey: "event_id",
    as: "event",
});

// ======================================================
// 🏨 EVENT ↔ OCCUPANCY (direkte Relationen)
// ======================================================
Event.hasMany(Occupancy, {
    foreignKey: "event_id",
    as: "occupancies",
    onDelete: "CASCADE",
});
Occupancy.belongsTo(Event, {
    foreignKey: "event_id",
    as: "event",
});

Accommodation.hasMany(Occupancy, {
    foreignKey: "accommodation_id",
    as: "occupancies",
    onDelete: "CASCADE",
});
Occupancy.belongsTo(Accommodation, {
    foreignKey: "accommodation_id",
    as: "accommodation",
});

// ======================================================
// 🏨 EVENT ↔ BOOKING (1:n für Admin-Auswertungen)
// ======================================================
Event.hasMany(Booking, {
    foreignKey: "event_id",
    as: "bookings",
    onDelete: "CASCADE",
});
Booking.belongsTo(Event, {
    foreignKey: "event_id",
    as: "event",
});

User.hasMany(Booking, {
    foreignKey: "user_id",
    as: "bookings",
    onDelete: "CASCADE",
});
Booking.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
});

// 🗺️ EVENT ↔ ROUTE (1:n)
Event.hasMany(Route, {
    foreignKey: "event_id",
    as: "routes",
    onDelete: "CASCADE",
});
Route.belongsTo(Event, {
    foreignKey: "event_id",
    as: "event",
});

// 🕓 ROUTE ↔ RUNTIME (1:n)
Route.hasMany(Runtime, {
    foreignKey: "route_id",
    as: "runtimes",
    onDelete: "CASCADE",
});
Runtime.belongsTo(Route, {
    foreignKey: "route_id",
    as: "route",
});

// 🕒 PERSON ↔ RUNTIME (1:n)
Person.hasMany(Runtime, {
    foreignKey: "person_id",
    as: "runtimes",
    onDelete: "CASCADE",
});
Runtime.belongsTo(Person, {
    foreignKey: "person_id",
    as: "person",
});

// 🕓 EVENTREGISTRATION ↔ RUNTIME (1:n)
EventRegistration.hasMany(Runtime, {
    foreignKey: "event_registration_id",
    as: "runtimes",
    onDelete: "CASCADE",
});
Runtime.belongsTo(EventRegistration, {
    foreignKey: "event_registration_id",
    as: "eventRegistration",
});

// ======================================================
// 🔗 EventRegistration – Gruppenstruktur
// ======================================================
Person.hasMany(EventRegistration, {
    foreignKey: "registered_by_person_id",
    as: "createdEventRegistrations",
    onDelete: "CASCADE",
});
EventRegistration.belongsTo(Person, {
    foreignKey: "registered_by_person_id",
    as: "registered_by_person",
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

// 👥 Teilnehmer (n:m über EventRegistrationParticipant)
EventRegistration.hasMany(EventRegistrationParticipant, {
    foreignKey: "registration_id",
    as: "participants",
    onDelete: "CASCADE",
});
EventRegistrationParticipant.belongsTo(EventRegistration, {
    foreignKey: "registration_id",
    as: "registration",
});

Person.hasMany(EventRegistrationParticipant, {
    foreignKey: "person_id",
    as: "registrationParticipations",
    onDelete: "CASCADE",
});
EventRegistrationParticipant.belongsTo(Person, {
    foreignKey: "person_id",
    as: "person",
});

Squadron.hasMany(EventRegistrationParticipant, {
    foreignKey: "squadron_id",
    as: "registrationParticipants",
    onDelete: "SET NULL",
});
EventRegistrationParticipant.belongsTo(Squadron, {
    foreignKey: "squadron_id",
    as: "squadron",
});

// 👥 PERSON ↔ SQUADRON (n:m)
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

RelPersonSquadron.belongsTo(Person, { foreignKey: "person_id", as: "person" });
RelPersonSquadron.belongsTo(Squadron, { foreignKey: "squadron_id", as: "squadron" });

// 💰 INVOICE ↔ PRODUCT (n:m)
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

// 🪪 Staffel-Zuordnung (optional)
Squadron.hasMany(EventRegistration, {
    foreignKey: "squadron_id",
    as: "eventRegistrations",
    onDelete: "SET NULL",
});
EventRegistration.belongsTo(Squadron, {
    foreignKey: "squadron_id",
    as: "squadron",
});

// ======================================================
// ✅ EXPORTIEREN
// ======================================================
module.exports = {
    sequelize,
    Person,
    User,
    Accommodation,
    Booking,
    Event,
    EventRegistration,
    EventRegistrationParticipant,
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
