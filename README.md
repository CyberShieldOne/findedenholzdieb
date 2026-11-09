# Finde den Holzdieb · Gottlieb Arcade

Aktueller Stand: [docs/STATUS.md](docs/STATUS.md). Die separate experimentelle 3D-Welt unter `/welt` ist in [docs/OPEN-WORLD.md](docs/OPEN-WORLD.md) beschrieben; ihre grafische WebGL-Abnahme steht noch aus. Die folgenden Abschnitte dokumentieren die Entwicklung des ersten Falls.

Initiale spielbare Einzelspieler-Webapp (v0.1) für Holzhandel Gottlieb. Ein abgeschlossener Fall mit sechs Hinweisen, drei Verdächtigen, Fallakte, Schlussfolgerung, Punkten und drei Auszeichnungen. Kein Zeitlimit. Die Figuren und der Fall sind fiktiv.

## Spielstand

Native Browser-API `localStorage`, Schlüssel `gottlieb-holzdieb-v1`. Spielstand, Bestwert und Abzeichen bleiben im selben Browser erhalten. Kein Benutzerkonto, kein geräteübergreifender Abgleich und keine Online-Rangliste. Bei gesperrtem Speicher funktioniert die Sitzung weiter und zeigt den Speicherfehler an. „Fall neu beginnen“ bewahrt Bestwert und Auszeichnungen. Der Fall bleibt derselbe.

## Regeln

- Neuer Hinweis: 100 Punkte; erste Befragung: 50 Punkte.
- Richtig gelöst: 250 Punkte; Tipp: −50 Punkte; falsche Beschuldigung: −100 Punkte. Minimum: 0; Maximum: 1000.
- Die Täterauswahl benötigt Toraufnahme, Abholschein und drei Befragungen.
- Doppelte Funde und wiederholte Befragungen geben keine zusätzlichen Punkte.

## Umsetzung und Validierung

React 19.2.6 / Vinext 1.0.0-beta.5 aus dem bereitgestellten Sites-Starter. Installation, Build, Repository-Synchronisierung und Veröffentlichung verwenden die nativen Sites-Werkzeuge (Plugin 1.1.4, Stand 08.11.2026). Eigene Logik beschränkt sich auf Spiel und Darstellung.

- `node node_modules/typescript/bin/tsc --noEmit`
- `node --experimental-strip-types --test tests/game.test.ts`
- Standard-Build über Sites `build-site.mjs`.

Tastaturbedienbare Hotspots und Dialoge; reduzierte Animationen bei `prefers-reduced-motion`. Ton ist standardmäßig aus und wird nur nach Aktivierung über Web Audio erzeugt.

## Reifenspuren

Tatortbild nach Nutzerkorrektur: flachere, deutlich dezentere Reifenabdrücke. Die Bildanweisung fordert ungefähr 65 % weniger visuelle Prominenz, keine numerisch vermessene Bildänderung. In langsamen Kurven schneiden starre Hinterachsen die Bahn der gelenkten Vorderachse nach innen; Spuren können sich teilweise überlagern. Quelle: FHWA, Roadway Geometry and Truck Operating Characteristics, https://www.fhwa.dot.gov/reports/tswstudy/v2chap6.pdf (abgerufen 08.11.2026). Die Illustration ist keine berechnete Schleppkurvensimulation. Der Reifenhinweis allein identifiziert keinen Täter.


## Version 0.2 · Lebendige Szene und Waldklang

Native Canvas-2D-Animationen mit 62 getrennten Partikeln: Lichtstaub, fallende Blätter, Rauch, Bachreflexe, Vögel und Schmetterlinge. Lebensdauer, Phasen, Flugbahnen und Geschwindigkeit variieren unabhängig; Fensterlicht pulsiert langsam. Die Basisillustration und Reifenspuren bleiben erhalten. Pause-Schalter und `prefers-reduced-motion` werden berücksichtigt. Canvas stoppt außerhalb des sichtbaren Bereichs und bei verborgenem Tab.

Originale synthetische Klangkulisse über Web Audio: gefiltertes Wind-/Wasserrauschen, variierende Vogelrufe, gelegentliche Holzgeräusche, leise pentatonische Melodie und eigene Spielsignale. Drei native Lautstärkeregler: Wald & Bach 38 %, Musik 18 %, Spielsignale 45 %. Ton startet ausschließlich nach explizitem Klick; kein automatischer Start nach Neuladen. Mischwerte bleiben lokal gespeichert. Ein gemeinsamer AudioContext, Pausieren bei verborgenem Tab, Ende aller Timer und Quellen bei Mute/Unmount. Keine externen Audiodateien, Tracker oder bezahlten Audiogenerierungsdienste.

Hersteller-/API-Belege (geprüft 08.11.2026): https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API und https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API. Implementierung verwendet native Browser-Funktionen, kein selbstgebautes Plattform-/Deploy-/Job-System. Bestehende Sites-Werkzeuge bleiben für Veröffentlichung zuständig.

Prüfung: TypeScript; sieben Spieltests plus zwei Tests für Audiopräferenzen und Audio-Lebenszyklus; Browserprüfung von Klangaktivierung, Reglern und Animationspause. Die synthetischen Klänge sind keine Naturaufnahme. Die Audio-Lebenszyklustests instrumentieren die nativen Aufrufe; sie ersetzen keine akustische Abhörprobe.


## Version 0.2.1 · Kleiner Bach statt Rauschkulisse

Beide synthetischen Dauerrauschschichten sind entfernt. Stattdessen läuft eine lokal ausgelieferte CC0-Feldaufnahme eines kleinen Waldbachs von TRP (Freesound #567730), siehe public/audio/CREDITS.txt. 44 Sekunden, 128 kb/s, Höhen auf 2600 Hz begrenzt, Zielpegel -25 LUFS vor Wiedergabegain, leicht rechts platziert. Native AudioBufferSourceNode.loop; genau einmal laden und decodieren pro Audiokontext. Der neue Standard für Bach & Natur ist 24 %, Musik und Signale bleiben bei 18 % / 45 %. Bei der einmaligen Übernahme alter v1-Mischwerte sinkt die Naturlautstärke auf 65 % des zuvor gespeicherten Werts; v2-Werte werden danach unverändert respektiert. Kein automatischer Tonstart. Keine synthetische Rausch-Fallbackspur bei Ladefehlern.

Verifikation: MP3-Dauer und Codec mit ffprobe; TypeScript, neun Tests einschließlich einmaligem Asset-Laden und Ausschluss der früheren Rauschpuffer; Browserprüfung von Aktivierung, Reglern und Fehleranzeige. Technische Prüfung ist keine subjektive akustische Abnahme.
