> **Nota:** Questa traduzione è assistita da una macchina. L'inglese fa fede.

Lingue: [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · **[Italiano](README.it.md)** · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [العربية](README.ar.md) · [हिन्दी](README.hi.md) · [Русский](README.ru.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [Bahasa Indonesia](README.id.md) · [Polski](README.pl.md) · [Nederlands](README.nl.md) · [Українська](README.uk.md) · [Filipino](README.fil.md) · [Kiswahili](README.sw.md)

# B and S

Barbieri e saloni. Prenota una poltrona, scegli un servizio e una persona o il primo orario libero, e paga un acconto o l'intera visita.

I negozi di esempio stanno intorno a Powell e Columbus. In modalità demo, l'agenda, i pagamenti e lo studio restano su questo dispositivo.

## Cosa puoi fare

- Scegliere un servizio con prezzo, durata e margini di tempo
- Scegliere una persona o qualsiasi poltrona libera
- Prendere un orario davvero libero, senza doppia prenotazione
- Pagare un acconto o l'intera visita, con una mancia preimpostata o a piacere
- Pagare con carta o con Venmo. Apple Pay è un pagamento demo con quella dicitura e resta spento quando sono presenti le chiavi della carta dal vivo
- Aprire un link della visita per spostare o annullare
- Rimborsare un pagamento con carta dal vivo solo da quel link, o da un titolare che ha effettuato l'accesso, e solo entro la finestra del negozio
- Aprire lo studio: calendario del giorno e della settimana, orari del personale, servizi, tempo bloccato, clienti e regole di cancellazione e di mancata presentazione

La modalità demo è quella predefinita quando mancano le chiavi della carta. È attiva anche con `VITE_DEMO_MODE=1` o se la pagina si apre con `?demo=1`. Chi arriva entra come ospite demo. Non c'è una schermata di accesso. Imposta `VITE_DEMO_MODE=0` e aggiungi le chiavi qui sotto per usare i pagamenti con carta dal vivo e l'accesso del titolare.

I numeri di carta si controllano nel browser e si scartano. L'agenda conserva solo un token, il marchio e le ultime quattro cifre.

Un addebito dal vivo viene calcolato sul server a partire dal servizio pubblicato, dalla regola di acconto del negozio e da una mancia di al massimo $500. Un importo inviato dal browser che non coincide viene rifiutato. Un rimborso richiede la registrazione di pagamento firmata più il link della visita o una sessione del titolare, e non può superare quanto è stato pagato.

## Ambiente

| Variabile | Dove | Scopo |
| --- | --- | --- |
| `VITE_DEMO_MODE` | Pubblico | `1` forza la modalità demo. `0` la spegne. Se manca, segue le chiavi. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Pubblico | Campo della carta. Si usa Stripe quando questa chiave è impostata. |
| `STRIPE_SECRET_KEY` | Server | Crea e rimborsa gli addebiti. Non viene mai esposta al browser. |
| `VITE_SQUARE_APPLICATION_ID` | Pubblico | Identificativo dell'applicazione di pagamenti web, usato quando Stripe non è impostato. |
| `VITE_SQUARE_LOCATION_ID` | Pubblico | Sede di quell'applicazione. |
| `SQUARE_ACCESS_TOKEN` | Server | Addebita e rimborsa. Non viene mai esposto al browser. |
| `OWNER_EMAIL` | Server | Accesso allo studio, solo quando la modalità demo è spenta. |
| `OWNER_PASSWORD` | Server | Password di accesso allo studio. |
| `OWNER_NAME` | Server | Nome mostrato dopo l'accesso. |
| `OWNER_SESSION_SECRET` | Server | Facoltativo. Firma la sessione del titolare. Se manca, si usa la password del titolare. |
| `PAYMENT_TICKET_SECRET` | Server | Facoltativo. Firma la registrazione di pagamento usata per i rimborsi. Se manca, si usa il segreto del gestore dei pagamenti. |

`?demo=1` attiva la modalità demo anche quando le chiavi ci sono.

## Installazione

Su iPhone: Condividi, poi Aggiungi a Home. Su Android: menu del browser, poi Installa app.

Per i traduttori: [docs/TRANSLATIONS.md](docs/TRANSLATIONS.md).
