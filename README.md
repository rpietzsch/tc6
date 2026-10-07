# TC-Werkstatt Klasse 6

Niederschwelliges Lernportal zum Computer-Teil des sächsischen Lehrplans Technik/Computer (Gymnasium, Klasse 6). Eine statische Seite ohne Build und ohne Bibliotheken, gedacht zum Selbstlernen.

## Inhalt

- 13 Arbeitsblätter in 5 Gruppen: Computer verstehen, Dokumente gestalten, Internet und Kommunikation, Codieren und Programmieren, Abschluss.
- 19 interaktive Übungen (Quiz, Zuordnen, Reihenfolge) und 58 abhakbare Praxisaufgaben.
- Ein Morse-Übersetzer mit Ton und ein Probier-Minicomputer.
- Der Lernfortschritt wird im Browser gespeichert (`localStorage`), nicht auf einem Server.

Grundlage ist Lernbereich 1 „Grundlagen im Umgang mit digitalen Medien“ sowie die Wahlbereiche 3, 5 und 6; siehe [`docs/lehrplan-auszug.md`](docs/lehrplan-auszug.md).

## Ausprobieren

`portal/index.html` im Browser öffnen. Es ist keine Installation nötig.

## Aufbau

| Pfad | Inhalt |
|---|---|
| `portal/` | Die Seite (`index.html`) |
| `docs/` | Lehrplanauszug, Recherche, Linkprüfung, Formatvorschlag für Markdown-Kapitel |
| `tests/` | Smoke-Test für Speichern und Zurücksetzen (Playwright) |
| `HANDOFF.md` | Stand, offene Entscheidungen und Plan |
| `CLAUDE.md` | Arbeitsregeln für Claude Code |

## Test

```
npm i playwright && npx playwright install chromium
node tests/smoke-reset.js portal/index.html
```

Erwartet wird am Ende `errors []` und `0 von 77 Aufgaben`.

## Status

In Arbeit. Lizenz und Impressum sind noch nicht festgelegt; siehe „Offene Entscheidungen“ in [`HANDOFF.md`](HANDOFF.md).
