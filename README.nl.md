> **Let op:** Deze vertaling is machine-ondersteund. Het Engels is leidend.

Talen: [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [العربية](README.ar.md) · [हिन्दी](README.hi.md) · [Русский](README.ru.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [Bahasa Indonesia](README.id.md) · [Polski](README.pl.md) · **[Nederlands](README.nl.md)** · [Українська](README.uk.md) · [Filipino](README.fil.md) · [Kiswahili](README.sw.md)

# B and S

Barbiers en salons. Boek een stoel, kies een behandeling en een persoon of de eerste vrije tijd, en betaal een aanbetaling of het hele bezoek.

De voorbeeldzaken liggen rond Powell en Columbus. In demomodus blijven het boek, de betalingen en de studio op dit apparaat.

## Wat je kunt doen

- Een behandeling kiezen met een prijs, een duur en buffers
- Een persoon kiezen of een willekeurige vrije stoel
- Een echte open plek nemen die niet dubbel wordt geboekt
- Een aanbetaling of het hele bezoek betalen, met een vaste of eigen fooi
- Betalen met kaart of Venmo. Apple Pay is een gelabelde demobetaling en blijft uit wanneer er sleutels voor live kaarten zijn
- Een bezoeklink openen om te verzetten of te annuleren
- Een live kaartbetaling alleen terugbetalen vanaf die link, of als ingelogde eigenaar, en alleen binnen het venster van de zaak
- De studio openen: dag- en weekkalender, personeelsuren, behandelingen, geblokkeerde tijd, klanten, en regels voor annuleren en niet komen opdagen

Demomodus is de standaard als de kaartsleutels ontbreken. Hij staat ook aan bij `VITE_DEMO_MODE=1` of als de pagina wordt geopend met `?demo=1`. Bezoekers komen binnen als demogast. Er is geen aanmeldscherm. Zet `VITE_DEMO_MODE=0` en voeg de sleutels hieronder toe voor live kaartbetalingen en aanmelden als eigenaar.

Kaartnummers worden in de browser gecontroleerd en weggegooid. Het boek bewaart alleen een token, het merk en de laatste vier cijfers.

Een live kaartafschrijving wordt op de server geprijsd vanuit de gepubliceerde behandeling, het aanbetalingsbeleid van de zaak en een fooi van hoogstens $500. Een bedrag dat de browser stuurt en dat niet klopt, wordt geweigerd. Een terugbetaling heeft het ondertekende betalingsbewijs nodig plus de bezoeklink of een eigenaarssessie, en mag niet hoger zijn dan wat is betaald.

## Omgeving

| Variabele | Waar | Doel |
| --- | --- | --- |
| `VITE_DEMO_MODE` | Openbaar | `1` dwingt demomodus af. `0` zet hem uit. Zonder waarde volgt hij de sleutels. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Openbaar | Kaartveld. Stripe wordt gebruikt wanneer deze sleutel is gezet. |
| `STRIPE_SECRET_KEY` | Server | Maakt afschrijvingen aan en betaalt ze terug. Komt nooit in de browser. |
| `VITE_SQUARE_APPLICATION_ID` | Openbaar | Id van de web betaalapplicatie, gebruikt wanneer Stripe niet is gezet. |
| `VITE_SQUARE_LOCATION_ID` | Openbaar | Locatie van die applicatie. |
| `SQUARE_ACCESS_TOKEN` | Server | Incasseert en betaalt terug. Komt nooit in de browser. |
| `OWNER_EMAIL` | Server | Aanmelden bij de studio, alleen wanneer demomodus uit staat. |
| `OWNER_PASSWORD` | Server | Wachtwoord om bij de studio aan te melden. |
| `OWNER_NAME` | Server | Naam die na het aanmelden wordt getoond. |
| `OWNER_SESSION_SECRET` | Server | Optioneel. Ondertekent de sessie van de eigenaar. Ontbreekt hij, dan geldt het wachtwoord van de eigenaar. |
| `PAYMENT_TICKET_SECRET` | Server | Optioneel. Ondertekent het betalingsbewijs voor terugbetalingen. Ontbreekt hij, dan geldt het geheim van de betaaldienst. |

`?demo=1` zet demomodus aan, ook wanneer er sleutels zijn.

## Installeren

Op iPhone: Deel, daarna Zet op beginscherm. Op Android: browsermenu, daarna App installeren.

Voor vertalers: [docs/TRANSLATIONS.md](docs/TRANSLATIONS.md).
