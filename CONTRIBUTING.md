# Mitmachen

Die Inhalte stehen in Markdown-Dateien. Du brauchst kein HTML und keine Entwicklungsumgebung, um ein Blatt zu verbessern.

## Ein Blatt im Browser bearbeiten

1. Öffne auf GitHub die Datei in `portal/kapitel/`, zum Beispiel `01-eva.md`.
2. Klicke auf das Stift-Symbol („Edit this file“). Beim ersten Mal legt GitHub dafür eine eigene Kopie (Fork) an.
3. Ändere den Text. Das Format steht in [docs/markdown-format.md](docs/markdown-format.md).
4. Beschreibe unten kurz, was du geändert hast, und erstelle einen Pull Request.

Eine automatische Prüfung meldet Fehler im Format mit Datei und Zeile. Ein Mensch schaut danach noch einmal auf den Inhalt.

## Ein neues Blatt anlegen

1. Neue Datei `portal/kapitel/NN-name.md` mit den Kopfdaten wie in den anderen Blättern.
2. Den Dateinamen in `portal/kapitel/index.json` an der gewünschten Stelle eintragen.
3. Für jede Übung und jede Praxisaufgabe eine neue, eindeutige ID vergeben.

## Lokal ansehen

```
cd portal
python3 -m http.server 8000
```

Dann `http://localhost:8000` öffnen. Ein Doppelklick auf `index.html` reicht nicht, weil die Seite ihre Kapitel nachlädt.

Prüfen und testen:

```
node tests/validate-kapitel.js       # Format der Kapitel, ohne Installation
npm install && npx playwright install chromium
node tests/smoke-reset.js            # Rauchtest im Browser
```

## Schreibstil

- Deutsch, Du-Anrede für das Kind, kurze Sätze.
- Fachbegriffe wie im Lehrplan (siehe [docs/lehrplan-auszug.md](docs/lehrplan-auszug.md)).
- Keine Emojis als Gliederung. Gliedere mit Überschriften, Listen und Merkkästen.
- Eine Übung fragt nach einem Gedanken pro Frage. Falsche Antworten sollen glaubwürdig sein, nicht albern.
- Erklärungen (`>`) sagen, warum die Antwort stimmt.

## Regeln für Technik und Inhalt

- Keine externen Skripte, keine Schriften von fremden Servern, kein Tracking. Die Seite soll ohne Anfragen an Dritte laufen.
- Farben nur über die CSS-Variablen in `portal/assets/app.css`. Hell- und Dunkelmodus müssen beide stimmen, und bei 400 px Breite darf nichts seitlich scrollen.
- IDs von Übungen und Aufgaben nie ändern. Gespeicherter Lernfortschritt hängt daran.
- Externe Links nur aufnehmen, wenn du sie geöffnet und geprüft hast. Trage sie mit Prüfstatus in [docs/links.md](docs/links.md) ein.
- Keine Texte, Bilder oder Schriften übernehmen, deren Lizenz das nicht erlaubt. Eigene Beiträge stehen unter der [MIT-Lizenz](LICENSE) des Projekts.
