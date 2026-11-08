# Holzdieb – aktueller Stand 0.6.0 · 08.11.2026

Der bisherige illustrierte Fall bleibt die Startseite. Neu ist `/welt` als separate experimentelle 3D-Vorschau mit fünf räumlich verbundenen Außenbereichen. Technische Entscheidung, Quellenanalyse von World of ClaudeCraft, Abnahmegrenzen und nächster Arbeitsschritt: [OPEN-WORLD.md](OPEN-WORLD.md).

23 Tests bestehen, einschließlich tatsächlicher Havok-WASM-Kollisionen gegen Gebäude/Fluss, Brückenquerung, Sprung/Landung und physischer Erreichbarkeit aller zwölf Beobachtungen und drei Zeugen. Typprüfung besteht. Der Prüfbrowser meldet `WebGL not supported`; die grafische Abnahme und ein vollständiger 3D-Browserdurchlauf sind offen. Deshalb kein Austausch der bewährten Startansicht.

Die vorherigen Grafik-/Bewegungsiterationen sind in [RENDERING.md](RENDERING.md) und [MOTION.md](MOTION.md) beschrieben. Der Audiofehler nach einem Start im versteckten Tab ist mit zwei Regressionstests behoben. Die bekannte GitHub-Medienlücke bleibt in ASSETS.md/ART-ASSETS.md dokumentiert. Die neue 3D-Welt verwendet eigene Geometrie und Paket-WASM statt weiterer großer Bildblobs.

## Historischer Stand 0.3.1


## Geliefert

Fall 001 bleibt erhalten. Fall 002 „Die falsche Fuhre“ ist unter /abenteuer und über die Startseite erreichbar: fünf Ortsansichten, frei bewegte Spielfigur, zwölf Beobachtungen, drei Kapitel mit geprüften Schlussfolgerungen, drei Figuren mit je drei kontextabhängigen Gesprächsfragen, Fallakte, eigener lokaler Spielstand, Fortsetzung nach Reload und Abschluss.

## Technische Entscheidung

Bestehende React-19.2.6-/Vinext-Anwendung; Szenen als SVG und React-Darstellung, Bewegung/Ermittlungsregeln als Spielfachlogik. Quellen: package.json und https://react.dev/learn (Prüfdatum 08.11.2026). Keine neue Engine, keine Plattformsteuerung, keine großen Medien als Modelltext. Vorhandene Bild-/Audioassets bleiben unverändert. Fall 002 ist 2D; keine Behauptung eines begehbaren 3D-Spiels.

## Nachweise

14 Node-Tests bestehen: bisheriger Fall, Audio-Mixer und neuer Fall. Neue Regeln prüfen deduktive Voraussetzungen, falsche Antworten, drei unterschiedliche Fundreihenfolgen, Wiederholungen, Abschluss mit Zeugen, korrupte Spielstände und wissensabhängige Antworten.
Browserprüfung: Bewegung per Laufziel, Funddialog, Ortswechsel erster Kapitelübergang und Fortsetzung nach Reload tatsächlich ausgeführt. Vollständiger manueller Durchlauf und unabhängige Erstspieler-/Hörprüfung sind noch offen. Der automatisierte Regeldurchlauf bis zum Ende ist bestanden.
TypeScript-Prüfung und Produktionsbuild bestanden. Veröffentlichter Versionsnachweis folgt aus der nativen Sites-Rückmeldung.

## Grenzen und nächster Schritt

Lokaler Fortschritt hängt von Browserpersistenz ab; Speicherfehler werden angezeigt. Keine Konten, Echtgeldkäufe oder Cloud-Spielstände in dieser Erweiterung. Nächste fachliche Arbeit: Figurenanimationen und unabhängiges Erstspielerfeedback; zusätzliche Kapitel erst nach deren Befunden.

## Iteration 2 · 0.3.1

DoD erreicht: automatische Untersuchung nach dem Hinlaufen; Figuren statt Buchstabenmarker; Werkstatt, Hof, Bach, Mühle und Außenlager räumlich unterscheidbar; Deutungsoptionen erst nach nötigen Funden; vollständiger UI-Durchlauf samt falscher Antwort ohne Fortschrittsverlust. Keine Integration von Dify oder Delivery Controller als Produktionsvehikel.

## Sicherung

Der komplette Spielstand einschließlich Originalmedien ist im nativen Sites-Quellstand gesichert. Die GitHub-Kopie enthält den Quellcode, Logo und Audio; die einzelne offene Bildübertragung und ihr unveränderter versionierter Bezug stehen in docs/ASSETS.md. Ein eigenständiger Build von Fall 001 aus GitHub benötigt die Wiederherstellung dieses Bildes. Die aktuelle Produktion besitzt es unverändert.
