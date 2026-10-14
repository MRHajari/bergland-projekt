# Pruefbericht vom 14.10.2026

## Umfang

Erster Code- und Reparaturdurchgang: zuerst die aktiven Express-Routen und
Controller, dann Angular-Dienste, Tests, Build und ausgewaehlte Browserablaeufe.
Kein vollstaendiger Penetrationstest und keine Produktionsfreigabe.
Bestehende Benutzerdaten wurden nicht zurueckgesetzt; Backend-Tests verwenden
eine separate SQLite-Datenbank im Arbeitsspeicher. Vorhandene Server auf den
Ports 3000 und 4200 wurden nicht beendet oder neu gestartet.

## Behoben

- Benutzerverwaltung war ohne Anmeldung erreichbar und lieferte Passwort-Hashes.
- Fehlende Admin-Pruefungen bei Produkten, Unterkuenften, Strecken, Zuordnungen,
  Belegungen, Rechnungsaktionen und Staffelaenderungen.
- Fremdzugriffe auf Personen, Anmeldungen, Buchungen und Rechnungen. Eigene
  unbezahlte Rechnungen bleiben stornierbar; bezahlte Rechnungen sind geschuetzt.
- Ein fehlender Endpunkt zum Entfernen einzelner Teilnehmer.
- Automatische Datenloeschung im Entwicklungsmodus und Zuruecksetzen des
  fest eingebauten Adminpassworts bei jedem Serverstart.
- Offene Buchungs- und Anmeldungstransaktionen bei fruehen Fehlerantworten.
- Zuruecksetzen gebuchter Zimmer beim erneuten Speichern von Zuordnungen.
- Fehlende Bestellmengenpruefung und unvollstaendige Rechnungen bei Schreibfehlern.
  Neue Produktbestellungen rechnen in Cent und speichern Rechnung plus Positionen
  in einer Transaktion.
- Refresh-Tokens konnten innerhalb derselben Sekunde identisch sein; Rotation
  ist nun eindeutig und der Verbrauch des alten Tokens atomar.
- Deaktivierte SMTP-Zertifikatspruefung und Netzwerkzugriff beim Modulimport.
- Unbeabsichtigter Angular-Import im Backend, falsche Staffel-Aliase und veraltete
  Belegungsfelder in der Validierung.
- Frontend-Refresh blockierte wartende Anfragen bei Fehlern und konnte Tokens an
  fremde Origins senden. Beide Faelle sind durch Regressionstests abgedeckt.
- Gemischte localhost/LAN-API-Adressen; aktive Dienste nutzen jetzt `/api`.
- Rechnungs-PDFs wurden ohne Authorization-Header geoeffnet; sie werden jetzt
  ueber HttpClient heruntergeladen.
- Fehlende Login-Guards, kaputte Testprovider, veralteter App-Test und
  TypeScript-Konfiguration fuer Testdateien.

## Verifikation

Aus dem Projektverzeichnis:

```sh
npm --prefix backend test
npm --prefix bergland-frontend test -- --watch=false --browsers=ChromeHeadless
npm --prefix bergland-frontend run build
```

- Backend: 23 bestandene Tests, einschliesslich HTTP-Berechtigungsmatrix,
  Buchungskapazitaet, Transaktionsrollback, Tokenrotation und Teilnehmerverwaltung.
- Frontend: 36 Tests, einschliesslich paralleler Refresh-Anfragen und PDF-Download.
  Die bisherigen Komponententests sind groesstenteils Erzeugungs-/Smoke-Tests,
  keine vollstaendige fachliche Abdeckung.
- Entwicklungs- und Produktionsbuild erfolgreich; keine Editor-Diagnosen.
- Browser: Login auf Desktop-/Mobilgroesse ohne horizontalen Ueberlauf oder
  defekte Bilder; Proxy liefert JSON; leere Buchungsliste wird korrekt angezeigt.
- Nicht durchgefuehrt: echter SMTP-Versand, Stripe-Zahlungen, Lasttests,
  vollstaendige End-to-End-Tests und Tests gegen MySQL/PostgreSQL.

## Vor Produktivbetrieb Offen

1. Vorhandene Demo-Administratoren und bekannte Passwoerter ersetzen. Die
   Korrektur des Startpfads aendert bestehende Konten absichtlich nicht.
2. Rechnungspositionen brauchen historische Preis-/Artikel-Snapshots und eine
   abgestimmte Archivierungs-/Stornoregel. PDFs lesen derzeit aktuelle
   Produktpreise; die optionalen Admin-Endpunkte zum Hinzufuegen/Entfernen von
   Positionen aktualisieren die gespeicherte Gesamtsumme noch nicht. Fuer echte
   Rechnungen ist ein separater Datenmodell-/Migrationsschritt erforderlich.
3. Registrierung und Mailversand sind nicht atomar: Scheitert SMTP nach Anlage
   des Kontos, fehlt ein sicherer Verifikationsmail-Wiederholungsablauf.
   Der Verifikationslink ist noch auf localhost:4200 festgelegt.
4. Rate-Limiting, restriktive CORS-/Deployment-Konfiguration, sofortige
   Sperrung bereits ausgestellter Access-Tokens nach Rollenwechsel sowie
   Datenschutz der gemeinsamen Staffel-/Ergebnislisten gesondert absichern.
5. Gleichzeitige Buchungen, Vergabe von Startnummern, Anmeldeschluss und
   Loeschkaskaden mit realistischen Fachszenarien/Last pruefen. Die Tests decken
   keine parallelen Schreiblasten oder alle administrativen Loeschpfade ab.
6. Stripe-/Cart-Code und weitere Legacy-Routen sind nicht vollstaendig in die
   aktive Anwendung eingebunden. Nicht ungeprueft nachtraeglich registrieren.
7. `npm audit` scheitert an der konfigurierten Nexus-Registry mit HTTP 400,
   weil dort die Audit-Unterstuetzung fehlt. Keine Aussage zur Freiheit von
   bekannten Abhaengigkeitsluecken; keine erzwungenen Paketupdates ausgefuehrt.
8. Der Angular-Build meldet weiterhin Bundle-/CSS-Budgetwarnungen und
   CommonJS-Abhaengigkeiten aus dem PDF-Stack. Das Initialbundle liegt bei
   etwa 741 kB; die Budgetgrenzen wurden nicht zur Unterdrueckung angehoben.

## Lokal Weiterarbeiten

Backend: `npm --prefix backend start`. Einen bereits laufenden Backendprozess
neu starten, damit er die Aenderungen uebernimmt. Optional legen `ADMIN_EMAIL`
und `ADMIN_PASSWORD` beim ersten Start einen neuen Administrator an; mindestens
12 Passwortzeichen, kein Ueberschreiben bestehender Konten.

Frontend: `npm --prefix bergland-frontend start -- --port 4201`.
Die globale Angular-CLI ist nicht notwendig. Der Entwicklungsproxy erwartet
das Backend auf Port 3000. Produktiv muss der Webserver `/api` zum Backend
weiterleiten und Angular-Routen auf die index.html zurueckfallen lassen.

Der waehrend der Pruefung gestartete Frontendserver ist unter
<http://127.0.0.1:4201> erreichbar. Browserpruefungen verwenden den vorhandenen
Backendprozess; die geaenderten Backendpfade wurden separat in den Tests geprueft.
