const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");

process.env.JWT_SECRET = "test-only-access-secret";
process.env.JWT_REFRESH_SECRET = "test-only-refresh-secret";
process.env.DB_DIALECT = "sqlite";
process.env.DB_STORAGE = ":memory:";

const jwt = require("jsonwebtoken");
const { User, Person, Event, EventRegistration, Accommodation, Occupancy, Invoice, Product, RelInvoiceProduct, sequelize } = require("../models");
const { app, ensureAdminUser } = require("../server");

let server;
let baseUrl;

before(async () => {
    await sequelize.sync({ force: true });
    server = app.listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await User.sequelize.close();
});

for (const [method, path] of [
    ["GET", "/"], ["GET", "/example"], ["POST", "/"],
    ["PUT", "/example"], ["DELETE", "/example"],
]) {
    test(`users ${method} ${path} rejects anonymous requests`, async () => {
        const response = await fetch(`${baseUrl}/api/users${path}`, { method });
        assert.equal(response.status, 401);
    });

    test(`users ${method} ${path} rejects ordinary users`, async () => {
        const token = jwt.sign({ user: { id: "test-user", role: "user" } }, process.env.JWT_SECRET);
        const response = await fetch(`${baseUrl}/api/users${path}`, {
            method,
            headers: { Authorization: `Bearer ${token}` },
        });
        assert.equal(response.status, 403);
    });
}

test("user JSON never exposes the password hash", () => {
    const user = User.build({ email: "test@example.com", password_hash: "private-hash" });
    assert.equal(JSON.parse(JSON.stringify(user)).password_hash, undefined);
    assert.equal(user.password_hash, "private-hash");
});

test("admin bootstrap never resets existing credentials or roles", async () => {
    process.env.ADMIN_EMAIL = "existing@example.com";
    process.env.ADMIN_PASSWORD = "bootstrap-password";
    const user = await User.create({ email: process.env.ADMIN_EMAIL, password_hash: "original", role: "user" });
    await ensureAdminUser();
    await user.reload();
    assert.equal(user.password_hash, "original");
    assert.equal(user.role, "user");
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD;
});

test("admin bootstrap without configuration creates no default account", async () => {
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD;
    await ensureAdminUser();
    assert.equal(await User.count({ where: { email: "admin@test.com" } }), 0);
});

test("malformed JSON returns a JSON error, not an HTML stack trace", async () => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: "{",
    });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).message, "Ungueltige Anfrage.");
});

test("person endpoints isolate owners and preserve linked accounts", async () => {
    const owner = await User.create({ email: "owner@example.com", password_hash: "hash" });
    const other = await User.create({ email: "other@example.com", password_hash: "hash" });
    const ownPerson = await Person.create({ first_name: "Own", last_name: "Person", owner_id: owner.id });
    const otherPerson = await Person.create({ first_name: "Other", last_name: "Person", owner_id: other.id });
    await owner.update({ person_id: ownPerson.id });
    const token = jwt.sign({ user: { id: owner.id, role: "user" } }, process.env.JWT_SECRET);
    const headers = { Authorization: `Bearer ${token}` };
    const list = await fetch(`${baseUrl}/api/persons?owner_id=${other.id}`, { headers });
    assert.deepEqual((await list.json()).map((person) => person.id), [ownPerson.id]);
    for (const method of ["GET", "PUT", "DELETE"]) {
        const response = await fetch(`${baseUrl}/api/persons/${otherPerson.id}`, { method, headers });
        assert.equal(response.status, 403);
    }
    const own = await fetch(`${baseUrl}/api/persons/${ownPerson.id}`, { headers });
    assert.equal(own.status, 200);
    const deletion = await fetch(`${baseUrl}/api/persons/${ownPerson.id}`, { method: "DELETE", headers });
    assert.equal(deletion.status, 409);
    assert.ok(await User.findByPk(owner.id));
});

