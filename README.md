# Schul-Cockpit

Persönliche Schul-Zentrale für die Oberstufe: Aufgabenverwaltung, Fächer, Klausuren, Kalender
und ein automatischer Planer für die tägliche 11–12-Uhr-Arbeitsstunde.

## Starten

Reines HTML/CSS/JavaScript ohne Build-Schritt oder Abhängigkeiten. Ein lokaler Server wird nur
benötigt, damit die ES-Module laden (Browser blockieren `type="module"` unter `file://`):

```bash
python3 -m http.server 8420
```

Dann `http://localhost:8420/` öffnen.

## Struktur

- `index.html` — Einstiegspunkt
- `css/` — Design-Tokens (Light/Dark), Basis-Styles, Layout, Komponenten, View-spezifische Styles
- `js/app.js` — Startpunkt: Store laden, Router registrieren, Sidebar mounten
- `js/store.js` / `js/db.js` — zentraler State + localStorage-Persistenz
- `js/router.js` — Hash-Router
- `js/models/` — Datentypen (Fach, Aufgabe, Teilaufgabe, Klausur, Arbeitseinheit, Einstellungen)
- `js/planner/` — automatischer Tagesplaner (Kernalgorithmus)
- `js/views/` — Seiten
- `js/components/` — wiederverwendbare UI-Bausteine
- `js/seed/` — Beispieldaten für den ersten Start

## Daten

Alle Daten liegen ausschließlich lokal in `localStorage` des Browsers (Schlüssel `schulcockpit:v1`).
Backup/Wiederherstellung über Einstellungen → Daten (JSON-Export/Import).
