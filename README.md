# Marktfinder (Von Justin Hornberger und Jonas Wolff)

Frontend für eine regionale Angebots-App, gebaut mit
**Vite + React + TypeScript**. Kein Backend — alle Daten sind als Mock-Daten
eingebaut, damit der Fokus auf dem Frontend liegt.

## Features

- 🔎 **Suche & Filter** nach Stadt, Kategorie und Text
- 📊 **Sortierung** nach Relevanz, Rabatt, Enddatum oder Preis
- 🗺️ **Angebotskarten** mit Marktlogo, Entfernung, Rabattbadge und Live-Countdown
- 🪟 **Detailansicht** beim Klick mit:
  - Sekundengenauem Countdown bis zum Aktionsende
  - Fortschrittsbalken (Wie weit ist die Aktion schon gelaufen?)
  - SVG-Preisverlauf der letzten Wochen (mit Tiefstpreis-Hinweis)
  - Statistiken: Aufrufe, Merken, frühere Kampagnen, Preisrange
  - Ähnliche Angebote aus derselben Kategorie
- ❤️ **Favoriten**, die im LocalStorage gespeichert werden
- 📱 **Responsive** bis hinunter zu mobilen Bildschirmen

## Entwicklung starten

```bash
npm install
npm run dev
```

Danach läuft die App auf http://localhost:5173.

## Skripte

| Skript | Zweck |
| --- | --- |
| `npm run dev` | Dev-Server mit Hot Reload |
| `npm run build` | Typecheck + Produktionsbuild nach `dist/` |
| `npm run preview` | Build lokal anschauen |
| `npm run typecheck` | Nur TypeScript prüfen |

## Projektstruktur

```
src/
├── App.tsx                 Haupt-Layout, State, Routing
├── main.tsx                React-Entry
├── styles.css              Design-System (CSS Custom Properties)
├── types.ts                Offer / Store / PricePoint Types
├── data/offers.ts          Mock-Angebote 
├── utils/format.ts         Formatter (EUR, Datum, Countdown)
└── components/
    ├── Header.tsx          Suche + Stadt + Navigation
    ├── FilterBar.tsx       Kategorie-Chips + Sortierung
    ├── OfferCard.tsx       Karte in der Übersicht
    ├── OfferDetail.tsx     Modal mit Countdown, Chart, Stats
    ├── PriceChart.tsx      SVG-Preisverlauf
    ├── Countdown.tsx       Live-Countdown (kompakt + groß)
    └── StoreBadge.tsx      Mini-Markenlogo
```

Alle Angebote sind statische Beispiele — beim Anbinden einer echten API reicht
es, `src/data/offers.ts` durch einen Fetch-Call zu ersetzen, der `Offer[]`
zurückgibt.


