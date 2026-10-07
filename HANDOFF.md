# Übergabe: TC-Werkstatt Klasse 6

Stand: 2026-10-07, nach Umbau auf Markdown-Kapitel (Schritte A bis C erledigt). Dieses Dokument ist der Einstieg; alles Weitere liegt in `portal/`, `docs/` und `tests/`.

## Worum es geht

Wir wollen ein niederschwelliges Lernportal für das Fach Technik/Computer (TC) erstellen, passend zum Lehrplan Sachsen Gymnasium, Klasse 6. Es behandelt den reinen Computer-/Informatik-Teil und ist zum Selbstlernen gedacht.

Grundlage ist der sächsische Lehrplan Gymnasium Technik/Computer (2004, Überarbeitung 2019), Lernbereich 1 „Grundlagen im Umgang mit digitalen Medien“ (13 Ustd.) plus Wahlbereiche 3, 5 und 6. Auszug: `docs/lehrplan-auszug.md`.

## Was fertig ist

Die Seite unter `portal/` läuft ohne Build und ohne externe Anfragen. Die Inhalte stehen als Markdown in `portal/kapitel/`, ein kleiner Loader baut daraus die Seite. Online: https://rpietzsch.github.io/tc6/

- 13 Arbeitsblätter in 5 Gruppen plus Übersichtsseite (siehe Tabelle unten).
- 19 interaktive Übungen in drei Typen: Quiz (Auswahl oder Zahleneingabe), Zuordnen, Reihenfolge. Bestanden ab 70 %.
- 58 abhakbare Praxisaufgaben. Zusammen 77 zählbare Aufgaben.
- Zwei Sonderbausteine: Morse-Übersetzer mit Ton (WebAudio) und Probier-Minicomputer (5×5-LEDs, Wenn-dann-Regeln, Zähler modulo 10).
- Fortschritt in `localStorage` (Schlüssel `tc-werkstatt-6`, Objekt `{id: 1}`), Zurücksetzen je Blatt und global mit Rückfrage auf der Seite (kein `confirm()`).
- Je Blatt ein Block „Weiterlesen und Ausprobieren“; auf der Übersicht „Offizielle Angebote“ und „Abgleich mit dem Kompetenzrahmen“. Alle Links mit Prüfstatus: `docs/links.md`.
- Hell- und Dunkelmodus über CSS-Tokens, Handybreite getestet, Navigation über `#anker`.
- Schriften liegen lokal (`assets/fonts/`), `marked` liegt als Datei im Repository (`assets/vendor/`). Die Seite ruft keine fremden Server auf.

Ausgeliefert wird `portal/` über den Workflow `.github/workflows/pages.yml` (GitHub Pages, Quelle „GitHub Actions“). Der Workflow führt vorher das Prüfskript aus. Bei Pull Requests läuft `.github/workflows/check.yml` (Prüfskript und Rauchtest).

| Gruppe | Blatt (`#id`) | Lehrplanbezug |
|---|---|---|
| Computer verstehen | `eva`, `hardsoft`, `dateien` | LB 1: Computerarbeitsplatz, Begriffe, Arbeitsumgebung |
| Dokumente gestalten | `text`, `tabelle` | LB 1: Textverarbeitung |
| Internet und Kommunikation | `web`, `sicher`, `mail`, `schulnetz` | LB 1: Recherche, elektronische Kommunikation; Wahlbereich 6 |
| Codieren und Programmieren | `morsen`, `mini`, `prog` | Wahlbereiche 3 und 5 |
| Abschluss | `projekt` | fasst LB 1 zusammen |

## Aufbau

```
portal/
  index.html                 Hülle: Kopf, Navigation, Platz für die Blätter
  assets/app.css             Stile (Tokens auf :root, Hell/Dunkel), @font-face
  assets/app.js              Loader, Bearbeitung des gerenderten HTML, Übungen (mountQuiz, mountOrder), Navigation, Fortschritt
  assets/kapitel-parser.js   liest Kopfdaten und Übungsblöcke; wird auch vom Prüfskript benutzt
  assets/bausteine/          morse.js, minicomputer.js (Platzhalter {{baustein: name}})
  assets/vendor/             marked.umd.js mit Lizenz und README
  assets/fonts/              woff2 und OFL-Texte
  kapitel/index.json         Reihenfolge der Blätter
  kapitel/NN-id.md           ein Blatt je Datei (Format: docs/markdown-format.md)
  bilder/eva.svg             EVA-Schema; wird in die Seite eingebettet, damit CSS-Tokens und Dunkelmodus gelten
tests/validate-kapitel.js    Prüfskript (Format, IDs, Links, Bilder, Reihenfolge)
tests/ids-stabil.txt         alle ausgelieferten Übungs- und Aufgaben-IDs
tests/smoke-reset.js         Rauchtest im Browser (Playwright), startet selbst einen Webserver
```

