# Falkenforst · 3D-Bauabschnitt 0.6.0

Aktualisierung 0.7.0: Der Originaldetektiv wird nun als animierte Billboard-Bildfigur in der räumlichen Szene dargestellt; Gelände, Fassaden und Vegetation sind erweitert. Siehe [PAINTERLY-WORLD.md](PAINTERLY-WORLD.md) und [STATUS.md](STATUS.md). Die folgenden Abschnitte dokumentieren den ursprünglichen 3D-Bauabschnitt.

Stand: 08.11.2026. Separate experimentelle Route `/welt`; die Startseite und `/abenteuer` bleiben die bisherige illustrierte Ermittlung. Auf der Startseite führt ein sichtbarer Link zur freien Welt. Keine neue Ausführungs-, Freigabe- oder Deployment-Plattform.

## Ergebnis und Abnahmegrenze

Eine zusammenhängende, begrenzte Landschaft von 160 × 140 Metern ersetzt in dieser Vorschau den Wechsel zwischen fünf Hintergrundbildern. Holzhof, Werkstatt, Bachbrücke, Mühle und Außenlager sind über begehbare Außenbereiche verbunden. WASD/Pfeiltasten bewegen relativ zur Kamera, Shift läuft schneller, Leertaste springt; Ziehen/Scrollen steuert die native Orbitkamera. E oder der eingeblendete Interaktionsknopf untersucht nahe Beobachtungen bzw. Gesprächspartner. Die Karte dient der Orientierung, nicht dem Versetzen.

Gelände, Gebäudekörper, Brückendeck/-geländer, Baumstämme, Holzstapel, Kisten, Transporter und Personen haben native Havok-Kollisionen. Die Wasserquerung ist nur über die Brücke vorgesehen; Schwimmen ist noch kein Spielsystem. Die Welt endet an einer begrenzten Waldfläche. Die Gebäude haben in diesem Abschnitt keine betretbaren Innenräume.

Figuren sind einfache dreidimensionale, gegliederte Modelle. Babylon AnimationGroup animiert Arme und Beine streckenabhängig. PBR-Materialien, Sonnenlicht, Himmelsfüllung und ShadowGenerator ersetzen die Bildschatten. Das ist eine geometrische Erstfassung, keine fertig ausgearbeitete Figuren-/Umgebungskunst und keine IK-Fußfixierung. Wiederholte Vegetation nutzt native Instanzen und eine entfernte Abschaltstufe; die gesamte kleine Welt wird einmal geladen. Es gibt noch kein nachladendes Chunk-System oder unendliches Terrain.

Der Prüfbrowser meldet beim Erzeugen der Babylon-Engine ausdrücklich `WebGL not supported`. Der sichtbare Fehlerzustand bietet deshalb den bisherigen illustrierten Fall an. Grafische Abnahme, Kamera-Verdeckung und tatsächliche Bildrate im WebGL-fähigen Browser sind OFFEN. Kein Screenshot einer erfolgreich gerenderten Welt, kein 60-FPS- oder AAA-Qualitätsnachweis wird behauptet. Deshalb bleibt `/welt` als experimentelle Vorschau vom bisherigen Einstieg getrennt.

## Untersuchung von World of ClaudeCraft

Geprüfter Quellstand: `levy-street/world-of-claudecraft`, main `ef93e018f6196c5d9b8a0052eac6fb17d7b22a93`, package.json 0.45.8, Three.js 0.185.1. Gelesen wurden gezielte Dateien statt eines vollständigen Repository-/Assetimports.

