# Vorschlag: Kapitel als Markdown

Status: Vorschlag, vom Nutzer gesehen, noch nicht bestätigt. Ziel: Mitarbeiter bearbeiten Kapitel ohne HTML.

## Datei je Blatt

`kapitel/01-eva.md`, Reihenfolge über die Nummer im Dateinamen.

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

![Schema des EVA-Prinzips](../bilder/eva.svg)

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

- Kinderlexikon: [Computer](https://klexikon.zum.de/wiki/Computer) – Was ein Computer ist, einfach erklärt.

{{baustein: minicomputer}}
````

## Regeln der Blöcke

| Zeichen | Bedeutung |
|---|---|
| `?` | neue Frage |
| `+` | richtige Antwort (genau eine) |
| `-` | falsche Antwort |
| `=` | Zahl als Lösung statt Auswahl; Komma oder Punkt erlaubt |
| `>` | Erklärung nach dem Antworten |

- Jede Übung braucht eine `id`, die sich nie ändert. Die bestehenden IDs stehen im Objekt `EX` in `portal/index.html`.
- Praxisaufgaben sind Aufgabenlisten `- [ ]`. Für stabile Häkchen eine ID anhängen (`{#eva-p1}`); bisher werden IDs aus der Position gebildet.
- Merkkästen sind Zitate, die mit fettem Wort beginnen.
- Sonderbausteine (Morse-Übersetzer, Probier-Minicomputer) bleiben JavaScript und werden über eine Platzhalterzeile eingesetzt.

## Bekannte Nachteile

- In der Vorschau auf GitHub erscheinen die Übungen als Textblock, nicht interaktiv.
- Die Lösungen stehen offen im Repository; für Selbsttests unkritisch.
- Ein eigener kleiner Parser für die drei Blocktypen ist nötig; er sollte Fehler mit Datei und Zeile melden, damit Mitwirkende sie finden.