test("administrative writes reject anonymous and ordinary users", async () => {
    const token = jwt.sign({ user: { id: "test-user", role: "user" } }, process.env.JWT_SECRET);
    for (const [method, path] of [
        ["POST", "products"], ["PUT", "products/1"], ["DELETE", "products/1"],
        ["POST", "accommodations"], ["PUT", "accommodations/1"], ["DELETE", "accommodations/1"],
        ["POST", "routes"], ["PUT", "routes/1"], ["DELETE", "routes/1"],
        ["POST", "event-routes"], ["POST", "event-routes/bulk/1"], ["DELETE", "event-routes/1"],
        ["POST", "occupancies"], ["PUT", "occupancies/1"], ["DELETE", "occupancies/1"],
        ["POST", "occupancies/updateAssignments"], ["PATCH", "invoices/1/pay"],
        ["GET", "invoices"],
        ["POST", "invoices/1/products/1"], ["DELETE", "invoices/1/products/1"],
        ["PUT", "event-registrations/participant/1/start-number"],
        ["PUT", "squadrons/1"], ["DELETE", "squadrons/1"],
    ]) {
        for (const authenticated of [false, true]) {
            const response = await fetch(`${baseUrl}/api/${path}`, {
                method, headers: authenticated ? { Authorization: `Bearer ${token}` } : {},
            });
            assert.equal(response.status, authenticated ? 403 : 401, `${method} ${path}`);
        }
    }
});

test("registrations, invoices and bookings respect ownership and recover from invalid bookings", async () => {
    const owner = await User.findOne({ where: { email: "owner@example.com" } });
    const other = await User.findOne({ where: { email: "other@example.com" } });
    const person = await Person.findOne({ where: { owner_id: owner.id } });
    const event = await Event.create({ name: "Test event" });
    const registration = await EventRegistration.create({ event_id: event.id, registered_by_person_id: person.id });
    const invoice = await Invoice.create({ rechnungs_nr: "TEST-1", id_person: person.id, betrag_gesamt: 10 });
    const ownerToken = jwt.sign({ user: { id: owner.id, role: "user" } }, process.env.JWT_SECRET);
    const otherToken = jwt.sign({ user: { id: other.id, role: "user" } }, process.env.JWT_SECRET);
    const headers = { Authorization: `Bearer ${ownerToken}`, "Content-Type": "application/json" };
    const otherHeaders = { Authorization: `Bearer ${otherToken}` };
    for (const path of [
        `event-registrations/${registration.id}`, `event-registrations/person/${person.id}`,
        `invoices/${invoice.id_rechnung}`, `invoices/${invoice.id_rechnung}/pdf`,
        `invoices/by-person/${person.id}`, `bookings/by-user/${owner.id}`,
        `bookings/by-registration/${registration.id}`, `bookings/by-registration/${registration.id}/all`,
    ]) {
        assert.equal((await fetch(`${baseUrl}/api/${path}`)).status, 401, path);
        assert.equal((await fetch(`${baseUrl}/api/${path}`, { headers: otherHeaders })).status, 403, path);
    }
    assert.equal((await fetch(`${baseUrl}/api/invoices/${invoice.id_rechnung}`, { headers })).status, 200);
    const ownGroups = await fetch(`${baseUrl}/api/event-registrations/group/event/${event.id}`, { headers });
    assert.deepEqual((await ownGroups.json()).map((group) => group.id), [registration.id]);
    const otherGroups = await fetch(`${baseUrl}/api/event-registrations/group/event/${event.id}`, { headers: otherHeaders });
    assert.deepEqual(await otherGroups.json(), []);
    const accommodation = await Accommodation.create({ name: "Test", street: "Test", postal_code: "12345", city: "Test", country: "DE" });
    const occupancy = await Occupancy.create({ event_id: event.id, accommodation_id: accommodation.id, single_rooms_total: 2 });
    const bookingBody = { event_registration_id: registration.id, accommodation_id: accommodation.id, single_beds: "1" };
    const invalid = await fetch(`${baseUrl}/api/bookings`, { method: "POST", headers, body: JSON.stringify({ ...bookingBody, single_beds: -1 }) });
    assert.equal(invalid.status, 400);
    const created = await fetch(`${baseUrl}/api/bookings`, { method: "POST", headers, body: JSON.stringify(bookingBody) });
    assert.equal(created.status, 201);
    const booking = await created.json();
    await occupancy.reload();
    assert.equal(occupancy.single_rooms_booked, 1);
    const adminToken = jwt.sign({ user: { id: owner.id, role: "admin" } }, process.env.JWT_SECRET);
    const assign = (assignments) => fetch(`${baseUrl}/api/occupancies/updateAssignments`, {
        method: "POST", headers: { ...headers, Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ event_id: event.id, assignments }),
    });
    assert.equal((await assign([{ accommodation_id: accommodation.id }])).status, 200);
    await occupancy.reload();
    assert.equal(occupancy.single_rooms_booked, 1);
    assert.equal((await assign([])).status, 409);
    const deleteRegistration = await fetch(`${baseUrl}/api/event-registrations/${registration.id}`, { method: "DELETE", headers });
    assert.equal(deleteRegistration.status, 409);
    for (const method of ["GET", "PUT", "DELETE"]) {
        assert.equal((await fetch(`${baseUrl}/api/bookings/${booking.id}`, { method, headers: otherHeaders })).status, 403);
    }
    const tooMany = await fetch(`${baseUrl}/api/bookings/${booking.id}`, { method: "PUT", headers, body: JSON.stringify({ single_beds: 3 }) });
    assert.equal(tooMany.status, 400);
    const deleted = await fetch(`${baseUrl}/api/bookings/${booking.id}`, { method: "DELETE", headers });
    assert.equal(deleted.status, 200);
    await occupancy.reload();
    assert.equal(occupancy.single_rooms_booked, 0);
});

