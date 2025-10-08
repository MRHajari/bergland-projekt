const sequelize = require("../config/db");

// 🔹 Importiere alle Models
const Person = require("./person");
const Address = require("./address");
const LoginData = require("./login_data");
const Accommodation = require("./accommodation");
const Booking = require("./booking");
const Event = require("./event");
const Registration = require("./registration");
const Runtime = require("./runtime");
const RelayTeam = require("./relay_team");
const Route = require("./route");
const Invoice = require("./invoice");
const Product = require("./product");
const EventRegistration = require("./eventRegistration");
const Token = require("./token")(sequelize, require("sequelize").DataTypes);

// --------------------------------------------------------------
// 🔹 RELATIONEN DEFINIEREN
// --------------------------------------------------------------

// 🧍 Person – Address (1:n)
Person.hasMany(Address, { foreignKey: "person_id", as: "addresses", onDelete: "CASCADE" });
Address.belongsTo(Person, { foreignKey: "person_id", as: "person" });

// 🧍 Person – LoginData (1:1)
Person.hasOne(LoginData, { foreignKey: "person_id", as: "loginData", onDelete: "CASCADE" });
LoginData.belongsTo(Person, { foreignKey: "person_id", as: "person" });

// 🧍 Person – Registration (1:n)
Person.hasMany(Registration, { foreignKey: "person_id", as: "registrations", onDelete: "CASCADE" });
Registration.belongsTo(Person, { foreignKey: "person_id", as: "person" });

// 🧍 Person – Invoice (1:n)
Person.hasMany(Invoice, { foreignKey: "person_id", as: "invoices", onDelete: "CASCADE" });
Invoice.belongsTo(Person, { foreignKey: "person_id", as: "person" });

// --------------------------------------------------------------
// 🏃‍♂️ Event & Registration (alt)
// --------------------------------------------------------------
Event.hasMany(Registration, { foreignKey: "event_id", as: "registrations", onDelete: "CASCADE" });
Registration.belongsTo(Event, { foreignKey: "event_id", as: "event" });

RelayTeam.hasMany(Registration, { foreignKey: "relay_team_id", as: "registrations", onDelete: "SET NULL" });
Registration.belongsTo(RelayTeam, { foreignKey: "relay_team_id", as: "relayTeam" });

// --------------------------------------------------------------
// Booking
// --------------------------------------------------------------
Booking.belongsTo(Event, { foreignKey: "event_id", as: "event" });
Event.hasMany(Booking, { foreignKey: "event_id", as: "bookings" });

Booking.belongsTo(Person, { foreignKey: "person_id", as: "person" });
Person.hasMany(Booking, { foreignKey: "person_id", as: "bookings" });

Booking.belongsTo(Accommodation, { foreignKey: "accommodation_id", as: "accommodation" });
Accommodation.hasMany(Booking, { foreignKey: "accommodation_id", as: "bookings" });

// --------------------------------------------------------------
// 🗺️ Event – Route
// --------------------------------------------------------------
Event.hasMany(Route, { foreignKey: "event_id", as: "routes", onDelete: "CASCADE" });
Route.belongsTo(Event, { foreignKey: "event_id", as: "event" });

// --------------------------------------------------------------
// 🟢 EventRegistration (neues System)
// --------------------------------------------------------------
Person.hasMany(EventRegistration, { foreignKey: "person_id", as: "eventRegistrations", onDelete: "CASCADE" });
EventRegistration.belongsTo(Person, { foreignKey: "person_id", as: "person" });

Event.hasMany(EventRegistration, { foreignKey: "event_id", as: "eventRegistrations", onDelete: "CASCADE" });
EventRegistration.belongsTo(Event, { foreignKey: "event_id", as: "event" });

RelayTeam.hasMany(EventRegistration, { foreignKey: "relay_team_id", as: "eventRegistrations", onDelete: "SET NULL" });
EventRegistration.belongsTo(RelayTeam, { foreignKey: "relay_team_id", as: "relayTeam" });

// ⚙️ Runtime nur für neues System!
EventRegistration.hasOne(Runtime, { foreignKey: "registration_id", as: "runtime", onDelete: "CASCADE" });
Runtime.belongsTo(EventRegistration, { foreignKey: "registration_id", as: "eventRegistration" });

// --------------------------------------------------------------
// 💰 Rechnungen & Produkte (n:m)
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
// ✅ EXPORT
// --------------------------------------------------------------
module.exports = {
    sequelize,
    Person,
    Address,
    LoginData,
    Accommodation,
    Booking,
    Event,
    Registration,
    EventRegistration,
    Runtime,
    RelayTeam,
    Route,
    Invoice,
    Product,
    Token,
};
