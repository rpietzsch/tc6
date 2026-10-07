# Übergabe: TC-Werkstatt Klasse 6

Stand: 2026-10-07. Übergabe aus einer Claude-Sitzung (Web/App) an Claude Code auf dem Rechner des Nutzers. Dieses Dokument ist der Einstieg; alles Weitere liegt in `portal/`, `docs/` und `tests/`.

## Worum es geht

Wir wollen ein niederschwelliges Lernportal für das Fach Technik/Computer (TC) erstellen, passend zum Lehrplan Sachsen Gymnasium, Klasse 6. Es behandelt den reinen Computer-/Informatik-Teil und ist zum Selbstlernen gedacht.

Grundlage ist der sächsische Lehrplan Gymnasium Technik/Computer (2004, Überarbeitung 2019), Lernbereich 1 „Grundlagen im Umgang mit digitalen Medien“ (13 Ustd.) plus Wahlbereiche 3, 5 und 6. Auszug: `docs/lehrplan-auszug.md`.

## Was fertig ist

`portal/index.html` ist eine vollständige, eigenständige Seite ohne Build und ohne Bibliotheken (ca. 100 KB). Sie läuft so, wie sie ist, auf GitHub Pages.

- 13 Arbeitsblätter in 5 Gruppen plus Übersichtsseite (siehe Tabelle unten).
- 19 interaktive Übungen in drei Typen: Quiz (Auswahl oder Zahleneingabe), Zuordnen, Reihenfolge. Bestanden ab 70 %.
- 58 abhakbare Praxisaufgaben. Zusammen 77 zählbare Aufgaben.
- Zwei Sonderbausteine: Morse-Übersetzer mit Ton (WebAudio) und Probier-Minicomputer (5×5-LEDs, Wenn-dann-Regeln, Zähler modulo 10).
- Fortschritt in `localStorage` (Schlüssel `tc-werkstatt-6`, Objekt `{id: 1}`), Zurücksetzen je Blatt und global mit Rückfrage auf der Seite (kein `confirm()`).
- Je Blatt ein Block „Weiterlesen und Ausprobieren“; auf der Übersicht „Offizielle Angebote“ und „Abgleich mit dem Kompetenzrahmen“. Alle Links mit Prüfstatus: `docs/links.md`.
- Hell- und Dunkelmodus über CSS-Tokens, Handybreite getestet, Navigation über `#anker`.

Ausgeliefert wird `portal/` über den Workflow `.github/workflows/pages.yml` (GitHub Pages, Quelle „GitHub Actions“, kein Build).

| Gruppe | Blatt (`#id`) | Lehrplanbezug |
|---|---|---|
| Computer verstehen | `eva`, `hardsoft`, `dateien` | LB 1: Computerarbeitsplatz, Begriffe, Arbeitsumgebung |
| Dokumente gestalten | `text`, `tabelle` | LB 1: Textverarbeitung |
| Internet und Kommunikation | `web`, `sicher`, `mail`, `schulnetz` | LB 1: Recherche, elektronische Kommunikation; Wahlbereich 6 |
| Codieren und Programmieren | `morsen`, `mini`, `prog` | Wahlbereiche 3 und 5 |
| Abschluss | `projekt` | fasst LB 1 zusammen |

## Aufbau des Codes in index.html

- `<style>`: Tokens auf `:root`, Dunkelwerte in `@media (prefers-color-scheme: dark)` und `:root[data-theme="dark"]`.
- Inhalt: je Blatt eine `<section class="blatt" id="…" data-g="Gruppe" data-t="Kurztitel" data-d="Minuten">`. Übungen sind leere `<div class="ex" data-ex="ID">`, Praxisaufgaben `<ul class="praxis">`, Linkblöcke `<ul class="links">`.
- `<script>`: `EX` (alle Übungsdaten; bei Quiz ist die erste Option die richtige, gemischt wird beim Anzeigen), `mountQuiz`, `mountOrder`, Seitenaufbau (`baueNav`, `fortschritt`, `zeige`, `resetLeiste`), dann Minicomputer und Morse als eigene Funktionsblöcke.
- IDs der Praxisaufgaben entstehen aus Blatt-ID und Position (`eva-t0-1`). Wer Aufgaben umsortiert, verschiebt gespeicherte Häkchen. Beim Markdown-Umbau sollten feste IDs her.

