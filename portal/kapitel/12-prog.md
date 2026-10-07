---
id: prog
titel: Minicomputer programmieren
kurztitel: Minicomputer programmieren
gruppe: Codieren und Programmieren
dauer: 45
lehrplan: Wahlbereich 5 · Grundprinzipien der Programmierung
---

Ein Computer tut genau das, was im Programm steht. Nicht mehr, nicht weniger und auch nicht das, was du gemeint hast.

## Vier Begriffe

- **Algorithmus:** eine eindeutige Folge von Schritten, die zum Ziel führt. Ein Rezept ist ein Algorithmus für die Küche.
- **Anweisung:** ein einzelner Befehl, zum Beispiel „zeige ein Herz“.
- **Ereignis und Bedingung:** „<mark>Wenn</mark> Knopf A gedrückt wird, <mark>dann</mark> …“. Das Programm wartet, bis etwas geschieht, und reagiert darauf.
- **Variable:** ein Speicherplatz mit Namen, dessen Wert sich ändern kann, zum Beispiel ein Zähler.

## Probier-Minicomputer

Stelle die Regeln ein, starte das Programm und bediene dann die Knöpfe. Dieser Probier-Computer zeigt nur eine Ziffer. Nach 9 beginnt der Zähler wieder bei 0.

{{baustein: minicomputer}}

```quiz
id: prog-quiz
titel: Übung: Programmieren

? Was ist ein Algorithmus?
+ Eine eindeutige Folge von Schritten, die zum Ziel führt
- Ein besonders schneller Computer
- Ein Fehler im Programm
> Ein Rezept oder eine Bauanleitung ist auch ein Algorithmus.

? „Wenn Knopf A gedrückt wird, dann zeige ein Herz.“ Was ist hier das Ereignis?
+ Knopf A wird gedrückt
- Das Herz wird gezeigt
- Das Wort „dann“
> Das Ereignis löst die Anweisung aus.

? Was ist eine Variable?
+ Ein Speicherplatz mit Namen, dessen Wert sich ändern kann
- Ein Sensor
- Eine Leuchtdiode
> Der Zähler im Schrittzähler ist eine Variable.

? Der Zähler steht auf 4. Die Anweisung „erhöhe den Zähler um 1“ läuft dreimal. Welchen Wert hat der Zähler?
= 7
> 4 + 1 + 1 + 1 = 7.

? Welche Regel braucht ein Schrittzähler?
+ Wenn geschüttelt wird, erhöhe den Zähler um 1
- Wenn Knopf A gedrückt wird, lösche die Anzeige
- Wenn das Programm startet, zeige ein Herz
> Jeder Schritt erschüttert das Gerät.

? Dein Programm tut nicht, was du willst. Was ist der beste Weg?
+ Die Regeln Schritt für Schritt durchgehen und den Fehler suchen
- Alles löschen und hoffen
- Den Computer neu starten
> Fehlersuche gehört zum Programmieren dazu.

? Im Probier-Minicomputer steht der Zähler auf 9 und zählt um 1 hoch. Was zeigt die Anzeige?
+ 0
- 10
- 9
> Die Anzeige hat nur Platz für eine Ziffer und beginnt wieder bei 0.
```

## Praxis

- [ ] Begrüßung: Beim Start erscheint ein Haken, bei Knopf A ein Herz, bei Knopf B wird die Anzeige gelöscht. {#prog-t0-0}
- [ ] Schrittzähler: Beim Start steht der Zähler auf 0. Bei jedem Schütteln zählt er um 1 hoch. {#prog-t0-1}
- [ ] Klickzähler mit Rücksetzen: Knopf A zählt hoch, Knopf B setzt auf 0. {#prog-t0-2}
- [ ] Stelle absichtlich eine falsche Regel ein, lass jemanden aus der Familie den Fehler suchen und erkläre ihn. {#prog-t0-3}
- [ ] Baue den Schrittzähler im echten Editor nach. Er hat einen Simulator, du brauchst kein Gerät: [makecode.calliope.cc](https://makecode.calliope.cc) oder [makecode.microbit.org](https://makecode.microbit.org). {#prog-t0-4}
- [ ] Schreibe für deinen Schrittzähler auf, was Eingabe, Verarbeitung und Ausgabe ist. {#prog-t0-5}

## Weiterlesen und Ausprobieren

- Lernbibliothek: [Lernbibliothek Informatik 5/6](https://www.bildung-lsa.de/informationsportal/unterricht/sekundarschule/informatik/lernbibliothek.htm) – Freie Materialien des Bildungsservers Sachsen-Anhalt zu Algorithmen, Scratch und Datenschutz.
- Ausprobieren: [Scratch](https://scratch.mit.edu) – Mit bunten Blöcken eigene Spiele und Geschichten programmieren, kostenlos im Browser.
- Ausprobieren: [Programmieren mit der Maus](https://programmieren.wdrmaus.de) – Schritt-für-Schritt-Kurs vom WDR, der Scratch verwendet.
- Ausprobieren: [Hour of Code](https://hourofcode.com/de) – Einstündige Programmier-Rätsel zu vielen Themen.
- Wettbewerb: [Informatik-Biber](https://bwinf.de/biber/) – Knobelaufgaben aus der Informatik, jedes Jahr im November. Die Anmeldung läuft über die Schule.
- Wikipedia: [Scratch](https://de.wikipedia.org/wiki/Scratch_(Programmiersprache)) – Hintergrund zur Programmiersprache.
- Wikipedia: [Algorithmus](https://de.wikipedia.org/wiki/Algorithmus) – Was Algorithmen sind, mit Beispielen aus dem Alltag.
- Wikipedia: [Variable](https://de.wikipedia.org/wiki/Variable_(Programmierung)) – Wie Programme sich Werte merken.
