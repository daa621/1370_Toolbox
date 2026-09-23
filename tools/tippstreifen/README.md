# Tippstreifen 2.0 (Modern UI)

Ein offline-fähiger Browser-Rechner mit Tippstreifen (Classic/Modern), Undo, Reset-Dialog und Druckansicht.

## Neu im UI-Refresh

- Modernes Layout mit Hintergrund
- Light/Dark Mode Schalter (merkt sich die Einstellung in `localStorage`)
- Design-Weiter-Button (10 Skins, merkt sich die Auswahl in `localStorage`)
- Keine Änderungen an der Rechenlogik (`calculator.js` blieb unberührt)

## Installation / Nutzung

- Alles in einen Ordner entpacken
- `index.html` im Browser öffnen (lokal, kein Server, keine externen APIs)

## Tastatur

- Zahlen: `0-9` und `,`
- Operatoren: `+ - * /`
- `Enter` = Ergebniszeile
- `Backspace` = Zeichen löschen
- `Delete` = Reset (mit Rückfrage)

### UI-Schalter

- `Alt + T` = Light/Dark umschalten
- `Alt + D` = Design weiter schalten

## Hinweise

- Keine externen Abhängigkeiten
- Keine Netzwerkaufrufe
- Styling in `styles.css`, Theme-Schalter in `theme.js`, Logik in `calculator.js`