## Entscheidungen des Nutzers bisher

- Nur der Informatik-Teil; Konstruieren und Fertigen sind entfernt.
- Weiterführende Links auf jedem Blatt gewünscht (Wikipedia, Scratch usw.).
- Offizielle Angebote verlinken und didaktisch abgleichen: erledigt, siehe `docs/recherche-offizielle-angebote.md`.
- Fortschritt im Browser, Zurücksetzen je Blatt und global mit Rückfrage: erledigt.
- Ziel jetzt: GitHub-Repository, Auslieferung über GitHub Pages, Kapitel für Mitarbeiter leichter bearbeitbar, möglichst als Markdown-Dateien.

## Entschieden

- Repository: `rpietzsch/tc6`, öffentlich, Auslieferung über GitHub Pages (Schritt A erledigt).
- Lizenz: MIT für alles Eigene (`LICENSE`). Die Seite enthält keine kopierten Fremdinhalte, nur Links. Der Lehrplanauszug in `docs/` ist ein Auszug aus einer amtlichen Quelle und steht nicht unter dieser Lizenz. Lokal eingebundene Schriften (Schritt C) behalten ihre SIL Open Font License.
- Impressum: entfällt, da kein geschäftsmäßiges Angebot (rein privat, nicht kommerziell). Eine Datenschutzerklärung ist davon getrennt zu betrachten; siehe Schritt C.

## Offene Entscheidungen

1. Markdown-Umbau (Schritt B): Formatvorschlag in `docs/markdown-format.md` ist noch nicht bestätigt.
2. „Kapitelweise zurücksetzen“ ist als Blatt umgesetzt. Ob zusätzlich je Gruppe gewünscht ist, ist offen.

## Plan

### Schritt A: unverändert veröffentlichen

- [ ] Repository anlegen (`gh repo create <name> --public`), `portal/index.html` als `index.html` ins Wurzelverzeichnis, dazu `README.md` und `LICENSE`.
- [ ] Pages einschalten: Branch `main`, Ordner `/` (Settings → Pages oder `gh api`).
- [ ] Seite unter `https://<konto>.github.io/<name>/` öffnen, Smoke-Test laufen lassen.

### Schritt B: Inhalte nach Markdown auslagern

Formatvorschlag mit Beispielen: `docs/markdown-format.md`. Der Nutzer hat das Format gesehen, aber noch nicht ausdrücklich bestätigt.

- [ ] Zielstruktur anlegen: `index.html` (Hülle), `assets/app.css`, `assets/app.js`, `assets/bausteine/{morse,minicomputer}.js`, `kapitel/NN-id.md`, `kapitel/index.json` oder Reihenfolge über Dateinamen, `bilder/`.
- [ ] Loader schreiben: Kapitel per `fetch` laden, Front-Matter lesen, Markdown rendern, Blöcke `quiz` / `zuordnen` / `reihenfolge` in die vorhandenen Übungs-Engines geben, Aufgabenlisten `- [ ]` als Praxisaufgaben mit Häkchen.
- [ ] Markdown-Parser ohne CDN einbinden (z. B. `marked` als Datei im Repository) oder Build per GitHub Action. Empfehlung: kein Build, damit Mitarbeiter im Browser editieren können.
- [ ] 13 Blätter und die Übersicht aus `index.html` in Markdown überführen; Übungsdaten aus `EX` in die Blöcke.
- [ ] EVA-Schema (Inline-SVG im Blatt `eva`) als `bilder/eva.svg` auslagern; es nutzt CSS-Klassen für die Themenfarben, das muss beim Auslagern gelöst werden (Inline-Einbindung oder `currentColor`).
- [ ] Feste IDs für Übungen und Praxisaufgaben; vorhandene IDs der Übungen beibehalten, damit gespeicherter Fortschritt gültig bleibt.
- [ ] Prüfskript für Mitwirkende: jede Übung hat `id`, genau eine richtige Antwort, keine doppelten IDs. Als GitHub Action bei Pull Requests.

