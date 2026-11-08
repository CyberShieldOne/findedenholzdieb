# Originalgrafik in der verbundenen Babylon-Welt · 0.7.0

Stand 08.11.2026. Fortsetzung der vorhandenen 3D-Welt, keine neue Engine und keine neue Plattformsteuerung. Babylon.js 9.33.0 und Havok 1.3.14 bleiben unverändert eingebunden.

## Gestaltung aus den vorhandenen Bildern

Die fünf Originalbilder wurden aus der persönlichen Dateisammlung wieder geöffnet und betrachtet: Holzhändlerhof im Morgenlicht, Sonnige Schreinerwerkstatt, Alter Waldsteg, Wassermühle und Waldlager. Übernommene Gestaltungsmotive: warmes Morgenlicht, gealtertes Fachwerk, grünliche Fensterläden, Ziegeldächer, Stein-/Moossockel, Blumenkästen, dichter Laubwald und bepflanzte Bachränder. Die Hintergründe wurden nicht als flache Kulissen anstelle der begehbaren Geometrie eingesetzt und nicht automatisch in vollständige 3D-Modelle umgewandelt.

Die vorhandene Landschaft bleibt zusammenhängend. Hügel laufen jetzt in ebene Wege und Plätze aus; das gleiche Höhenfeld wird für sichtbare Fläche und Havok-Mesh-Kollision verwendet. Alle fünf Orte liegen weiter im selben Koordinatensystem.

## Originaler Detektiv

Die beiden Originaldateien wurden wiederhergestellt und gegen die bereits vorhandenen Spieldateien per SHA-256 verglichen: bytegleich.

| Datei | Original | Aufbau |
| --- | --- | --- |
| public/art/detective-depth-walk.png | Detektiv in acht Gehposen.png | 1774 × 887, vier Vorderansichten oben und vier Rückansichten unten |
| public/art/detective-walk.png | Acht Schritte des Trenchcoat-Detektivs.png | 2172 × 724, acht seitliche Gehphasen |

Babylon Mesh-Billboarding um die Y-Achse und ein alpha-getestetes StandardMaterial zeigen den Detektiv als räumlich positionierte Bildfigur. Die Blickrichtung relativ zur Kamera entscheidet zwischen Front, Rücken und Seite; UV-Transformationen wählen den Ausschnitt des Originalblatts. Die Gehphase hängt von der tatsächlichen Strecke ab. Ein enger bodengebundener Kontaktschatten verblasst beim Springen; die alpha-getestete Silhouette ist zusätzlich für den nativen ShadowGenerator eingetragen.

Das ist bewusst ein illustrativer Billboard-Charakter in einer echten 3D-Welt, kein vollständig modellierter oder gescannter 3D-Detektiv. Aus sehr hoher Kameraposition kann die flache Silhouette erkennbar werden; auch ihr Schatten hängt von der Billboard-Ausrichtung ab. Es gibt keine Skelett-/IK-Fußfixierung. Die vorhandene Havok-Kapsel bleibt für Bewegung und Kollision zuständig.

## Landschaft und Gebäude

- Prozedurale native DynamicTextures für feinkörnigen Boden, Holzmaserung, Mauerwerk, Kalkputz und überlappende Ziegel. Diese sind keine hochauflösenden fotografischen PBR-Scans; die Abmessungen liegen je nach Material bei 256 oder 512 Pixeln und werden gekachelt.
- Zusätzliche Fachwerkstreben, Giebelflächen, Fensterläden, Blumenkästen, Laternenkörper und steinerne Sockeldetails.
- 302 deterministisch gesetzte Bäume. Mehrteilige unregelmäßige Baumkronen ersetzen die bisherigen einzelnen groben Kronenkörper. Stämme haben native Havok-Kollisionen.
- Gras, kleine Pflanzen- und Blütenformen, Fensterblumen und mehrteilige Kronen werden mit nativen Thin Instances in 24-m-Zellgruppen dargestellt. Die komplette Welt wird weiterhin einmal geladen; die Zellgruppen sind keine selbstgebaute Streaming-Plattform.
- Brückenplankendetails, Pfosten, entfernte bewaldete Hügel, Dorf-/Kirchensilhouette und Burgkontur als zusätzliche echte Geometrie außerhalb der begehbaren Grenzen.
- Die höhere Grafikstufe verwendet mehr Bodendekoration. Beide Stufen müssen auf tatsächlichen Geräten noch auf Bildrate und thermische Dauerlast geprüft werden.

