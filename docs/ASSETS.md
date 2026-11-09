# Assetnachweis und bekannte GitHub-Lücke

Vorhandene Medien bleiben im Sites-Quellstand und in der nativen gespeicherten Version vollständig erhalten. In der GitHub-Kopie ist das Original `public/holzhof.png` derzeit nicht enthalten: Das GitHub-Werkzeug akzeptiert zwar Binärblobs, aber der verfügbare Dateileser kürzt den einzelnen Übergabewert bei etwa 1 MiB; der reguläre Git-Push hat hier keinen Schreib-Login. Es wurde keine Ersatzdatei und kein nicht auflösbarer LFS-Zeiger erzeugt.

| Pfad | Bytes | Git-Blob-ID | GitHub |
| --- | ---: | --- | --- |
| public/gottlieb-logo.jpeg | 60181 | c2385898d7bab57fb18ddef6357eeacaba6eee63 | Originalblob übertragen |
| public/audio/kleiner-bach.mp3 | 705141 | 58772dcb1f6b875fc23f1a101ea0952ba21a0942 | Originalblob übertragen |
| public/holzhof.png | 3275370 | 38223db1ac857af7cfcf3fa6bf1669c0a9ec19ab | Übertragung offen; vollständig in Sites gesichert |

Unveränderter dauerhafter Bezug für das Hofbild: Sites-Projekt `appgprj_6af05cd4aa288191abe5fc87cd4015dc`, gespeicherte Version 4, ID `appgprj_6af05cd4aa288191abe5fc87cd4015dc~appgver_187f814244ac8191b5a098a2102eccc2`, Source-Commit `a5bd4fef08a40a86ce98b5c916f29aa95c1d906c`. Natives Build-Archiv `file_0000000065108243b25a147e70c76a60`, Archiv-SHA256 `56a2e395f841eb8234adae284346d404659fec8808ab3c17fa150c33a01a3b6e`. Das ist ein versionierter Produktbezug, kein öffentlicher Download-Link. Der Eigentümer kann die Quelle/Version über Sites abrufen. Für einen eigenständigen GitHub-Checkout muss dieses Original an seinen Pfad zurückkopiert und anhand der Blob-ID geprüft werden.

Fall 002 zeichnet seine Szenen und Figuren als SVG und benötigt dieses Bild nicht. Der veröffentlichte Fall 001 lädt weiterhin das intakte Bild aus der bereitgestellten Sites-Version. Credits und Rechte der Audioquelle stehen in public/audio/CREDITS.txt. Die GitHub-Kopie wird wegen der offenen Bildübertragung nicht als vollständig selbständig wiederherstellbar bezeichnet.
