// ======================================================
// 🧩 Model Loader & Associations – vollständig integriert
// ======================================================

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
const RelInvoiceProduct = require("./rel_invoice_product");
const Token = require("./token");
const Occupancy = require("./occupancy");
const EventRoute = require("./eventRoute");

// --------------------------------------------------------------
// 🧩 Debug-Log
// --------------------------------------------------------------
console.log("DEBUG MODELS:", {
    Person: !!Person?.getTableName,
    User: !!User?.getTableName,
    Event: !!Event?.getTableName,
    EventRegistration: !!EventRegistration?.getTableName,
    Booking: !!Booking?.getTableName,
    Invoice: !!Invoice?.getTableName,
    Product: !!Product?.getTableName,
    EventRoute: !!EventRoute?.getTableName,
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

// ======================================================
// 💰 RECHNUNGEN & PRODUKTE (Invoice, Product, RelInvoiceProduct)
// ======================================================

// 💳 PERSON ↔ INVOICE (1:n)
Person.hasMany(Invoice, {
    foreignKey: "id_person",
    as: "invoices",
    onDelete: "CASCADE",
});
Invoice.belongsTo(Person, {
    foreignKey: "id_person",
    as: "kunde",
});

// 🧾 INVOICE ↔ PRODUCT (n:m über RelInvoiceProduct)
Invoice.belongsToMany(Product, {
    through: RelInvoiceProduct,
    foreignKey: "id_rechnung",
    otherKey: "id_produkt",
    as: "products",
});

Product.belongsToMany(Invoice, {
    through: RelInvoiceProduct,
    foreignKey: "id_produkt",
    otherKey: "id_rechnung",
    as: "invoices",
});

// 🔗 Zusätzliche direkte Beziehungen für einfaches Include
RelInvoiceProduct.belongsTo(Invoice, {
    foreignKey: "id_rechnung",
    as: "invoice",
});
RelInvoiceProduct.belongsTo(Product, {
    foreignKey: "id_produkt",
    as: "product",
});

Invoice.hasMany(RelInvoiceProduct, {
    foreignKey: "id_rechnung",
    as: "productRelations", // ✅ anderer Alias, kein Konflikt
});

Product.hasMany(RelInvoiceProduct, {
    foreignKey: "id_produkt",
    as: "invoiceRelations",
});

// ======================================================
// 🏨 BOOKING ↔ EVENTREGISTRATION ↔ ACCOMMODATION ↔ EVENT
// ======================================================

EventRegistration.hasMany(Booking, {
    foreignKey: "event_registration_id",
    as: "bookings",
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

Event.hasMany(Booking, {
    foreignKey: "event_id",
    as: "bookings",
    onDelete: "CASCADE",
});
Booking.belongsTo(Event, {
    foreignKey: "event_id",
    as: "event",
});

Event.hasMany(Squadron, {
    foreignKey: "event_id",
    as: "squadrons",
    onDelete: "CASCADE",
});
Squadron.belongsTo(Event, {
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

// ======================================================
// 🏨 EVENT ↔ OCCUPANCY
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
// 🕒 EVENTREGISTRATIONPARTICIPANT ↔ RUNTIME
// ======================================================

EventRegistrationParticipant.hasMany(Runtime, {
    foreignKey: "participant_id",
    as: "runtimes",
    onDelete: "CASCADE",
});
Runtime.belongsTo(EventRegistrationParticipant, {
    foreignKey: "participant_id",
    as: "participant",
});

// ======================================================
// 👮 USER (Timekeeper) ↔ RUNTIME
// ======================================================
User.hasMany(Runtime, {
    foreignKey: "recorded_by",
    as: "recordedRuntimes",
});
Runtime.belongsTo(User, {
    foreignKey: "recorded_by",
    as: "timekeeper",
});

// ======================================================
// ✅ EVENT ↔ ROUTE über EVENTROUTE (Join-Tabelle)
// ======================================================

// Event 1:n EventRoute
Event.hasMany(EventRoute, {
    foreignKey: "event_id",
    as: "eventRoutes",
    onDelete: "CASCADE",
});
EventRoute.belongsTo(Event, {
    foreignKey: "event_id",
    as: "event",
});

// Route 1:n EventRoute
Route.hasMany(EventRoute, {
    foreignKey: "route_id",
    as: "eventRoutes",
    onDelete: "CASCADE",
});
EventRoute.belongsTo(Route, {
    foreignKey: "route_id",
    as: "route",
});

// Many-to-Many Zugriff
Event.belongsToMany(Route, {
    through: EventRoute,
    foreignKey: "event_id",
    otherKey: "route_id",
    as: "routes",
});

Route.belongsToMany(Event, {
    through: EventRoute,
    foreignKey: "route_id",
    otherKey: "event_id",
    as: "events",
});

// ======================================================
// ✅ RUNTIME ↔ EVENTROUTE (KERNRELATION)
// ======================================================

EventRoute.hasMany(Runtime, {
    foreignKey: "event_route_id",
    as: "runtimes",
    onDelete: "CASCADE",
});

Runtime.belongsTo(EventRoute, {
    foreignKey: "event_route_id",
    as: "eventRoute",
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
    EventRoute,
    Squadron,
    RelPersonSquadron,
    Occupancy,
    Invoice,
    Product,
    RelInvoiceProduct,
    Token,
};
