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
- Zurücksetzen des Fortschritts: je Blatt und gesamt reicht, nicht zusätzlich je Gruppe.
- Seitenfuß: auf jedem Blatt Links auf die Markdown-Datei des Blatts (GitHub, ansehen und bearbeiten) und auf das Projekt (`quelle()` in `assets/app.js`).
- Impressum: entfällt, da kein geschäftsmäßiges Angebot (rein privat, nicht kommerziell). Ein Datenschutzhinweis steht trotzdem auf der Übersicht (siehe Schritt C).

## Offene Entscheidungen

Keine. (Zurücksetzen gibt es je Blatt und gesamt; eine Gruppen-Variante ist nicht gewünscht.)

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

- [x] Selbstlernmodule des LaSuB geprüft (2026-10-07, Hinweis des Nutzers und eigene Kontrolle im Browser): kein Modul für Technik/Computer; Informatik nur „Grundlagen der Künstlichen Intelligenz“ (GY 9) und „Zukunftsvisionen“ (10-13). Übersicht und `docs/links.md` sind angepasst. Neu prüfen, wenn die Seite wächst: Modulliste auf https://module-sachsen.dilewe.de/inhalt/f-a-q-und-hilfe/index.html.
- [x] KMK-Kompetenzrahmen geprüft (2026-10-07): Die sechs Bezeichnungen stimmen wörtlich mit dem Beschluss vom 8.12.2016 überein (https://www.kmk.org/fileadmin/Dateien/veroeffentlichungen_beschluesse/2016/2016_12_08-Bildung-in-der-digitalen-Welt.pdf, Seiten 15 bis 18). Der früher genannte PDF-Link `2016_12_08-KMK-Kompetenzen-in-der-digitalen-Welt.pdf` ist nur ein eingescanntes Schaubild eines Dritten (eine Seite, ohne Text, kürzt Bereich 1 zu „Suchen und Verarbeiten“) und kein Beleg. Sachsen bestätigt die Aufnahme in die Lehrpläne zum Schuljahr 2019/2020 (https://www.medienbildung.sachsen.de/schulische-medienbildung-4494.html). Die Zuordnung der Blätter wurde dabei überprüft; `morsen` steht jetzt bei Bereich 5.
- [ ] Fachinhalte von einer Lehrkraft gegenlesen lassen; bisher nicht geschehen.
- [ ] Schulinternen Stoffverteilungsplan erfragen; welche Teile die Schule in Klasse 6 tatsächlich behandelt, ist unbekannt.
- [ ] Optional: Lernvideos ergänzen (MeSax-Mediathek, Planet Schule); bisher keine eingebaut, weil keine einzeln geprüft wurden.

### Schritt E: Bilder und Illustrationen (erledigt, ausbaufähig)

Auftrag des Nutzers: passende Bilder und Illustrationen, damit die Schüler die Dinge gesehen haben, zumal viel „historische“ Hardware in modernen Geräten nicht mehr sichtbar ist. Nur offen lizenziertes Material (Wikimedia Commons) oder selbst erzeugte Grafiken.

Umgesetzt (18 Bilder, rund 750 KB, alle lokal in `portal/bilder/`):

- `eva`: Explosionszeichnung eines PC mit elf nummerierten Teilen und Legende; Maus von außen und innen, alte Tastatur; Hauptplatine, Prozessor heute und früher, Arbeitsspeicher.
- `hardsoft`: eigene Zeichnung der Bedienelemente (Fenster, Menü, Symbol, Schaltfläche) als SVG.
- `dateien`: Speichermedien von der Diskette über CD, Festplatte (geöffnet), SSD bis USB-Stick und SD-Karte.
- `mini`: Calliope mini und micro:bit. `morsen`: Morsetaste und Nachbau eines Chappe-Telegrafen.

Wie es funktioniert:

- Markdown: `![Alternativtext](../bilder/datei.webp "Bildunterschrift")`. Ein Bild allein im Absatz wird zur Abbildung, mehrere Bilder in aufeinanderfolgenden Zeilen zu einer Bildergruppe (`.sinn`). Ein SVG wird in die Seite eingebettet (Farben, Dunkelmodus), alles andere ist `<img loading="lazy">` mit Breite und Höhe.
- `portal/bilder/nachweis.json` ist die Quelle für Urheber und Lizenz: Titel, Urheber, Lizenz mit Version und Link auf den Lizenztext, Commons-Seite, Bearbeitung, Prüfdatum, Maße. Der Loader hängt an jede Bildunterschrift „Bild: Urheber, Lizenz“ und erzeugt am Ende des Blatts einen Abschnitt „Bildnachweis“ mit Links. Eigene Grafiken haben `"eigen": true`.
- `tests/validate-kapitel.js` prüft: Datei vorhanden, Alternativtext und Bildunterschrift, Eintrag im Nachweis, erlaubte Lizenz (gemeinfrei, CC0, CC BY, CC BY-SA; eigene Grafiken MIT), Quelle als https-Adresse, Maße; meldet nicht benutzte oder zu große (über 200 KB) Dateien.
- `tests/smoke-reset.js` prüft, dass alle Bilder laden und einen Alternativtext haben, und dass weiterhin keine Anfrage an fremde Server geht.
- Neues Bild holen: `node tools/bild-holen.js "Dateiname auf Commons" ziel.webp 640`. Das Werkzeug liest Lizenz und Urheber über die Commons-Schnittstelle, lehnt andere Lizenzen ab, verkleinert zu WebP und schreibt den Nachweis. Vorher die Commons-Seite lesen (Personen oder Marken im Bild vermeiden) und danach Alternativtext und Bildunterschrift selbst schreiben.
- Die Angaben zu Urheber und Lizenz stammen aus den Metadaten der Commons-Seite vom 2026-10-07. Bei Zweifeln (zum Beispiel „gemeinfrei“ bei Bildern von Fremdseiten) das Bild austauschen.

Mögliche Erweiterungen: Bilder für `web`, `sicher`, `mail`, `text` und `tabelle` (zum Beispiel Beispielfenster als eigene Zeichnungen), ein Foto eines Sensors oder Aktors für `mini`, Rauchzeichen oder Zeigertelegraf für `morsen`.

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
