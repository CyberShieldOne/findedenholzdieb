# Szenenabhängiger Figurenmaßstab · 0.8.0

## Befund und Umsetzung

Im angehängten Werkstattbild wirkten Figuren gegenüber der Werkbank zu klein. Der Quellcode verwendete feste 128-/140-Pixel-Höhen und für sämtliche Orte denselben Faktor `perspective(y)*1.22`. Das Verhältnis zur Bildfläche veränderte sich damit bei anderer Fensterbreite. Eine metrische Referenz pro Hintergrund fehlte.

`lib/visual-scale.ts` definiert jetzt Körperhöhen (Detektiv 1,78 m; Bruno 1,82 m; Mia 1,70 m; Theo 1,76 m) sowie je Hintergrund einen Horizont und ein Referenzobjekt. Die Referenzen sind geschätzte künstlerische Kalibrierungen, keine vermessenen realen Räume. Werkbank: 0,90 m, Tischkante bei 40 %, Boden bei 58 %, Horizont bei 25 % Bildhöhe. An ihrer Tiefe ist eine Figur proportional zu ihrer Meterhöhe; weiter vorne wird sie entsprechend größer.

Formel (alle Bildkoordinaten in Prozent):

`Figurenhöhe% = Körperhöhe_m × (Referenzfuß_y − Referenzoberkante_y) / Referenzhöhe_m × (Figurenfuß_y − Horizont_y) / (Referenzfuß_y − Horizont_y)`

Die Ergebnisgröße ist ein Prozentanteil der Szenenhöhe. Native CSS-Prozentgrößen und `aspect-ratio` passen Hintergrund und Figuren gemeinsam an die Bildfläche an. Es wird kein eigener Resize-Controller gebaut. Spieler und NPCs nutzen dieselbe Formel; Beschriftungen behalten lesbare UI-Größen. Das Hintergrundformat entspricht dem Original 1586 × 992; bei künftigem Zuschneiden/`object-fit:cover` müssen auch die Bildkoordinaten transformiert werden.

Die Alphagrenzen der acht Seitenphasen und der acht Front-/Rückenbilder wurden bei Alpha >= 128 aus den Original-PNGs ausgelesen. Die Sprite-Leinwand wird pro Phase auf sichtbare Körperhöhe und Fußkante ausgerichtet; die Bilddateien bleiben unverändert. Mia/Bruno/Theo erhalten ebenfalls einen Ausgleich des Bildrands. Ein reiner Bildhintergrund enthält keine Tiefenkarte: Ein korrekt skalierter Mensch kann deshalb weiterhin vor einem gemalten Möbelstück erscheinen, das ihn eigentlich verdecken müsste. Verdeckungsmasken wären ein eigener folgender Grafikabschnitt.

## Echte 3D-Welt

Babylon verwendet dieselben Körperhöhen in Weltmetern. Die Originaldetektiv-Billboards kompensieren je Frame die transparenten Ränder und verankern die Füße. Prozedurale NPC-Hierarchien werden mit Babylons `getHierarchyBoundingVectors(true)` auf ihre Körperhöhe normalisiert und am Boden ausgerichtet. Die native Kamera berechnet Perspektive; die Modellgröße wird nicht mit Kameradistanz verändert. Havok-Kapsel, Weltgeometrie und Spielregeln bleiben erhalten.

## Abnahmekriterien

- Fünf explizite Szenenreferenzen; NPC und Spieler verwenden dieselbe Projektion.
- An gleicher Tiefe entspricht das Größenverhältnis dem Verhältnis der Körperhöhen.
- Figur wird im Vordergrund größer; Bildflächengröße und Figurenhöhe skalieren zusammen.
- Gehphasen behalten Körperhöhe und Fußverankerung trotz transparenter Ränder.
- Bestehende Ermittlungs-, Audio- und Havok-Tests bleiben erfolgreich.
- Typprüfung, Build und verfügbare Browserdarstellung prüfen; fehlende Zielgerät-/WebGL-Abnahme offen ausweisen.

## Herstellerbelege vor Umsetzung

Geprüft 09.11.2026. Eingesetzte Versionen: `package.json`, Babylon.js 9.33.0; native Browser-CSS-Implementierung.

- MDN, Containing Block: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_display/Containing_block – prozentuale Höhen absolut positionierter Elemente beziehen sich auf den umgebenden Block.
- MDN, aspect-ratio: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/aspect-ratio – Verhältnis aus automatisch bestimmter Breite und festgelegter Höhe.
- Babylon, Bounding Boxes: https://doc.babylonjs.com/features/featuresDeepDive/mesh/displayBoundingBoxes/ – native Hierarchie-Bounds.
- Installierter Babylon-Quellbeleg: `node_modules/@babylonjs/core/node.js`, `getHierarchyBoundingVectors`.

## Wiederverwendbarer Prompt

> Nutze den gemeinsamen metrischen Figurenmaßstab in lib/visual-scale.ts. Kalibriere jeden gemalten Hintergrund über Horizont, Referenzfuß, Referenzoberkante und angenommene Referenzhöhe. Berechne die Körperhöhe aus Szenentiefe und Bildhöhe für Spieler und NPCs identisch. Gleiche transparente Sprite-Ränder aus und verankere Füße und Kontaktschatten. In Babylon bleiben Körpergrößen in Weltmetern konstant; nutze native Hierarchie-Bounds und Kameraprojektion. Prüfe Referenzverhältnis, nahe/ferne Positionen und Größenänderung der Bildfläche. Bezeichne geschätzte Bildkalibrierungen als solche.
