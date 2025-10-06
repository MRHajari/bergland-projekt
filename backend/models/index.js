const sequelize = require("../config/db");

// Importiere alle Models (die als Klassen exportiert werden)
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

// 🟢 Nur das neue Belegung-Model ist im Funktionsstil definiert
const { DataTypes } = require("sequelize");
const Belegung = require("./belegung")(sequelize, DataTypes);

const Token = require("./token")(sequelize, require("sequelize").DataTypes);

// --------------------------------------------------------------
// 🔹 RELATIONEN DEFINIEREN
// --------------------------------------------------------------

// Person – Address (1:n)
Person.hasMany(Address, { foreignKey: "person_id", as: "addresses", onDelete: "CASCADE" });
Address.belongsTo(Person, { foreignKey: "person_id", as: "person" });

// Person – LoginData (1:1)
Person.hasOne(LoginData, { foreignKey: "person_id", as: "loginData", onDelete: "CASCADE" });
LoginData.belongsTo(Person, { foreignKey: "person_id", as: "person" });

// Person – Registration (1:n)
Person.hasMany(Registration, { foreignKey: "person_id", as: "registrations", onDelete: "CASCADE" });
Registration.belongsTo(Person, { foreignKey: "person_id", as: "person" });

// Person – Invoice (1:n)
Person.hasMany(Invoice, { foreignKey: "person_id", as: "invoices", onDelete: "CASCADE" });
Invoice.belongsTo(Person, { foreignKey: "person_id", as: "person" });

// --------------------------------------------------------------
// 🟢 Belegung-Relationen
// --------------------------------------------------------------
Person.hasMany(Belegung, { foreignKey: "id_person", as: "belegungen", onDelete: "CASCADE" });
Belegung.belongsTo(Person, { foreignKey: "id_person", as: "person" });

Event.hasMany(Belegung, { foreignKey: "id_event", as: "belegungen", onDelete: "CASCADE" });
Belegung.belongsTo(Event, { foreignKey: "id_event", as: "event" });

Accommodation.hasMany(Belegung, { foreignKey: "id_unterkunft", as: "belegungen", onDelete: "SET NULL" });
Belegung.belongsTo(Accommodation, { foreignKey: "id_unterkunft", as: "unterkunft" });

// --------------------------------------------------------------
// 🔹 Weitere Relationen
// --------------------------------------------------------------
Accommodation.hasMany(Booking, { foreignKey: "accommodation_id", as: "bookings", onDelete: "CASCADE" });
Booking.belongsTo(Accommodation, { foreignKey: "accommodation_id", as: "accommodation" });

Person.hasMany(Booking, { foreignKey: "person_id", as: "bookings", onDelete: "SET NULL" });
Booking.belongsTo(Person, { foreignKey: "person_id", as: "person" });

Event.hasMany(Registration, { foreignKey: "event_id", as: "registrations", onDelete: "CASCADE" });
Registration.belongsTo(Event, { foreignKey: "event_id", as: "event" });

RelayTeam.hasMany(Registration, { foreignKey: "relay_team_id", as: "registrations", onDelete: "SET NULL" });
Registration.belongsTo(RelayTeam, { foreignKey: "relay_team_id", as: "relayTeam" });

Event.hasMany(Route, { foreignKey: "event_id", as: "routes", onDelete: "CASCADE" });
Route.belongsTo(Event, { foreignKey: "event_id", as: "event" });

Registration.hasOne(Runtime, { foreignKey: "registration_id", as: "runtime", onDelete: "CASCADE" });
Runtime.belongsTo(Registration, { foreignKey: "registration_id", as: "registration" });

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
// 🔹 EXPORT
// --------------------------------------------------------------
module.exports = {
    sequelize,
    Person, Address, LoginData,
    Accommodation, Booking,
    Event, Registration, Runtime, RelayTeam, Route,
    Invoice, Product,
    Belegung, Token
};
