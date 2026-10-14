# BerglandFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.2.

## Development server

To start a local development server, run:

```bash
npm start
```

npm start -- --host 0.0.0.0 --port 4200

`npm start` uses the local Angular CLI and the API proxy to port 3000.
No global `ng` installation is required. Both environments use `/api`;
production hosting must proxy that path to the backend.
See [the review report](../REVIEW.md) for current verification and limitations.

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
npm run build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Bergland Frontend

Frontend für die **Bergland-App** (Reservierungen, Events, Rechnungen, Zahlungen, usw.),  
entwickelt mit **Angular 20**.

---

## 🚀 Features

- **Angular 20** (Standalone Components, kein `AppModule`)
- **Routing**:
  - **AuthLayout** → Login & Register (ohne Navbar/Header)
  - **MainLayout** → Events, Buchungen, Profil (mit Navbar/Header)
- **JWT Auth**:
  - Login/Logout
  - Guard für geschützte Routen (`authGuard`)
- **Services** (REST-API Calls zu Backend)
- **Layouts**: Navbar, Header, Footer
- **Komponenten**: Login, Register, Events (Startseite), Booking, Profile

---

## 📂 Projektstruktur

frontend/
├── src/
│   ├── app/
│   │   ├── core/                          # 🌐 Zentrale Services, Auth & Utilities
│   │   │   ├── auth.service.ts            # Login, Token, User-ID, Logout
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts
│   │   │   ├── services/                  # API-Services (kommunizieren mit Backend)
│   │   │   │   ├── api.service.ts
│   │   │   │   ├── person.service.ts
│   │   │   │   ├── user.service.ts
│   │   │   │   ├── event.service.ts
│   │   │   │   ├── event-registration.service.ts
│   │   │   │   ├── relay-team.service.ts
│   │   │   │   ├── squadron.service.ts
│   │   │   │   ├── route.service.ts
│   │   │   │   ├── runtime.service.ts
│   │   │   │   ├── accommodation.service.ts
│   │   │   │   ├── booking.service.ts
│   │   │   │   ├── invoice.service.ts
│   │   │   │   ├── product.service.ts
│   │   │   │   ├── address.service.ts
│   │   │   │   └── occupancy.service.ts
│   │   │   └── utils/
│   │   │       └── helpers.ts             # Kleine Hilfsfunktionen
│   │   │
│   │   ├── layouts/                       # 🧭 Layout-Struktur
│   │   │   ├── header/                    # Kopfbereich
│   │   │   │   ├── header.ts
│   │   │   │   ├── header.html
│   │   │   │   └── header.css
│   │   │   ├── navbar/                    # Navigation
│   │   │   │   ├── navbar.ts
│   │   │   │   ├── navbar.html
│   │   │   │   └── navbar.css
│   │   │   └── footer/                    # Fußzeile (optional)
│   │   │       ├── footer.ts
│   │   │       ├── footer.html
│   │   │       └── footer.css
│   │   │
│   │   ├── pages/                         # 📄 Alle Seiten (Standalone Components)
│   │   │   ├── home/                      # Startseite
│   │   │   │   ├── home.ts
│   │   │   │   ├── home.html
│   │   │   │   └── home.css
│   │   │   ├── events/
│   │   │   │   ├── event-list/            # Übersicht aller Events
│   │   │   │   │   ├── event-list.ts
│   │   │   │   │   ├── event-list.html
│   │   │   │   │   └── event-list.css
│   │   │   │   ├── event-registration/    # Detail + Anmeldung
│   │   │   │   │   ├── event-registration.ts
│   │   │   │   │   ├── event-registration.html
│   │   │   │   │   └── event-registration.css
│   │   │   ├── bookings/
│   │   │   │   ├── booking-list/
│   │   │   │   │   ├── booking-list.ts
│   │   │   │   │   ├── booking-list.html
│   │   │   │   │   └── booking-list.css
│   │   │   │   ├── booking-detail/
│   │   │   │   │   ├── booking-detail.ts
│   │   │   │   │   ├── booking-detail.html
│   │   │   │   │   └── booking-detail.css
│   │   │   ├── profile/
│   │   │   │   ├── profile.ts
│   │   │   │   ├── profile.html
│   │   │   │   └── profile.css
│   │   │   ├── admin/
│   │   │   │   ├── users-admin/
│   │   │   │   │   ├── users-admin.ts
│   │   │   │   │   ├── users-admin.html
│   │   │   │   │   └── users-admin.css
│   │   │   │   ├── events-admin/
│   │   │   │   │   ├── events-admin.ts
│   │   │   │   │   ├── events-admin.html
│   │   │   │   │   └── events-admin.css
│   │   │   │   └── products-admin/
│   │   │   │       ├── products-admin.ts
│   │   │   │       ├── products-admin.html
│   │   │   │       └── products-admin.css
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   ├── login.ts
│   │   │   │   │   ├── login.html
│   │   │   │   │   └── login.css
│   │   │   │   ├── register/
│   │   │   │   │   ├── register.ts
│   │   │   │   │   ├── register.html
│   │   │   │   │   └── register.css
│   │   │   │   └── verify-email/
│   │   │   │       ├── verify-email.ts
│   │   │   │       ├── verify-email.html
│   │   │   │       └── verify-email.css
│   │   │   └── not-found/
│   │   │       ├── not-found.ts
│   │   │       ├── not-found.html
│   │   │       └── not-found.css
│   │   │
│   │   ├── shared/                         # ♻️ Wiederverwendbare UI-Elemente
│   │   │   ├── form-field/
│   │   │   │   ├── form-field.ts
│   │   │   │   ├── form-field.html
│   │   │   │   └── form-field.css
│   │   │   ├── button/
│   │   │   │   ├── button.ts
│   │   │   │   ├── button.html
│   │   │   │   └── button.css
│   │   │   └── modal/
│   │   │       ├── modal.ts
│   │   │       ├── modal.html
│   │   │       └── modal.css
│   │   │
│   │   ├── app.routes.ts                   # Angular Routing
│   │   ├── app.config.ts                   # AppConfig (Provider, HttpClient, etc.)
│   │   └── app.ts                          # Hauptkomponente der Anwendung
│   │
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   │       ├── variables.css               # Farb- & Fontvariablen
│   │       └── theme.css
│   │
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   │
│   ├── main.ts                             # Einstiegspunkt
│   └── index.html
│
├── angular.json
├── package.json
├── tsconfig.json
└── README.md