- Ablauf beim Laden: `kapitel/index.json` holen, jede Datei per `fetch` laden, `KapitelParser.parse` ersetzt Übungsblöcke und Bausteine durch HTML-Platzhalter, `marked` rendert den Rest, `nachbearbeiten` macht daraus Merkkästen, Tabellen mit Rollbalken, Aufgabenlisten, Linklisten und Abbildungen. Danach hängt der Code Übungen, Häkchen und Bausteine ein.
- Fehler in einem Kapitel erscheinen als roter Kasten mit Datei und Zeile auf dem Blatt; die übrigen Blätter laufen weiter.
- Die Seite braucht einen Webserver (`fetch`); per `file://` zeigt sie eine Erklärung an.
- Praxisaufgaben haben feste IDs im Text (`{#eva-t0-0}`). Die ersten 58 folgen dem alten Schema `blatt-t<Liste>-<Position>`, damit gespeicherter Fortschritt gültig blieb. Neue Aufgaben: `blatt-p1` usw.
- Der Umbau wurde gegen die alte HTML-Fassung geprüft: Text, Links, Tabellen, IDs und alle Übungsdaten sind gleich. Kleine Unterschiede: Zahlenspalten sind jetzt rechtsbündig (`---:`), Tastenkürzel und Dateiendungen erscheinen als `code`.

## Entscheidungen des Nutzers bisher

- Nur der Informatik-Teil; Konstruieren und Fertigen sind entfernt.
- Weiterführende Links auf jedem Blatt gewünscht (Wikipedia, Scratch usw.).
- Offizielle Angebote verlinken und didaktisch abgleichen: erledigt, siehe `docs/recherche-offizielle-angebote.md`.
- Fortschritt im Browser, Zurücksetzen je Blatt und global mit Rückfrage: erledigt.
- Ziel jetzt: GitHub-Repository, Auslieferung über GitHub Pages, Kapitel für Mitarbeiter leichter bearbeitbar, möglichst als Markdown-Dateien.

## Entschieden

- Repository: `rpietzsch/tc6`, öffentlich, Auslieferung über GitHub Pages (Schritt A erledigt).
- Lizenz: MIT für alles Eigene (`LICENSE`). Die Seite enthält keine kopierten Fremdinhalte, nur Links. Der Lehrplanauszug in `docs/` ist ein Auszug aus einer amtlichen Quelle und steht nicht unter dieser Lizenz. Lokal eingebundene Schriften (Schritt C) behalten ihre SIL Open Font License.
- Impressum: entfällt, da kein geschäftsmäßiges Angebot (rein privat, nicht kommerziell). Ein Datenschutzhinweis steht trotzdem auf der Übersicht (siehe Schritt C).

## Offene Entscheidungen

1. „Kapitelweise zurücksetzen“ ist als Blatt umgesetzt. Ob zusätzlich je Gruppe gewünscht ist, ist offen.

## Plan

### Schritt A: veröffentlichen (erledigt)

- [x] Repository `rpietzsch/tc6`, Pages über GitHub Actions, `LICENSE`, `README.md`.

### Schritt B: Inhalte nach Markdown auslagern (erledigt)

- [x] Zielstruktur, Loader, `marked` als Datei im Repository, Umwandlung aller 14 Blätter, `eva.svg`, feste IDs, Prüfskript und Action. Das Format hat der Nutzer bestätigt (`docs/markdown-format.md`).

### Schritt C: öffentlich tauglich machen (erledigt)

- [x] Schriften lokal (Atkinson Hyperlegible, Barlow Semi Condensed, IBM Plex Mono; nur Latin-Teilmenge, SIL OFL, Lizenztexte in `assets/fonts/`).
- [x] `CONTRIBUTING.md`.
- [x] Elternhinweise auf der Übersicht neutral formuliert.
- [x] Datenschutzhinweis am Ende der Übersicht (`00-start.md`). Er enthält nur Aussagen, die `tests/smoke-reset.js` prüft: keine Cookies, nur Anfragen an den eigenen Server (nur GET, ohne Parameter), ein Eintrag im lokalen Speicher mit Kennungen, externe Links im neuen Tab. Was GitHub als Hoster verarbeitet, steht nicht im Hinweis; er verweist auf GitHubs Datenschutzerklärung. Wer den Hinweis erweitert, ergänzt den passenden Test.

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

```
node tests/validate-kapitel.js          # Format, IDs, Links, Bilder; ohne Installation
npm install && npx playwright install chromium
node tests/smoke-reset.js               # Browsertest, Erwartung: "Alles in Ordnung."
```

Der Rauchtest prüft 14 Blätter, 19 Übungen, 58 Aufgaben, Speichern, Neuladen, Zurücksetzen je Blatt und gesamt, eine gelöste Reihenfolge-Übung, die Breite 400 px und die Datenschutz-Aussagen. Mit einer Adresse als Argument läuft er gegen die veröffentlichte Seite: `node tests/smoke-reset.js https://rpietzsch.github.io/tc6/`.
