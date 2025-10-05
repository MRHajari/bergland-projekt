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
│── config/ # DB-Verbindung (Sequelize)
│ └── db.js
│  └── config.js
│
│── db/
│ └── database.sqlite
│
│── controllers/ # Business-Logik (CRUD + Auth)
│ ├── accommodationController.js
│ ├── addressController.js
│ ├── authController.js
│ ├── bookingController.js
│ ├── eventController.js
│ ├── invoiceController.js
│ ├── loginDataController.js
│ ├── paymentController.js
│ ├── paymentIntegrationController.js
│ ├── personController.js
│ ├── productController.js
│ ├── registrationController.js
│ ├── relayTeamController.js
│ ├── routeController.js
│ └── runtimeController.js
│
│── migrations/seeders 
│ ├── ----.js
│ └── ----.js
│
│── middlewares/ # Middleware (z. B. Error Handling, Auth)
│ ├── authMiddleware.js
│ └── errorMiddleware.js
│
│── models/ # Sequelize-Models
│ ├── accommodation.js
│ ├── address.js
│ ├── booking.js
│ ├── event.js
│ ├── index.js
│ ├── invoice.js
│ ├── loginData.js
│ ├── payment.js
│ ├── person.js
│ ├── product.js
│ ├── registration.js
│ ├── relayTeam.js
│ ├── route.js
│ └── runtime.js
│
│── routes/ # Express-Routen (mit den Controllern verknüpft)
│ ├── accommodationRoutes.js
│ ├── addressRoutes.js
│ ├── authRoutes.js
│ ├── bookingRoutes.js
│ ├── eventRoutes.js
│ ├── invoiceRoutes.js
│ ├── loginDataRoutes.js
│ ├── paymentIntegrationRoutes.js
│ ├── paymentRoutes.js
│ ├── personRoutes.js
│ ├── productRoutes.js
│ ├── registrationRoutes.js
│ ├── relayTeamRoutes.js
│ ├── routeRoutes.js
│ └── runtimeRoutes.js
│
│── validators/ # Joi-Schemas für Validation
│ ├── accommodationValidator.js
│ ├── addressValidator.js
│ ├── bookingValidator.js
│ ├── eventValidator.js
│ ├── invoiceValidator.js
│ ├── loginDataValidator.js
│ ├── paymentValidator.js
│ ├── personValidator.js
│ ├── productValidator.js
│ ├── registrationValidator.js
│ ├── relayTeamValidator.js
│ ├── routeValidator.js
│ └── runtimeValidator.js
│
│── .env # Environment Variablen
│── package.json # NPM Dependencies + Scripts
│── server.js # Einstiegspunkt für Express Server



#### Development starten
npm run dev


## ⚙️ Installation & Setup

### 1. Repository klonen
```bash
git clone <repo-url>
cd backend