### 1. Dependencies installieren

npm install

#### Services

auth.service.ts → Login / Register / Refresh
person.service.ts → /api/persons
booking.service.ts → /api/bookings
invoice.service.ts → /api/invoices
payment.service.ts → /api/payments
event.service.ts → /api/events
registration.service.ts → /api/registrations
relay-team.service.ts → /api/relay-teams
route.service.ts → /api/routes
product.service.ts → /api/products

##### Example: GET /api/events/:id

{
  "id": "a8c42e6e-3d9f-4e3d-97ff-2b9ac1452e62",
  "name": "Pfälzer Trail Run 2025",
  "description": "10 km Trail-Lauf durch das Pfälzer Bergland mit Start im Zentrum von Kusel.",
  "start_date": "2025-09-14",
  "end_date": "2025-09-14",
  "registration_deadline": "2025-09-07",
  "createdAt": "2025-03-01T10:00:00.000Z",
  "updatedAt": "2025-03-01T10:00:00.000Z",

  "routes": [
    {
      "id": "c9d82253-99d2-4f5c-aaf6-141e1f98d1c9",
      "name": "Pfälzer Hügelrunde",
      "distance_km": 10.0,
      "difficulty": "mittel",
      "description": "Wald- und Feldwege mit leichten Steigungen",
      "event_id": "a8c42e6e-3d9f-4e3d-97ff-2b9ac1452e62"
    }
  ],

  "relay_teams": [
    {
      "id": "f88b7f4c-2e8a-4e8b-b78b-2d4a1b15db3e",
      "name": "Pfälzer Trail Sonntag",
      "run_date": "2025-09-14",
      "standard_start_time": "09:00",
      "route_id": "c9d82253-99d2-4f5c-aaf6-141e1f98d1c9",
      "event_id": "a8c42e6e-3d9f-4e3d-97ff-2b9ac1452e62"
    }
  ],

  "squadrons": [
    {
      "id": "da5f531b-4714-4a44-b75c-c6bb3c244f88",
      "name": "AlpenTeam Pfalz",
      "start_number": "STF-2025-02",
      "members_count": 3,
      "description": "3er-Team auf der 10 km Route",
      "event_id": "a8c42e6e-3d9f-4e3d-97ff-2b9ac1452e62"
    }
  ],

  "occupancies": [
    {
      "id": "ea3a16c1-9db3-4e2f-8af3-8a1e51e6cde9",
      "accommodation_id": "ac4f5c0b-22c3-4a2e-861a-972dd745e17a",
      "event_id": "a8c42e6e-3d9f-4e3d-97ff-2b9ac1452e62",
      "single_rooms": 5,
      "double_rooms": 8,
      "multi_bed_rooms": 2,
      "available_beds": 30
    }
  ],

  "event_registrations": [
    {
      "id": "9d15b0d7-0e2c-4cb3-8e56-d848f0f5f711",
      "person_id": "d7b9e8e5-6c7f-4d92-a97b-d3b82a6c1a44",
      "relay_team_id": "f88b7f4c-2e8a-4e8b-b78b-2d4a1b15db3e",
      "squadron_id": "da5f531b-4714-4a44-b75c-c6bb3c244f88",
      "participation_type": "staffel",
      "wishes": "vegetarisch",
      "liability_accept": true,
      "status": "bestätigt",
      "createdAt": "2025-06-02T09:00:00.000Z"
    },
    {
      "id": "51e5cbd1-f25c-4bb0-953d-4db7e227f4a8",
      "person_id": "aabbcc11-2233-4455-6677-8899ddeeff00",
      "relay_team_id": null,
      "squadron_id": null,
      "participation_type": "einzeln",
      "wishes": "T-Shirt Größe M",
      "liability_accept": true,
      "status": "In Bearbeitung",
      "createdAt": "2025-06-05T12:20:00.000Z"
    }
  ]
}