Dekoration ist nicht automatisch ein massiver Kollisionskörper: kleine Pflanzen und Fassadendetails bleiben visuelle Ausgestaltung. Gebäude, größere Requisiten, Brückengeländer und Baumstämme behalten ihre physische Begrenzung. Wege und ein Mindestabstand um alle Interaktionspunkte werden bei Baumplatzierung freigehalten.

## Herstellerbelege vor Umsetzung

- Babylon erklärt Sprites und Bildanimationen in einer räumlichen Szene: https://doc.babylonjs.com/features/featuresDeepDive/sprites/
- Verwendete Billboard-/Alpha-Test-Funktionen zusätzlich in den installierten Quelldateien von Babylon.js 9.33.0 geprüft: Mesh.BILLBOARDMODE_Y, StandardMaterial.MATERIAL_ALPHATEST, Texture.uScale/uOffset/vScale/vOffset.
- Native Thin Instances, Buffer, Sichtbarkeitsgrenzen und Schattenunterstützung: https://doc.babylonjs.com/features/featuresDeepDive/mesh/copies/thinInstances/
- Native Schatten: https://doc.babylonjs.com/features/featuresDeepDive/lights/shadows/

Kein neuer eigener Renderer, keine eigene Physik-Engine, keine zusätzliche Ausführungs-/Deployment-Steuerung. Eigene Funktionen beschreiben ausschließlich Spielfigur, Weltgeometrie und Gestaltung.

## Prüfung und bekannte Grenze

25 Tests bestehen. Neu geprüft: kamerabezogene Atlaswahl, alle acht Seitenphasen, Zykluswiederholung und deterministische Baumplatzierung mit Freiraum für Wege und Interaktionen. Die native Havok-Integration enthält jetzt auch die kompletten Baumkollisionen. Alle zwölf Hinweise und drei Zeugen bleiben entlang physisch begehbarer Routen erreichbar; Sprung, Flussgrenze und Brückenquerung bestehen.

Typprüfung und Produktionsbuild erfolgreich. Der Prüfbrowser meldet beim Erzeugen der Engine erneut `WebGL not supported`. Deshalb ist der neue Grafikstand NICHT visuell abgenommen und es gibt keinen gemessenen FPS-Nachweis. Die Nutzerbestätigung auf dem iPhone 15 galt 0.6.0 und wird nicht als Abnahme von 0.7.0 ausgegeben. Der sichtbare Fehlerzustand bleibt erhalten.

Die originalen PNGs liegen vollständig im nativen Sites-Quellstand. Die frühere GitHub-Binärsicherungslücke bleibt bestehen und betrifft nun auch die grafischen Voraussetzungen des gemalten 3D-Detektivs. Der Code ist in GitHub reviewbar; ein unabhängig vollständig wiederherstellbarer Medienstand wird nicht behauptet.

## Wiederverwendungsprompt

„Erweitere die bestehende Babylon-/Havok-Welt im illustrierten Stil der fünf Originalbilder. Verwende den originalen Detektiv über kamerabezogenes Y-Billboarding, alpha-getestete Sprite-Sheet-Ausschnitte und streckenabhängige Gehphasen. Erhalte echte Tiefenverdeckung und native Kollisionen. Baue Landschaft und Architektur als räumliche Geometrie aus, verwende prozedurale Materialien und native Thin Instances für wiederholte Vegetation. Halte Wege und Interaktionsplätze frei. Prüfe Bildwirkung und Performance auf einem WebGL-fähigen Zielgerät; behaupte keine vollständige 3D-Skelettfigur oder gemessene Bildrate ohne Nachweis.“