| Mechanismus im Vorbild | Konkreter Quellbeleg | Übertragung auf Holzdieb |
| --- | --- | --- |
| Spielkern ohne DOM/Renderer, gemeinsame Weltschnittstelle | README, Abschnitte Architecture und Project layout | Vorhandene Ermittlungsregeln bleiben in `lib/adventure.ts`; 3D liest nur Platzierungen und meldet Interaktionen. |
| Reproduzierbare Welt | `src/sim/world_seed.ts`: fester WORLD_SEED 20061 | Handgesetzte Orte/Wege, deterministisch platzierte Dekoration. Hinweise und Questobjekte werden nicht zufällig verteilt. |
| Höhenfeld und authored-map Übergänge | `src/sim/authored_terrain_base.ts` | Ein Höhenfeld liefert sowohl sichtbare Geländevertices als auch den echten Kollisionskörper. |
| Collider-Raster als Broadphase | `src/sim/collider_cells.ts`: 16er-Zellen, inflatierte AABBs | Native Havok-Broadphase verwenden; kein eigenes Collider-Grid nachbauen. |
| Räumliche Abfragen | `src/sim/spatial.ts`: SpatialGrid, Radiusabfragen | Bei nur 15 Interaktionen reicht die direkte Distanzabfrage. Größere NPC-Mengen erst nach Profiling. |
| Lokale Pfadplanung | `src/sim/pathfind.ts`: A*, 1-Yard-Raster, Steigungs-/Wasserregeln, Glättung | Der erste Abschnitt verwendet direkte manuelle Bewegung. Später native Navmesh-Lösung für NPCs/Klickwege evaluieren; A* nicht blind übernehmen. |
| Nachlaufende Kamera | `src/render/camera_boom_core.ts`: kritisch gedämpfte Feder, Leash/Snap | Native ArcRotateCamera mit Figurenziel, Zoomgrenzen und Kamerakollision. Keine Kopie des Spring-Arm-Algorithmus. |
| Sichtweite und Ladegrenze | `src/render/chunk_residency_core.ts`: sichtabhängige Grenze vor noch nicht gebautem Terrain | Kleine vollständig geladene Welt zuerst; Streaming erst bei belegtem Bedarf. |
| Vegetations-LOD | `src/render/foliage_lod.ts`: Detail-/Impostor-/Nebel-Übergänge | Native Instanzen und entfernte Abschaltung als erste Stufe; spätere echte LOD-Modelle in einem getrennten Grafikpaket. |
| Lichtprofile | `src/render/outdoor_light_rig_core.ts` | Sonnenlicht, Himmelsfüllung und Schatten gehören zu einer gemeinsamen 3D-Szene. |

Quelllinks sind unter https://github.com/levy-street/world-of-claudecraft/tree/ef93e018f6196c5d9b8a0052eac6fb17d7b22a93 erreichbar. Die obige Analyse ist kein vollständiger Audit des MMOs. Aus dem Vorbild wurde kein Code oder Medienpaket übernommen. Sein Code ist MIT-lizenziert; Medien haben laut README/CREDITS teils gesonderte, eingeschränkte Rechte. Bekanntheit von Spielcode ist keine allgemeine Medienfreigabe.

## Eingesetzte Herstellerfunktionen

Vor Implementierung am 08.11.2026 geprüft; tatsächlich installiert: Babylon.js `@babylonjs/core` 9.33.0, Havok `@babylonjs/havok` 1.3.14. Die neuere 9.35.0 fiel unter die vorhandene Mindestalterregel der Paketverwaltung; diese Regel wurde nicht umgangen.

- Character Controller, Kapsel, Bodenkontakt, Bewegungsberechnung und Integration: https://doc.babylonjs.com/features/featuresDeepDive/physics/characterController/
- Havok/WASM aus dem installierten Paket, im eigenen Build gebündelt: https://doc.babylonjs.com/features/featuresDeepDive/physics/havokPlugin/
- Native Schatten: https://doc.babylonjs.com/features/featuresDeepDive/lights/shadows/
- Instanzen/Thin Instances und ihre Sichtbarkeitsgrenzen: https://doc.babylonjs.com/features/featuresDeepDive/mesh/copies/thinInstances/
- Die verwendeten API-Signaturen wurden zusätzlich in `node_modules/@babylonjs/core/Physics/v2/characterController.d.ts` und der Version 9.33.0 geprüft.

## Dateiverantwortung

| Datei | Aufgabe |
| --- | --- |
| `lib/world-layout.ts` | Weltmaße, Orte, Gebäude, Requisiten, Wege, Hinweise, Höhenfeld, gespeicherte Position validieren |
| `lib/world-physics.ts` | Native statische Kollisionskörper und Havok-CharacterController konfigurieren |
| `lib/openworld-runtime.ts` | Babylon-Szene, native Kamera, Licht, Materialien, 3D-Figuren, Instanzen, Eingabe, Render-Lifecycle |
| `components/open-world.tsx` | Verzögertes Laden, React-Anbindung, Entsorgung, sichtbarer Fehlerzustand |
| `app/welt/page.tsx` | Spieloberfläche, Karte, Dialoge und bestehende Schlussfolgerungen |
| `tests/world-3d.test.ts` | Echte Havok-WASM-Integration ohne Grafik über Babylon NullEngine |

