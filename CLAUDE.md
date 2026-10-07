# TC-Werkstatt Klasse 6

Niederschwelliges Lernportal zum Computer-Teil des sächsischen Lehrplans Technik/Computer (Gymnasium, Klasse 6). Lies zuerst `HANDOFF.md`.

## Regeln

- Sprache der Inhalte: Deutsch, Du-Anrede für das Kind, kurze Sätze, Fachbegriffe wie im Lehrplan (`docs/lehrplan-auszug.md`).
- Statische Seite ohne Build und ohne externe Anfragen (Skripte, Schriften, Bilder liegen im Repository). Keine neuen Abhängigkeiten ohne Rückfrage; Fremdcode steht in `portal/assets/vendor/README.md`.
- Inhalte stehen als Markdown in `portal/kapitel/` (Format: `docs/markdown-format.md`), nicht im HTML. Die Seite läuft nur über einen Webserver, nicht per `file://`.
- Farben nur über die CSS-Tokens auf `:root`; Hell- und Dunkelmodus müssen beide stimmen. Muss bei 400 px Breite ohne Querscrollen funktionieren.
- IDs von Übungen und Praxisaufgaben nie ändern (gespeicherter Lernfortschritt hängt daran; `tests/ids-stabil.txt` wacht darüber).
- Externe Links nur aufnehmen, wenn sie geöffnet und geprüft wurden; Status in `docs/links.md` nachtragen.
- Keine Bestätigungsdialoge über `confirm()`; Rückfragen stehen in der Seite.
- Vor dem Veröffentlichen `node tests/validate-kapitel.js` und `node tests/smoke-reset.js` laufen lassen (`npm install && npx playwright install chromium` einmalig).
- Nichts ohne Rückfrage veröffentlichen oder pushen: Repository ist öffentlich, Lizenz MIT, kein Impressum (siehe „Entschieden“ in `HANDOFF.md`). Neue Fremdinhalte (Texte, Bilder, Schriften) nur mit passender Lizenz und Rückfrage übernehmen.