test("orders validate every item and create invoices atomically", async (context) => {
    const owner = await User.findOne({ where: { email: "owner@example.com" } });
    const token = jwt.sign({ user: { id: owner.id, role: "user" } }, process.env.JWT_SECRET);
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
    const product = await Product.create({ produkt_name: "Test product", preis: 12.34 });
    const order = (items) => fetch(`${baseUrl}/api/invoices/from-products`, {
        method: "POST", headers, body: JSON.stringify({ id_person: owner.person_id, items }),
    });
    const initialCount = await Invoice.count();
    for (const menge of [-1, 0, 1.5]) {
        assert.equal((await order([{ id_produkt: product.id_produkt, menge }])).status, 400);
    }
    assert.equal((await order([{ id_produkt: product.id_produkt }, { id_produkt: product.id_produkt }])).status, 400);
    assert.equal((await order([{ id_produkt: require("node:crypto").randomUUID() }])).status, 400);
    assert.equal(await Invoice.count(), initialCount);
    const response = await order([{ id_produkt: product.id_produkt, menge: 3 }]);
    assert.equal(response.status, 201);
    const result = await response.json();
    assert.equal(result.total, 37.02);
    assert.equal(Number(result.invoice.betrag_gesamt), 37.02);
    const relation = await RelInvoiceProduct.findOne({ where: { id_rechnung: result.invoice.id_rechnung } });
    assert.equal(relation.menge, 3);
    const failure = context.mock.method(RelInvoiceProduct, "bulkCreate", async () => { throw new Error("simulated write failure"); });
    assert.equal((await order([{ id_produkt: product.id_produkt }])).status, 500);
    failure.mock.restore();
    assert.equal(await Invoice.count(), initialCount + 1);
});

