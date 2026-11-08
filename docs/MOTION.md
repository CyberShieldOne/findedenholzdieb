# Bewegungsiteration 0.5.0 · 08.11.2026

## Umsetzung und Abnahme

Matter.js 0.20.0 übernimmt die Top-down-Kollisionssimulation mit festen 1/60-s-Schritten, Trägheit, begrenzter Beschleunigung, Reibung und Bremsweg. Die projektspezifische Bodenprojektion überführt Meterkoordinaten in Bildschirm-Fußpunkte; die Figur wird in der Tiefe kleiner. Begehbare konvexe Bodenflächen sind für alle fünf Räume manuell definiert. Klickziele außerhalb werden auf diese Flächen begrenzt. Keine eigene Physik-Engine oder allgemeine Plattformsteuerung.

Die Schrittphase hängt von der tatsächlich zurückgelegten Strecke ab. Acht Seitenlaufphasen, vier Vorder- und vier Rückansichten wurden aus dem bestehenden Figurendesign generiert. Linksbewegung spiegelt den Seitenlauf. Beim Stillstand bleibt die Phase stehen. Feste Fußpunkte und Tiefensortierung gelten für Spielfigur und Gesprächspartner. Ein enger Kontaktschatten und eine entlang des jeweiligen Szenenlichts verzerrte Silhouette verbinden die Figur mit dem Boden. Helligkeit, Schattenrichtung und Deckkraft sind pro Szene abgestimmt.

Die Hintergründe sind gemalte Bilder: Es existieren keine vollständigen 3D-Oberflächen, Materialnormalen oder Tiefenkarten. Deshalb sind Schatten und Beleuchtung bewusste 2,5D-Näherungen, kein Raytracing und keine vollständige physikalische Lichtsimulation. Die Bodenflächen bilden nicht jedes sichtbare Brett, jede Stufe oder jedes Wasserhindernis geometrisch ab. Exakte Vordergrundverdeckung erfordert zusätzliche ausgeschnittene Szenenebenen. Die generierten Animationsphasen sind kein Skelett-Rig mit IK-Fußfixierung; geringe Stil-/Posenunterschiede können bleiben.

## Nachweise

19 automatisierte Tests bestehen, einschließlich Bodenprojektion, perspektivischer Skalierung, Zielbegrenzung, Beschleunigen/Ankommen/Bremsen, Stillstandsphase und Erreichbarkeit aller zwölf Belege und drei Zeugen. Bestehende Spiel-/Audiotests bleiben grün. Typprüfung und Produktionsbuild vor Veröffentlichung. Browser: Bewegungsdarstellung, Schatten und Annäherung geprüft; keine gemessene Bewegungs-Capture- oder physikalische Lichtabnahme behauptet.

## Herstellerquellen und Entscheidung

Abgerufen 08.11.2026:
- Matter.js 0.20.0 Body, Velocity, Friction: https://brm.io/matter-js/docs/classes/Body.html
- PixiJS v8 Szene/Transformationen: https://pixijs.com/8.x/guides/components/scene-objects
- Spine IK erklärt Fußkontakt über ein Skelett; IK ist nicht Teil von Spine Essential: https://esotericsoftware.com/spine-ik-constraints
- Babylon.js unterstützt 3D-Fuß-/Bodenreferenzen beim Retargeting: https://doc.babylonjs.com/features/featuresDeepDive/animation/animationRetargeting

Spine und Babylon wurden recherchiert, nicht installiert. Kein Lizenzkauf und kein Wechsel zu vollständigem Echtzeit-3D. Originalanimationsgrafiken liegen in public/art und im nativen versionierten Sites-Quellstand; die dokumentierte GitHub-Binärübertragungsgrenze bleibt bestehen.