Der vorhandene Fallfortschritt bleibt unter `gottlieb-fall-002` kompatibel. Die neue Weltposition liegt getrennt unter `gottlieb-world-pose`, weil Bildprozente keine 3D-Meterkoordinaten sind. Beide Ansichten teilen Beobachtungen und Schlussfolgerungen; gleichzeitig offene Ansichten werden nicht live synchronisiert.

## Prüfbare Bauabschnitte

| Abschnitt | Definition of Done | Status |
| --- | --- | --- |
| Räumlicher Spielkern | Gebäude/Fluss blockieren; Brücke verbindet die Ufer; alle zwölf Hinweise und drei Zeugen physisch erreichbar; Sprung kehrt zum Boden zurück; alte Spiel-/Audioregeln bestehen | In nativen Havok-Integrationstests geprüft |
| Browser-Funktion | 3D startet im Zielbrowser; Kamera und Bewegung bedienbar; vollständiger Ermittlungsdurchlauf; Speichern/Neuladen; keine Konsolenfehler | WebGL-Abnahme offen; Fehlerzustand im Prüfbrowser belegt |
| Hochwertige Kunst | Detaillierter modularer Holzhof, mindestens ein geriggtes GLB-Figurenmodell mit Idle/Walk/Run, einheitlicher Maßstab/PBR, keine sichtbaren Fußgleiter im Zieltest | Nächster eigenständiger Abschnitt |
| Größere Welt | Erst gemessenes CPU/GPU-/Ladebudget; dann Engine-LOD, AssetContainer/Instanzen, gegebenenfalls native Navmesh-/Streaming-Bausteine | Noch nicht benötigt/implementiert |

## Arbeit ohne überfüllten Chat

Die Browser-Engine berechnet jeden Bewegungsschritt lokal. Dafür wird kein Modell pro Frame aufgerufen. Gesprächskontext dient Entscheidungen und begrenzten Änderungen; das Repository hält Quellcode, Weltdefinition und Übergabestand.

Praktische Arbeitsgrenzen, keine behaupteten Produktlimits:
1. Pro Iteration ein abnehmbares Ziel, wenige betroffene Module, ein überprüfbarer Commit und klare offene Grenzen.
2. Nur relevante Dateien/Ausschnitte lesen; Verzeichnislisten und Testausgaben vor Ausgabe filtern. Keine kompletten Repository-Dumps.
3. Binärdateien direkt als Dateien/GLB/Texturen bearbeiten, nicht als Base64 im Gespräch. Nur Pfad, Größe, Herkunft und Hash berichten.
4. Bei engem Kontext neue Unterhaltung mit Repo, Branch, Commit, diesem Dokument, konkretem nächsten Ziel und bekannten Blockern starten. Nicht den gesamten Thread kopieren.
5. Bestehende GitHub-/Sites-Funktionen für Quellstand und Veröffentlichung verwenden. Keine zusätzliche Queue, Wiederholungs-, Freigabe- oder Deployment-Steuerung bauen.

Für die jetzige kleine Singleplayer-Welt reichen ChatGPT-Entwicklungsumgebung, GitHub, Sites und die eingebundenen Engines. Für individuelle hochwertige Figuren/Gebäude ist Blender mit glTF/GLB-Export das passende externe Fachwerkzeug; fertige lizenzierte Modellpakete sind ebenfalls möglich. Ein zusätzlicher Multiplayer-Server ist erst bei einer ausdrücklichen Mehrspieleranforderung relevant. Größere externe Arbeiten werden als konkrete Asset-Ergebnisse eingebunden, nicht als riesige Gesprächsantworten.

Fortsetzungsprompt: „Arbeite in CyberShieldOne/findedenholzdieb am aktuellen PR-Stand. Lies docs/OPEN-WORLD.md. Nächstes Ziel: grafische und funktionale WebGL-Abnahme von /welt auf einem geeigneten Browser. Prüfe Bewegung, Kameraverdeckung, alle 15 Interaktionen, vollständige Auflösung und Speichern/Neuladen. Behebe beobachtete Fehler. Führe keine neue Plattformsteuerung ein. Berichte Commit, Prüfbelege und verbleibende Grenzen. Erst danach den nächsten Grafikabschnitt beginnen.“
