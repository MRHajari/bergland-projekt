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
│   └── mail.js                   # Mailtrap / SMTP Config
│
├── controllers/                  # Business-Logik (CRUD, Auth etc.)
│   ├── accommodationController.js
│   ├── addressController.js
│   ├── authController.js              # ✅ Login / Verify / Logout / Refresh
│   ├── bookingController.js
│   ├── eventController.js
│   ├── eventRegistrationController.js # ✅ Event-Anmeldung (Person ↔ Event)
│   ├── invoiceController.js
│   ├── personController.js
│   ├── productController.js
│   ├── relayTeamController.js
│   ├── routeController.js
│   ├── runtimeController.js
│   ├── tokenController.js
│   ├── userController.js              # ✅ CRUD für App-User
│   └── userRegistrationController.js  # ✅ Registrierung (Signup)
│
├── middleware/
│   └── authMiddleware.js          # ✅ JWT-Authentifizierung & Admin-Check
│
├── models/                        # Sequelize Models
│   ├── index.js                   # Beziehungen & Exporte
│   ├── person.js                  # Personen-Stammdaten
│   ├── user.js                    # ✅ App-Benutzer mit Rolle & Login
│   ├── userRegistration.js        # ✅ App-Registrierung
│   ├── address.js
│   ├── rel_person_address.js      # ✅ n:m Verbindung Person ↔ Address
│   ├── accommodation.js
│   ├── booking.js
│   ├── event.js
│   ├── eventRegistration.js       # ✅ Anmeldung zu Events
│   ├── relay_team.js
│   ├── route.js
│   ├── runtime.js
│   ├── invoice.js
│   ├── product.js
│   └── token.js
│
├── routes/                        # Express Router
│   ├── accommodationRoutes.js
│   ├── addressRoutes.js
│   ├── authRoutes.js
│   ├── bookingRoutes.js
│   ├── eventRoutes.js
│   ├── eventRegistrationRoutes.js
│   ├── invoiceRoutes.js
│   ├── personRoutes.js
│   ├── productRoutes.js
│   ├── relayTeamRoutes.js
│   ├── routeRoutes.js
│   ├── runtimeRoutes.js
│   ├── tokenRoutes.js
│   ├── userRoutes.js
│   └── userRegistrationRoutes.js
│
├── validators/                    # Joi Validierungen
│   ├── accommodationValidator.js
│   ├── addressValidator.js
│   ├── authValidator.js
│   ├── bookingValidator.js
│   ├── eventValidator.js
│   ├── eventRegistrationValidator.js
│   ├── invoiceValidator.js
│   ├── personValidator.js
│   ├── productValidator.js
│   ├── relayTeamValidator.js
│   ├── routeValidator.js
│   ├── runtimeValidator.js
│   ├── userValidator.js
│   └── userRegistrationValidator.js
│
├── db/
│   └── database.sqlite            # Lokale SQLite-Datenbank
│
├── seed.js                        # Datenbank-Seeding (Personen, Events, usw.)
├── server.js                      # Express-Startpunkt (mit ensureAdminUser)
├── .env                           # ENV-Variablen (z. B. DB_PATH, JWT_SECRET)
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