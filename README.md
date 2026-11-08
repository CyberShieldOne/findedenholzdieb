# Finde den Holzdieb · Gottlieb Arcade

Fall 001 und Fall 002 „Die falsche Fuhre“: fünf begehbare Orte, zwölf Beobachtungen, drei Deduktionskapitel, kontextabhängige Gespräche und lokaler Fortschritt.

## Entwicklung
Node.js >=22.13.0; pnpm-Version aus package.json. Installation: pnpm install. Start: pnpm dev. Build: pnpm build. Typprüfung: pnpm exec tsc --noEmit. Tests: node --experimental-strip-types --test tests/*.test.ts.

## Prüfungen und Grenzen
14 Tests, Typprüfung und Produktionsbuild bestanden. Fall 002 wurde im Browser mit allen zwölf Beobachtungen bis zur Auflösung gespielt, einschließlich falscher Antwort, Gesprächen, Ortswechsel und Fortsetzung nach Reload. Unabhängiges Erstspielerfeedback und Hörprüfung stehen aus.

## Asset-Sicherung
Code, Logo und Audio sind enthalten. Das originale Hofbild von Fall 001 bleibt vollständig in der gespeicherten Sites-Version erhalten und muss für einen eigenständigen Checkout am Originalpfad wiederhergestellt werden. Exakte Version, Größe und Blob-ID: docs/ASSETS.md. Der veröffentlichte Fall 001 hat das Bild weiterhin. Die Kopie wird nicht als vollständig unabhängig wiederherstellbar bezeichnet.

## Produktionsstand
App-Source-Commit in Sites: b53335de1374f720d60973326dc56ef2e8988808, Spielrelease 0.3.1. Vorhandene Sites-Konfiguration und Starterfunktionen wurden übernommen. Keine Dify-/Delivery-Controller-Integration und keine Echtgeldfunktionen in dieser Erweiterung. Details und nächste Schritte: docs/STATUS.md.
