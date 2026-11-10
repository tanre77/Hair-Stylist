> **Hinweis:** Diese Übersetzung ist maschinell unterstützt. Englisch ist maßgeblich.

Sprachen: [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · **[Deutsch](README.de.md)** · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [العربية](README.ar.md) · [हिन्दी](README.hi.md) · [Русский](README.ru.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [Bahasa Indonesia](README.id.md) · [Polski](README.pl.md) · [Nederlands](README.nl.md) · [Українська](README.uk.md) · [Filipino](README.fil.md) · [Kiswahili](README.sw.md)

# B and S

Barbiere und Salons. Buchen Sie einen Stuhl, wählen Sie eine Leistung und eine Person oder die erste freie Zeit, und zahlen Sie eine Anzahlung oder den ganzen Besuch.

Die Beispielsalons liegen um Powell und Columbus. Im Demomodus bleiben das Terminbuch, die Zahlungen und das Studio auf diesem Gerät.

## Was Sie tun können

- Eine Leistung mit Preis, Dauer und Pufferzeiten wählen
- Eine Person oder jeden freien Stuhl wählen
- Einen echten freien Termin nehmen, der nicht doppelt belegt wird
- Eine Anzahlung oder den ganzen Besuch zahlen, mit festem oder eigenem Trinkgeld
- Mit Karte oder Venmo zahlen. Apple Pay ist eine gekennzeichnete Demozahlung und bleibt aus, sobald Schlüssel für Live-Karten gesetzt sind
- Einen Besuchslink öffnen, um umzubuchen oder zu stornieren
- Eine Live-Kartenzahlung nur über diesen Link oder als angemeldeter Inhaber erstatten, und nur innerhalb des Zeitfensters des Salons
- Das Studio öffnen: Tages- und Wochenkalender, Arbeitszeiten, Leistungen, gesperrte Zeit, Kundschaft sowie Regeln für Storno und Nichterscheinen

Der Demomodus ist der Standard, wenn Kartenschlüssel fehlen. Er ist auch an, wenn `VITE_DEMO_MODE=1` gilt oder die Seite mit `?demo=1` geöffnet wird. Besucher kommen als Demogast herein. Es gibt keinen Anmeldebildschirm. Setzen Sie `VITE_DEMO_MODE=0` und ergänzen Sie die Schlüssel unten, um Live-Kartenzahlungen und die Anmeldung des Inhabers zu nutzen.

Kartennummern werden im Browser geprüft und verworfen. Das Terminbuch speichert nur ein Token, die Kartenmarke und die letzten vier Ziffern.

Eine Live-Kartenbelastung wird auf dem Server aus der veröffentlichten Leistung, der Anzahlungsregel des Salons und einem Trinkgeld von höchstens $500 berechnet. Ein vom Browser gesendeter Betrag, der nicht übereinstimmt, wird abgelehnt. Eine Erstattung braucht den signierten Zahlungsdatensatz plus den Besuchslink oder eine Inhabersitzung, und sie darf das Gezahlte nicht übersteigen.

## Umgebung

| Variable | Wo | Zweck |
| --- | --- | --- |
| `VITE_DEMO_MODE` | Öffentlich | `1` erzwingt den Demomodus. `0` schaltet ihn aus. Ohne Wert folgt er den Schlüsseln. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Öffentlich | Kartenfeld. Stripe wird verwendet, wenn dieser Schlüssel gesetzt ist. |
| `STRIPE_SECRET_KEY` | Server | Legt Belastungen an und erstattet sie. Wird nie an den Browser ausgegeben. |
| `VITE_SQUARE_APPLICATION_ID` | Öffentlich | Anwendungs-ID für Web-Zahlungen, verwendet wenn Stripe nicht gesetzt ist. |
| `VITE_SQUARE_LOCATION_ID` | Öffentlich | Standort dieser Anwendung. |
| `SQUARE_ACCESS_TOKEN` | Server | Belastet und erstattet. Wird nie an den Browser ausgegeben. |
| `OWNER_EMAIL` | Server | Anmeldung im Studio, nur wenn der Demomodus aus ist. |
| `OWNER_PASSWORD` | Server | Passwort für die Anmeldung im Studio. |
| `OWNER_NAME` | Server | Name, der nach der Anmeldung angezeigt wird. |
| `OWNER_SESSION_SECRET` | Server | Optional. Signiert die Sitzung des Inhabers. Fehlt er, gilt das Passwort des Inhabers. |
| `PAYMENT_TICKET_SECRET` | Server | Optional. Signiert den Zahlungsdatensatz für Erstattungen. Fehlt er, gilt das Geheimnis des Zahlungsdienstes. |

`?demo=1` schaltet den Demomodus ein, auch wenn Schlüssel vorhanden sind.

## Installieren

Auf dem iPhone: Teilen, dann Zum Home-Bildschirm. Auf Android: Browsermenü, dann App installieren.

Für Übersetzer: [docs/TRANSLATIONS.md](docs/TRANSLATIONS.md).