### Schritt C: öffentlich tauglich machen

- [ ] Schriften lokal einbinden. Derzeit lädt die Seite Atkinson Hyperlegible, Barlow Semi Condensed und IBM Plex Mono von Google Fonts. Auf einer öffentlichen deutschen Seite datenschutzrechtlich heikel; alle drei stehen unter der SIL Open Font License.
- [ ] Datenschutz: Mit lokalen Schriften sendet die Seite selbst keine Daten an Dritte. Der Fortschritt bleibt im Browser. Hosting-Protokolle liegen bei GitHub Pages. Ob ein Hinweis nötig ist, vom Nutzer zu entscheiden; keine Rechtsberatung von hier.
- [ ] `CONTRIBUTING.md`: wie man ein Kapitel im Browser bearbeitet, Format der Übungen, Schreibstil (Du-Anrede, kurze Sätze, keine Emojis als Gliederung).
- [ ] Die Elternhinweise auf der Übersicht sprechen den Nutzer als „Sie“ an und nennen „Ihr Kind“; für ein öffentliches Portal ggf. allgemeiner fassen.

### Schritt D: inhaltliche Restpunkte

- [ ] `https://module-sachsen.dilewe.de/` (digitale Selbstlernmodule des LaSuB) öffnen und prüfen, ob es Module für TC oder Informatik gibt. Der Abruf scheiterte in der bisherigen Sitzung; der Link steht mit entsprechendem Vorbehalt auf der Übersicht.
- [ ] Die sechs Bezeichnungen des KMK-Kompetenzrahmens in der Abgleichstabelle gegen das Original prüfen (PDF ließ sich nicht auslesen, Bezeichnungen stammen aus dem Gedächtnis): https://www.kmk.org/fileadmin/Dateien/pdf/PresseUndAktuelles/2016/2016_12_08-KMK-Kompetenzen-in-der-digitalen-Welt.pdf
- [ ] Fachinhalte von einer Lehrkraft gegenlesen lassen; bisher nicht geschehen.
- [ ] Schulinternen Stoffverteilungsplan erfragen; welche Teile die Schule in Klasse 6 tatsächlich behandelt, ist unbekannt.
- [ ] Optional: Lernvideos ergänzen (MeSax-Mediathek, Planet Schule); bisher keine eingebaut, weil keine einzeln geprüft wurden.

## Bekannte Grenzen

- Fortschritt gilt je Browser und Gerät; kein Abgleich zwischen Geräten.
- Nach dem Umzug auf eine neue Adresse beginnt der Fortschritt bei null (anderer Ursprung).
- `scratch.mit.edu` ließ sich nicht automatisch abrufen (robots.txt), die Adresse ist die offizielle.
- Die neu ergänzten Internet-ABC-Lernmodule stammen aus der offiziellen Modulübersicht und wurden nicht alle einzeln geöffnet (Status in `docs/links.md`).
- Der Probier-Minicomputer zeigt bewusst nur eine Ziffer; das steht im Blatt und wird im Quiz abgefragt.

## Prüfen

`tests/smoke-reset.js` (Playwright) prüft Speichern, Neuladen, Blatt-Reset, Gesamt-Reset:

```
npm i playwright && npx playwright install chromium
node tests/smoke-reset.js portal/index.html
```

Erwartet wird am Ende `errors []` und `0 von 77 Aufgaben`.
