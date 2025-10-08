# Bergland Backend

Backend-API für die **Bergland-App** (Reservierung, Events, Rechnungen, Zahlungen, etc.).

---

## 🚀 Features

- Node.js + Express REST API
- Sequelize ORM mit SQLite (einfach für lokale Entwicklung)
- Vollständige Datenbank-Modelle:
  - Person, Address, LoginData
  - Accommodation, Booking
  - Event, Registration, Runtime, RelayTeam, Route
  - Invoice, Payment, Product
- Authentifizierung & Autorisierung mit **JWT** (Access + Refresh Tokens)
- Eingabevalidierung mit **Joi**
- Globale Error-Handling Middleware
- Stripe-Integration vorbereitet (`paymentIntegrationController`)
- Seeder (`seed.js`) für Dummy-Daten in der Datenbank
- Entwicklermodus mit **nodemon**

---

## 📂 Projektstruktur
backend/
│
├── config/
│   ├── db.js                     # Sequelize-DB-Verbindung
│   └── mail.js                   # Mailtrap / SMTP Config (optional)
│
├── controllers/                  # Business-Logik
│   ├── personController.js
│   ├── userController.js              # ✅ neu – CRUD für App-User
│   ├── userRegistrationController.js  # ✅ neu – Registrierung (Signup)
│   ├── authController.js              # ✅ Login / JWT / Verify / Logout
│   ├── accommodationController.js
│   ├── bookingController.js
│   ├── eventController.js
│   ├── eventRegistrationController.js # ✅ Event-Anmeldung (Person ↔ Event)
│   ├── relayTeamController.js
│   ├── routeController.js
│   ├── runtimeController.js
│   ├── invoiceController.js
│   ├── productController.js
│   └── tokenController.js
│
├── models/                       # Sequelize Models
│   ├── index.js                  # Beziehungen & Export
│   ├── person.js                 # Personendaten (ohne Passwort)
│   ├── user.js                   # ✅ App-Benutzer mit Passwort & Rolle
│   ├── userRegistration.js       # ✅ Registrierung im App-System
│   ├── address.js
│   ├── login_data.js             # ⚠️ optional (Legacy, kann später entfernt werden)
│   ├── accommodation.js
│   ├── booking.js
│   ├── event.js
│   ├── eventRegistration.js      # ✅ Anmeldung zu Events
│   ├── relay_team.js
│   ├── route.js
│   ├── runtime.js
│   ├── invoice.js
│   ├── product.js
│   └── token.js
│
├── routes/                       # Express Router
│   ├── personRoutes.js
│   ├── userRoutes.js                 # ✅ neu – CRUD für User
│   ├── userRegistrationRoutes.js     # ✅ neu – Registrierung (Signup)
│   ├── authRoutes.js                 # ✅ Login / Logout / Verify
│   ├── accommodationRoutes.js
│   ├── bookingRoutes.js
│   ├── eventRoutes.js
│   ├── eventRegistrationRoutes.js    # ✅ Event-Anmeldung
│   ├── relayTeamRoutes.js
│   ├── routeRoutes.js
│   ├── runtimeRoutes.js
│   ├── invoiceRoutes.js
│   ├── productRoutes.js
│   └── tokenRoutes.js
│
├── validators/                   # Joi-Validierungen
│   ├── personValidator.js
│   ├── userValidator.js              # ✅ neu – Validierung für User
│   ├── userRegistrationValidator.js  # ✅ neu – Validierung für Registrierung
│   ├── authValidator.js              # ✅ neu – Login / Passwort-Reset
│   ├── accommodationValidator.js
│   ├── bookingValidator.js
│   ├── eventValidator.js
│   ├── eventRegistrationValidator.js # ✅ Anmeldung zu Events
│   ├── relayTeamValidator.js
│   ├── routeValidator.js
│   ├── runtimeValidator.js
│   ├── invoiceValidator.js
│   └── productValidator.js
│
├── db/
│   └── database.sqlite              # Lokale SQLite-Datei
│
├── seed.js                          # Beispiel-Daten (Personen, Events, usw.)
├── server.js                        # Express-Startpunkt (mit ensureAdminUser)
├── .env                             # DB-Pfad, Mailtrap-Credentials etc.
└── package.json


#### Development starten
npm run dev


## ⚙️ Installation & Setup

### 1. Repository klonen
```bash
git clone <repo-url>
cd backend


##### seed
db/database.sqlite
rm db/database.sqlite
node seed.js