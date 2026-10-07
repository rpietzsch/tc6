# TC-Werkstatt Klasse 6

Niederschwelliges Lernportal zum Computer-Teil des sächsischen Lehrplans Technik/Computer (Gymnasium, Klasse 6). Lies zuerst `HANDOFF.md`.

## Regeln

- Sprache der Inhalte: Deutsch, Du-Anrede für das Kind, kurze Sätze, Fachbegriffe wie im Lehrplan (`docs/lehrplan-auszug.md`).
- Statische Seite ohne Build und ohne externe Skripte. Keine neuen Abhängigkeiten ohne Rückfrage.
- Farben nur über die CSS-Tokens auf `:root`; Hell- und Dunkelmodus müssen beide stimmen. Muss bei 400 px Breite ohne Querscrollen funktionieren.
- IDs von Übungen nie ändern (gespeicherter Lernfortschritt hängt daran).
- Externe Links nur aufnehmen, wenn sie geöffnet und geprüft wurden; Status in `docs/links.md` nachtragen.
- Keine Bestätigungsdialoge über `confirm()`; Rückfragen stehen in der Seite.
- Vor dem Veröffentlichen `node tests/smoke-reset.js <pfad>/index.html` laufen lassen.
- Nichts ohne Rückfrage veröffentlichen oder pushen: Sichtbarkeit des Repositorys, Lizenz und Impressum sind Entscheidungen des Nutzers (siehe „Offene Entscheidungen“ in `HANDOFF.md`).
