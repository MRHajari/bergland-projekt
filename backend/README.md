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
├── config/
│   ├── db.js                    # Sequelize DB-Konfiguration (SQLite)
│   └── mail.js                  # Mailtrap / SMTP Setup (optional)
│
├── controllers/                 # 🎯 Business-Logik / API-Controller
│   ├── accommodationController.js
│   ├── addressController.js
│   ├── authController.js
│   ├── bookingController.js
│   ├── eventController.js
│   ├── eventRegistrationController.js
│   ├── invoiceController.js
│   ├── personController.js
│   ├── productController.js
│   ├── relayTeamController.js
│   ├── relPersonAddressController.js
│   ├── routeController.js
│   ├── runtimeController.js
│   ├── squadronController.js
│   ├── tokenController.js
│   ├── userController.js
│   ├── userRegistrationController.js
│   └── occupancyController.js       # 🏨 Belegung zwischen Unterkunft & Event
│
├── models/                     # 🧩 Sequelize Models (Datenbanktabellen)
│   ├── accommodation.js        # Unterkunft
│   ├── address.js              # Adresse
│   ├── booking.js              # Buchung (Person + Unterkunft + Event)
│   ├── event.js                # Event (Name, Datum, Beschreibung …)
│   ├── eventRegistration.js    # Anmeldung (Person ↔ Event)
│   ├── invoice.js              # Rechnung
│   ├── occupancy.js            # Belegung (Unterkunft ↔ Event)
│   ├── person.js               # Personendaten
│   ├── product.js              # Produkt (Startgebühr, T-Shirt …)
│   ├── relay_team.js           # Lauftag (Datum, Event, Strecke)
│   ├── rel_person_address.js   # Verbindung Person ↔ Adresse
│   ├── route.js                # Strecke / Route (Distanz, Schwierigkeit)
│   ├── runtime.js              # Laufzeit pro Teilnehmer
│   ├── squadron.js             # Staffel-Team
│   ├── token.js                # JWT / Auth Tokens
│   ├── user.js                 # Login-Benutzer
│   ├── userRegistration.js     # Registrierung für die App
│   └── index.js                # 🔗 Beziehungen aller Models (Associations)
│
├── routes/                     # 🚏 API-Endpunkte
│   ├── accommodationRoutes.js
│   ├── addressRoutes.js
│   ├── authRoutes.js
│   ├── bookingRoutes.js
│   ├── eventRoutes.js
│   ├── eventRegistrationRoutes.js
│   ├── invoiceRoutes.js
│   ├── occupancyRoutes.js
│   ├── personRoutes.js
│   ├── productRoutes.js
│   ├── relayTeamRoutes.js
│   ├── relPersonAddressRoutes.js
│   ├── routeRoutes.js
│   ├── runtimeRoutes.js
│   ├── squadronRoutes.js
│   ├── tokenRoutes.js
│   ├── userRoutes.js
│   └── userRegistrationRoutes.js
│
├── validators/                 # ✅ Express-Validator-Logik (Request Validation)
│   ├── authValidator.js
│   ├── bookingValidator.js
│   ├── eventValidator.js
│   ├── eventRegistrationValidator.js
│   ├── invoiceValidator.js
│   ├── personValidator.js
│   ├── productValidator.js
│   └── routeValidator.js
│
├── db/
│   └── database.sqlite         # SQLite Datenbank (lokal gespeichert)
│
├── .env                        # Umgebungsvariablen (z. B. PORT, JWT_SECRET, DB_PATH)
├── package.json
├── seed.js                     # 🌱 Initiales Seeding (Personen, Events, Buchungen usw.)
├── server.js                   # 🚀 Express App – startet Server & lädt Routes
└── README.md                   # Projektdokumentation




# Dependencies installieren
npm install

# Entwicklung (mit automatischem Seeding)
NODE_ENV=development node server.js

# Produktion
NODE_ENV=production node server.js


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


# Abhängigkeiten installieren
npm install

# Dev-Server starten
ng serve --open

# Build für Produktion
ng build --configuration production
