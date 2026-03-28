# Quranisches Arabisch — Lern-App

Eine Lern-App fuer quranisches Arabisch, basierend auf einer sprachbasierten Methodik. Der Lernende arbeitet am konsonantischen Quran-Text ohne Vokalzeichen und erarbeitet sich Wurzeln, Formen und Vokalisierung systematisch.

## Starten

```bash
npm install
npm run dev
```

Oeffne `http://localhost:5173` im Browser.

## Build

```bash
npm run build
```

Die fertige App liegt dann in `dist/`.

## Module

| Modul | Beschreibung |
|-------|-------------|
| **Modul 1** | Schrift-Trainer — Alphabet, Positionen, Minimalpaare, Sure-1-Test |
| **Modul 2** | Morphologie-Dojo — 24 Morphologie-Lektionen (Stufe 2) + 51 Syntax/Partikel-Lektionen (Stufe 3-4) |
| **Modul 3** | Vers-Werkstatt — Qurantext Vers fuer Vers analysieren (Partikeln, Wurzel, Form, Vokalisierung, Bedeutung, Syntax) |
| **Modul 4** | Wurzel-Notizbuch — Automatisch wachsendes Wurzelverzeichnis mit Lane's-Lexikon-Links |
| **Modul 5** | SRS — Spaced Repetition mit SM-2-Algorithmus, 6 Kartentypen |
| **Modul 6** | Dashboard — Quran-Heatmap, Fortschritt, Streak, SRS-Statistik |
| **Modul 7** | PDF-Export — Leseversion und Forschungsversion des konsonantischen Textes |

## Datenquellen

- **Qurantext:** tanzil.net Simple Clean (114 Suren, 6.236 Verse, nur Konsonanten)
- **Lexikon:** Lane's Lexikon (verlinkt, nicht eingebettet)
- **Audio:** everyayah.com Vers-fuer-Vers-Rezitationen (gestreamt)

## Technologie

- React + Vite
- Lokaler Browser-Speicher (IndexedDB via localforage)
- Kein Backend — alles laeuft im Browser
- PDF-Generierung mit jsPDF + html2canvas
- SHA-256 Integritaetspruefung des Qurantextes beim Start

## Methodik

Der Lernende arbeitet am konsonantischen Text. Vokalzeichen werden als spaetere Notationsschicht vom konsonantischen Grundgeruest unterschieden. Drei Werkzeuge stehen zur Verfuegung: abstrakte Morphologie (die Muster), Lane's Lexikon (die Wurzelbedeutungen), und der Kontext des Konsonantentextes selbst.
