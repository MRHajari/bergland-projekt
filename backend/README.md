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
├── config/                  # DB-Konfiguration (Sequelize)
│   ├── db.js
│   └── config.js
│
├── db/                      # SQLite-Datenbank
│   └── database.sqlite
│
├── controllers/             # Business-Logik (CRUD + Auth)
│   ├── accommodationController.js
│   ├── addressController.js
│   ├── authController.js
│   ├── bookingController.js
│   ├── eventController.js
│   ├── invoiceController.js
│   ├── loginDataController.js
│   ├── paymentController.js
│   ├── paymentIntegrationController.js
│   ├── personController.js
│   ├── productController.js
│   ├── registrationController.js
│   ├── relayTeamController.js
│   ├── routeController.js
│   └── runtimeController.js
│
├── middlewares/             # Globale Middleware (Auth, Error Handling)
│   ├── authMiddleware.js
│   └── errorMiddleware.js
│
├── models/                  # Sequelize-Modelle
│   ├── accommodation.js
│   ├── address.js
│   ├── booking.js
│   ├── event.js
│   ├── index.js
│   ├── invoice.js
│   ├── loginData.js
│   ├── payment.js
│   ├── person.js
│   ├── product.js
│   ├── registration.js
│   ├── relayTeam.js
│   ├── route.js
│   └── runtime.js
│
├── routes/                  # Express-Routen (mit Controllern verknüpft)
│   ├── accommodationRoutes.js
│   ├── addressRoutes.js
│   ├── authRoutes.js
│   ├── bookingRoutes.js
│   ├── eventRoutes.js
│   ├── invoiceRoutes.js
│   ├── loginDataRoutes.js
│   ├── paymentIntegrationRoutes.js
│   ├── paymentRoutes.js
│   ├── personRoutes.js
│   ├── productRoutes.js
│   ├── registrationRoutes.js
│   ├── relayTeamRoutes.js
│   ├── routeRoutes.js
│   └── runtimeRoutes.js
│
├── validators/              # Eingabevalidierung (Joi-Schemas)
│   ├── accommodationValidator.js
│   ├── addressValidator.js
│   ├── bookingValidator.js
│   ├── eventValidator.js
│   ├── invoiceValidator.js
│   ├── loginDataValidator.js
│   ├── paymentValidator.js
│   ├── personValidator.js
│   ├── productValidator.js
│   ├── registrationValidator.js
│   ├── relayTeamValidator.js
│   ├── routeValidator.js
│   └── runtimeValidator.js
│
├── .env                     # Environment-Variablen (nicht ins Repo pushen!)
├── package.json             # Abhängigkeiten & Scripts
├── server.js                # Einstiegspunkt des Backends
└── seed.js                  # Seeder für Testdaten


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