# TC-Werkstatt Klasse 6

Niederschwelliges Lernportal zum Computer-Teil des sächsischen Lehrplans Technik/Computer (Gymnasium, Klasse 6). Eine statische Seite ohne Build, gedacht zum Selbstlernen. Die Inhalte stehen als Markdown-Dateien und lassen sich direkt auf GitHub bearbeiten, siehe [CONTRIBUTING.md](CONTRIBUTING.md).

## Inhalt

- 13 Arbeitsblätter in 5 Gruppen: Computer verstehen, Dokumente gestalten, Internet und Kommunikation, Codieren und Programmieren, Abschluss.
- 19 interaktive Übungen (Quiz, Zuordnen, Reihenfolge) und 58 abhakbare Praxisaufgaben.
- Ein Morse-Übersetzer mit Ton und ein Probier-Minicomputer.
- Der Lernfortschritt wird im Browser gespeichert (`localStorage`), nicht auf einem Server.

Grundlage ist Lernbereich 1 „Grundlagen im Umgang mit digitalen Medien“ sowie die Wahlbereiche 3, 5 und 6; siehe [`docs/lehrplan-auszug.md`](docs/lehrplan-auszug.md).

## Ausprobieren

Online: https://rpietzsch.github.io/tc6/

Lokal, im Ordner `portal`:

```
python3 -m http.server 8000
```

Dann `http://localhost:8000` öffnen. Die Seite lädt ihre Kapitel nach und läuft deshalb nicht per Doppelklick auf `index.html`.

## Aufbau

| Pfad | Inhalt |
|---|---|
| `portal/` | Die Seite: `index.html`, `assets/` (CSS, JavaScript, Schriften), `kapitel/` (Inhalte als Markdown), `bilder/` |
| `docs/` | Format der Kapitel, Lehrplanauszug, Recherche, Linkprüfung |
| `tests/` | Prüfskript für die Kapitel und Rauchtest im Browser (Playwright) |
| `HANDOFF.md` | Stand, offene Entscheidungen und Plan |
| `CLAUDE.md` | Arbeitsregeln für Claude Code |

## Test

```
node tests/validate-kapitel.js        # Format der Kapitel, ohne Installation
npm install && npx playwright install chromium
node tests/smoke-reset.js             # Rauchtest im Browser
```

Beides läuft auch bei jedem Pull Request (GitHub Actions) und vor jeder Veröffentlichung.

## Status

In Arbeit. Stand, Entscheidungen und Plan stehen in [`HANDOFF.md`](HANDOFF.md).

## Lizenz

[MIT](LICENSE). Die Schriften unter `portal/assets/fonts/` stehen unter der SIL Open Font License, `marked` unter der MIT-Lizenz (siehe `portal/assets/vendor/`). Die Bilder unter `portal/bilder/` stammen überwiegend von Wikimedia Commons und stehen unter den Lizenzen, die in `portal/bilder/nachweis.json` und im „Bildnachweis“ der Blätter genannt sind; eigene Zeichnungen stehen unter MIT. Der Lehrplanauszug in `docs/lehrplan-auszug.md` stammt aus einer amtlichen Quelle und ist davon ausgenommen.
