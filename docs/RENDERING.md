# Rendering-Iteration 0.4.0 · 08.11.2026

## Entscheidung
PixiJS 8.22.0 mit WebGL als GPU-Renderer für das bestehende illustrierte 2,5D-Adventure. Die Spielregeln und Dialog-/Speicherlogik bleiben React-/TypeScript-Fachlogik. PixiJS übernimmt Canvas, Texturen, Ticker, Blurfilter und Ressourcen-Lifecycle. Kein eigener Renderer oder eigene Engine.

Herstellervergleich vom 08.11.2026:
- PixiJS: WebGL wird für Produktion empfohlen, WebGPU ist in der Dokumentation noch experimentell. https://pixijs.com/8.x/guides/components/renderers
- Phaser 4: etablierte vollständige 2D-Engine mit neuem WebGL-Renderer und eigener Kamera-/Spielobjektarchitektur. Für diesen Grafikumbau war keine Migration der vorhandenen Spielregeln nötig. https://phaser.io/news/2026/04/phaser-4-renderer-faster-cleaner-and-built-for-modern-games
- Babylon.js: vollständiger 3D-Stack mit PBR, glTF, Kameras, Animation und Physik; passende Option für einen ausdrücklich geplanten echten 3D-Neuaufbau. https://www.babylonjs.com/specifications/

## Geliefert
Fünf neue eigens generierte Umgebungsbilder mit einheitlicher illustrativer Art Direction (je 1586 × 992 Pixel), eine transparente Figurenleiste (1774 × 887 Pixel, vier Figuren), GPU-Lichtschleier und schwebende Lichtpartikel, ruhige Figurenbewegung und stilistisch passendes Interface. Rücksicht auf reduzierte Bewegung. Statischer Bildfallback bei nicht verfügbarem WebGL. Der neue Fall ist jetzt die Startseite; Fall 001 bleibt unter /fall-001 erreichbar.

Keine Behauptung von 4K-Assets, voll geriggten Figuren oder vollständigem Echtzeit-3D. Die jetzige Figurenanimation ist eine animierte Bildfigur, kein mehrphasiger Walkcycle. Nächster separater Qualitätsabschnitt: echte richtungsabhängige Laufzyklen und exakt zur Szenengeometrie abgestimmte Laufzonen/Interaktionsorte.

## DoD und Prüfung
Neue Assets in allen fünf Ortsansichten eingebunden; im Browser ein Canvas und das tatsächlich geladene Ortsbild nachgewiesen. Sichtprüfung von Hof und Werkstatt. Vorhandener Fortschritt bleibt lesbar. 14 Regel-/Audiotests und Produktionsbuild bestanden; Typprüfung bestanden. Keine gemessene FPS-/4K-/Geräteleistung behauptet. Unabhängige Hör-/Spielerprüfung offen.

Assets sind in public/art gespeichert und im nativen Sites-Quellstand enthalten. Die bekannte GitHub-Übertragungsgrenze für große Binärdateien bleibt separat dokumentiert; eine vollständige unabhängige GitHub-Asset-Sicherung wird nicht behauptet.
