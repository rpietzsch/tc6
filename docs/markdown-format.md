# Format der Kapitel

Jedes Blatt ist eine Markdown-Datei in `portal/kapitel/`. Die Seite lädt sie beim Öffnen, rendert sie mit [marked](../portal/assets/vendor/README.md) und baut daraus Blätter, Übungen und Fortschrittsanzeige. Es gibt keinen Build.

Die Reihenfolge der Blätter steht in `portal/kapitel/index.json`. Dateinamen: `NN-id.md`, zwei Ziffern für die Reihenfolge. Prüfen: `node tests/validate-kapitel.js`.

## Beispiel

````markdown
---
id: eva
titel: Der Computerarbeitsplatz und das EVA-Prinzip
kurztitel: Computerarbeitsplatz und EVA
gruppe: Computer verstehen
dauer: 30
lehrplan: Lernbereich 1 · Grundlagen im Umgang mit digitalen Medien
---

Jeder Computer arbeitet nach demselben Muster …

![Schema des EVA-Prinzips](../bilder/eva.svg "Das EVA-Prinzip. Die Zentraleinheit holt Daten vom Speicher.")

## Die Bestandteile

- **Eingabegeräte** bringen Daten in den Computer.

> **Merke:** Ein Touchscreen ist Eingabe- und Ausgabegerät zugleich.

```quiz
id: eva-quiz
titel: Übung: EVA-Prinzip

? Wofür steht die Abkürzung EVA?
+ Eingabe, Verarbeitung, Ausgabe
- Einschalten, Verbinden, Ausschalten
- Eingang, Verteiler, Ausgang
> Daten werden eingegeben, verarbeitet und ausgegeben.

? Eine Tabelle hat 4 Spalten und 3 Zeilen. Wie viele Zellen hat sie?
= 12
> 4 × 3 = 12.
```

```zuordnen
id: eva-sort
titel: Übung: Eingabe, Verarbeitung, Ausgabe oder Speicher?
frage: Wozu gehört dieses Teil?
kategorien: Eingabe | Verarbeitung | Ausgabe | Speichern

Tastatur: Eingabe
Prozessor: Verarbeitung
Monitor: Ausgabe
USB-Stick: Speichern
```

```reihenfolge
id: speichern-order
titel: Übung: Ein neues Dokument speichern
einleitung: Bringe die Schritte in die richtige Reihenfolge.

1. Textverarbeitung starten
2. Text schreiben
3. „Speichern unter“ wählen
```

## Praxis

- [ ] Zeichne deinen Computerarbeitsplatz und beschrifte jedes Gerät. {#eva-p1}

## Weiterlesen und Ausprobieren

- Kinderlexikon: [Computer](https://klexikon.zum.de/wiki/Computer) – Was ein Computer ist.
````

## Kopfdaten

Zwischen zwei Zeilen `---` stehen Zeilen der Form `schlüssel: wert`. Es ist kein YAML.

| Schlüssel | Bedeutung |
|---|---|
| `id` | Kennung des Blatts, Ziel für Links (`#eva`). Kleinbuchstaben, Ziffern, Bindestriche. |
| `titel` | Überschrift auf dem Blatt |
| `kurztitel` | Name in der Navigation |
| `gruppe` | Überschrift in der Navigation; Blätter einer Gruppe müssen hintereinander stehen. Leer beim ersten Blatt (Übersicht). |
| `dauer` | Minuten, ganze Zahl; optional |
| `lehrplan` | Zeile über der Überschrift |

## Was im Text eine besondere Bedeutung hat

| Schreibweise | Wirkung |
|---|---|
| erster Absatz | Einstieg, größer und grau |
| `## Überschrift` | Zwischenüberschrift (`#` nicht verwenden, die Überschrift steht in `titel`) |
| `> **Merke:** Text` | Merkkasten; das fette Wort ist die Titelzeile, ein Doppelpunkt darin wird entfernt |
| Tabelle mit `\|` | Tabelle; eine Spalte mit `---:` ist rechtsbündig (für Zahlen) |
| `![Beschreibung](pfad "Unterschrift")` | Abbildung; `.svg`-Dateien werden in die Seite eingebettet, damit Farben und Dunkelmodus gelten |
| `` `Strg + S` `` | Tastenkürzel und Dateinamen in Schreibmaschinenschrift |
| `<mark>Wenn</mark>` | gelbe Hervorhebung |
| `- [ ] Aufgabe {#id}` | abhakbare Praxisaufgabe; die ID am Zeilenende ist Pflicht |
| `## Praxis` vor einer Aufgabenliste | wird als gelbes Etikett „Praxis“ dargestellt |
| `- Art: [Titel](url) – Beschreibung` | Linkliste mit Art-Spalte; alle Listeneinträge müssen so aufgebaut sein |
| `{{baustein: name}}` | Sonderbaustein: `morse`, `minicomputer`, `uebersicht` (Liste aller Blätter) |
| ` ```quiz `, ` ```zuordnen `, ` ```reihenfolge ` | Übungen, siehe unten |

Externe Links nur aufnehmen, wenn sie geprüft sind, und in `docs/links.md` eintragen. Das Prüfskript meldet unbekannte Links als Hinweis.

## Übungen

Alle Übungen haben `id` und `titel`. Danach folgt eine Leerzeile.

### quiz

| Zeichen | Bedeutung |
|---|---|
| `?` | neue Frage |
| `+` | richtige Antwort (genau eine) |
| `-` | falsche Antwort (mindestens eine) |
| `=` | Zahl als Lösung statt Auswahl; Komma oder Punkt erlaubt |
| `>` | Erklärung nach dem Antworten |

Die Antworten werden beim Anzeigen gemischt, die Reihenfolge in der Datei spielt keine Rolle. Bestanden ab 70 % richtiger Antworten.

### zuordnen

Zusätzliche Kopfzeilen `frage:` und `kategorien: A | B | C`. Danach eine Zeile je Begriff: `Begriff: Kategorie`. Die Kategorie muss genau so in `kategorien:` stehen.

### reihenfolge

Zusätzliche Kopfzeile `einleitung:`. Danach die Schritte in der richtigen Reihenfolge als nummerierte Liste. Die Seite mischt sie.

## IDs

- Übungen und Praxisaufgaben haben feste IDs. Der Lernfortschritt im Browser hängt daran: wer eine ID ändert, setzt den Fortschritt dieser Aufgabe zurück.
- Alle IDs (Blätter, Übungen, Aufgaben) sind zusammen eindeutig.
- `tests/ids-stabil.txt` listet alle bisher ausgelieferten IDs. Das Prüfskript meldet, wenn eine fehlt.
- Die ersten Praxisaufgaben heißen noch `eva-t0-0` nach dem alten Schema (Blatt, Liste, Position). Neue Aufgaben nennt man `blatt-p1`, `blatt-p2` und so weiter.

## Sonderbausteine

Morse-Übersetzer und Probier-Minicomputer bleiben JavaScript: `portal/assets/bausteine/`. Im Kapitel steht nur die Platzhalterzeile.

## Bekannte Nachteile

- In der Vorschau auf GitHub erscheinen die Übungen als Textblock, nicht interaktiv.
- Die Lösungen stehen offen im Repository; für Selbsttests unkritisch.
- Die Seite lädt die Kapitel mit `fetch` und läuft deshalb nicht aus dem Dateisystem. Lokal: im Ordner `portal` `python3 -m http.server 8000`.
