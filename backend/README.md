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
├── config/                                 # ⚙️ Konfigurationen
│   ├── db.js                               # Sequelize DB-Konfiguration (SQLite)
│   └── config.js                             # 
│
├── controllers/                            # 🎯 Business-Logik / API-Controller
│   ├── accommodationController.js          # Unterkunft
│   ├── addressController.js                # Adresse
│   ├── authController.js                   # Login / Registrierung / JWT
│   ├── bookingController.js                # Buchungen (Person + Unterkunft + Event)
│   ├── eventController.js                  # Events (CRUD, Filter, Deadlines)
│   ├── eventRegistrationController.js      # Event-Anmeldungen (Person ↔ Event)
│   ├── invoiceController.js                # Rechnungen (Erstellung, PDF, Zahlung)
│   ├── occupancyController.js              # Belegung (Unterkunft ↔ Event)
│   ├── personController.js                 # Personenverwaltung
│   ├── productController.js                # Produkte (Startgebühr, T-Shirt, etc.)
│   ├── relayTeamController.js              # Staffel / Teams
│   ├── relPersonAddressController.js       # Verbindung Person ↔ Adresse
│   ├── routeController.js                  # Routen / Strecken
│   ├── runtimeController.js                # Laufzeiten / Ergebnisse
│   ├── squadronController.js               # Gruppen / Teams
│   ├── tokenController.js                  # JWT Refresh Tokens
│   ├── userController.js                   # Benutzerverwaltung (Admin & Teilnehmer)
│   └── userRegistrationController.js       # Registrierung von App-Usern
│
├── models/                                 # 🧩 Sequelize Models (ORM)
│   ├── accommodation.js                    # Unterkunft
│   ├── address.js                          # Adresse
│   ├── booking.js                          # Buchung
│   ├── event.js                            # Event
│   ├── eventRegistration.js                # Anmeldung zu Event
│   ├── invoice.js                          # Rechnung
│   ├── occupancy.js                        # Unterkunft ↔ Event
│   ├── person.js                           # Person
│   ├── product.js                          # Produkt
│   ├── relay_team.js                       # Staffel
│   ├── rel_invoice_product.js              # Verbindung Rechnung ↔ Produkt
│   ├── rel_person_address.js               # Verbindung Person ↔ Adresse
│   ├── route.js                            # Strecke / Route
│   ├── runtime.js                          # Zeitmessung
│   ├── squadron.js                         # Gruppen
│   ├── token.js                            # JWT Tokens
│   ├── user.js                             # Benutzer
│   ├── userRegistration.js                 # Registrierung
│   └── index.js                            # 🔗 Beziehungen zwischen allen Models
│
├── routes/                                 # 🚏 API-Endpunkte (Routing-Ebene)
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
├── validators/                             # ✅ Joi-Validierungen (Input-Prüfung)
│   ├── accommodationValidator.js           # Unterkunft validieren
│   ├── addressValidator.js                 # Adresse
│   ├── authValidator.js                    # Login / Registrierung
│   ├── bookingValidator.js                 # Buchung
│   ├── eventValidator.js                   # Event
│   ├── eventRegistrationValidator.js       # Event-Anmeldung
│   ├── invoiceValidator.js                 # Rechnung
│   ├── occupancyValidator.js               # Belegung
│   ├── personValidator.js                  # Personendaten
│   ├── productValidator.js                 # Produkte
│   ├── relayTeamValidator.js               # Staffel / Team
│   ├── relPersonAddressValidator.js        # Verbindung Person ↔ Adresse
│   ├── routeValidator.js                   # Routen
│   ├── runtimeValidator.js                 # Laufzeiten
│   ├── squadronValidator.js                # Gruppen / Teams
│   ├── tokenValidator.js                   # Tokens (optional)
│   ├── userValidator.js                    # Benutzer (Admin / User)
│   └── userRegistrationValidator.js        # Registrierung von Benutzern
│
├── middlewares/                            # 🧱 Middleware-Schicht
│   ├── authMiddleware.js                   # JWT-Verifikation
│   ├── errorHandler.js                     # Globale Fehlerbehandlung
│   
│
├── db/
│   └── database.sqlite                     # SQLite Datenbank (lokal)
│
├── .env                                    # Umgebungsvariablen (PORT, JWT_SECRET, MAIL, etc.)
├── .gitignore
├── package.json
├── seed.js                                 # 🌱 Initialdaten für Tests / lokale Entwicklung
├── server.js                               # 🚀 Express App – lädt Config, Routes & DB
└── README.md                               # 📘 Projektdokumentation




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


###### Mailtrap
https://mailtrap.io/