test("refresh tokens rotate uniquely and cannot be reused", async () => {
    const user = await User.findOne({ where: { email: "owner@example.com" } });
    await user.update({ is_verified: true, password_hash: await require("bcrypt").hash("test-password", 4) });
    const post = (path, body) => fetch(`${baseUrl}/api/auth/${path}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    const login = await post("login", { email: user.email, password: "test-password" });
    assert.equal(login.status, 200);
    const initial = await login.json();
    const refreshed = await post("refresh-token", { token: initial.refreshToken });
    assert.equal(refreshed.status, 200);
    const rotated = await refreshed.json();
    assert.notEqual(rotated.refreshToken, initial.refreshToken);
    assert.notEqual(jwt.decode(rotated.refreshToken).jti, jwt.decode(initial.refreshToken).jti);
    assert.equal((await post("refresh-token", { token: initial.refreshToken })).status, 403);
    assert.equal((await post("logout", { token: rotated.refreshToken })).status, 200);
    assert.equal((await post("refresh-token", { token: rotated.refreshToken })).status, 403);
});

test("squadron queries load their declared associations", async () => {
    const token = jwt.sign({ user: { id: "test-admin", role: "admin" } }, process.env.JWT_SECRET);
    const headers = { Authorization: `Bearer ${token}` };
    for (const path of ["squadrons", "rel-person-squadron"]) {
        const response = await fetch(`${baseUrl}/api/${path}`, { headers });
        assert.equal(response.status, 200, path);
        assert.ok(Array.isArray(await response.json()));
    }
});

test("occupancy schema accepts room fields and rejects negative or manually booked counts", () => {
    const schema = require("../validators/occupancyValidator");
    const ids = { accommodation_id: require("node:crypto").randomUUID(), event_id: require("node:crypto").randomUUID() };
    assert.equal(schema.validate({ ...ids, single_rooms_total: 2 }).error, undefined);
    assert.ok(schema.validate({ ...ids, single_rooms_total: -1 }).error);
    assert.ok(schema.validate({ ...ids, single_rooms_booked: 0 }).error);
});

test("customers can cancel only their own unpaid invoices", async () => {
    const owner = await User.findOne({ where: { email: "owner@example.com" } });
    const other = await User.findOne({ where: { email: "other@example.com" } });
    const invoice = await Invoice.create({ rechnungs_nr: "CANCEL-1", id_person: owner.person_id, betrag_gesamt: 10 });
    const cancel = (user) => fetch(`${baseUrl}/api/invoices/${invoice.id_rechnung}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${jwt.sign({ user: { id: user.id, role: "user" } }, process.env.JWT_SECRET)}` },
    });
    assert.equal((await cancel(other)).status, 403);
    await invoice.update({ ist_bezahlt: true });
    assert.equal((await cancel(owner)).status, 409);
    await invoice.update({ ist_bezahlt: false });
    assert.equal((await cancel(owner)).status, 200);
});

test("participants can be removed only by the registration owner", async () => {
    const owner = await User.findOne({ where: { email: "owner@example.com" } });
    const event = await Event.create({ name: "Participant test" });
    const headers = { Authorization: `Bearer ${jwt.sign({ user: { id: owner.id, role: "user" } }, process.env.JWT_SECRET)}`, "Content-Type": "application/json" };
    const created = await fetch(`${baseUrl}/api/event-registrations/group`, {
        method: "POST", headers, body: JSON.stringify({
            event_id: event.id, registered_by_person_id: owner.person_id,
            participants: [{ person_id: owner.person_id }],
        }),
    });
    assert.equal(created.status, 201);
    const { registration } = await created.json();
    const { EventRegistrationParticipant } = require("../models");
    const participant = await EventRegistrationParticipant.findOne({ where: { registration_id: registration.id } });
    assert.ok(participant.start_number > 0);
    const otherHeaders = { Authorization: `Bearer ${jwt.sign({ user: { id: "other", role: "user" } }, process.env.JWT_SECRET)}` };
    const url = `${baseUrl}/api/event-registrations/participant/${participant.id}`;
    assert.equal((await fetch(url, { method: "DELETE", headers: otherHeaders })).status, 403);
    assert.equal((await fetch(url, { method: "DELETE", headers })).status, 200);
    assert.equal(await EventRegistrationParticipant.findByPk(participant.id), null);
});