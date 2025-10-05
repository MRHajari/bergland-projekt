// backend/models/index.js
const sequelize = require("../config/db");

// Import
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
const Product = require("./product"); // ✅ Payment entfernt

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

// Accommodation – Booking (1:n)
Accommodation.hasMany(Booking, { foreignKey: "accommodation_id", as: "bookings", onDelete: "CASCADE" });
Booking.belongsTo(Accommodation, { foreignKey: "accommodation_id", as: "accommodation" });

// Person – Booking (1:n optional)
Person.hasMany(Booking, { foreignKey: "person_id", as: "bookings", onDelete: "SET NULL" });
Booking.belongsTo(Person, { foreignKey: "person_id", as: "person" });

// Event – Registration (1:n)
Event.hasMany(Registration, { foreignKey: "event_id", as: "registrations", onDelete: "CASCADE" });
Registration.belongsTo(Event, { foreignKey: "event_id", as: "event" });

// RelayTeam – Registration (1:n optional)
RelayTeam.hasMany(Registration, { foreignKey: "relay_team_id", as: "registrations", onDelete: "SET NULL" });
Registration.belongsTo(RelayTeam, { foreignKey: "relay_team_id", as: "relayTeam" });

// Event – Route (1:n)
Event.hasMany(Route, { foreignKey: "event_id", as: "routes", onDelete: "CASCADE" });
Route.belongsTo(Event, { foreignKey: "event_id", as: "event" });

// Registration – Runtime (1:1)
Registration.hasOne(Runtime, { foreignKey: "registration_id", as: "runtime", onDelete: "CASCADE" });
Runtime.belongsTo(Registration, { foreignKey: "registration_id", as: "registration" });

// Invoice – Product (n:m)
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

module.exports = {
    sequelize,
    Person, Address, LoginData,
    Accommodation, Booking,
    Event, Registration, Runtime, RelayTeam, Route,
    Invoice, Product // ✅ Payment entfernt
};
