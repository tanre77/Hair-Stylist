> **Paalala:** Ang salin na ito ay tinulungan ng makina. Ang Ingles ang opisyal na bersyon.

Mga wika: [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [العربية](README.ar.md) · [हिन्दी](README.hi.md) · [Русский](README.ru.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [Bahasa Indonesia](README.id.md) · [Polski](README.pl.md) · [Nederlands](README.nl.md) · [Українська](README.uk.md) · **[Filipino](README.fil.md)** · [Kiswahili](README.sw.md)

# B and S

Mga barbero at salon. Magpareserba ng upuan, pumili ng serbisyo at ng isang tao o ng unang bukas na oras, at magbayad ng deposito o ng buong pagbisita.

Ang mga halimbawang tindahan ay nasa paligid ng Powell at Columbus. Sa demo mode, ang aklat, ang mga bayad, at ang studio ay nananatili sa device na ito.

## Ano ang magagawa mo

- Pumili ng serbisyo na may presyo, tagal, at mga buffer
- Pumili ng isang tao o ng anumang bakanteng upuan
- Kumuha ng totoong bukas na slot na hindi madodoble ang reserba
- Magbayad ng deposito o ng buong pagbisita, na may nakatakdang tip o sariling halaga
- Magbayad gamit ang card o Venmo. Ang Apple Pay ay isang may-label na demo na bayad, at nananatiling nakasara kapag may mga live na card key
- Magbukas ng link ng pagbisita para ilipat ang oras o kanselahin
- I-refund ang isang live na bayad sa card mula lamang sa link na iyon, o mula sa naka-sign-in na may-ari, at sa loob lamang ng palugit ng tindahan
- Buksan ang studio: kalendaryo ng araw at linggo, oras ng staff, mga serbisyo, naka-block na oras, mga kliyente, at mga patakaran sa pagkansela at hindi pagdating

Ang demo mode ang default kapag wala ang mga card key. Naka-on din ito kapag `VITE_DEMO_MODE=1` o kapag binuksan ang pahina gamit ang `?demo=1`. Ang mga bisita ay pumapasok bilang demo guest. Walang screen ng pag-sign-in. Itakda ang `VITE_DEMO_MODE=0` at idagdag ang mga key sa ibaba para gamitin ang live na bayad sa card at ang pag-sign-in ng may-ari.

Sinusuri ang mga numero ng card sa browser at itinatapon. Ang aklat ay nagtatago lamang ng token, brand, at huling apat na digit.

Ang isang live na singil sa card ay pinipresyuhan sa server mula sa nailathalang serbisyo, sa patakaran ng deposito ng tindahan, at sa tip na hanggang $500. Ang halagang ipinadala ng browser na hindi tumutugma ay tinatanggihan. Ang refund ay nangangailangan ng nilagdaang tala ng bayad kasama ang link ng pagbisita o isang session ng may-ari, at hindi ito maaaring lumampas sa nabayaran.

## Kapaligiran

| Variable | Saan | Layunin |
| --- | --- | --- |
| `VITE_DEMO_MODE` | Pampubliko | Pinipilit ng `1` ang demo mode. Pinapatay ito ng `0`. Kapag walang halaga, sumusunod sa mga key. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Pampubliko | Field ng card. Ginagamit ang Stripe kapag nakatakda ito. |
| `STRIPE_SECRET_KEY` | Server | Gumagawa at nagre-refund ng mga singil. Hindi kailanman inilalantad sa browser. |
| `VITE_SQUARE_APPLICATION_ID` | Pampubliko | Id ng application ng web payments, ginagamit kapag hindi nakatakda ang Stripe. |
| `VITE_SQUARE_LOCATION_ID` | Pampubliko | Lokasyon ng application na iyon. |
| `SQUARE_ACCESS_TOKEN` | Server | Singilin at i-refund. Hindi kailanman inilalantad sa browser. |
| `OWNER_EMAIL` | Server | Pag-sign-in sa studio, kapag naka-off lang ang demo mode. |
| `OWNER_PASSWORD` | Server | Password sa pag-sign-in sa studio. |
| `OWNER_NAME` | Server | Pangalang lumalabas pagkatapos mag-sign-in. |
| `OWNER_SESSION_SECRET` | Server | Opsyonal. Lumalagda sa session ng may-ari. Kapag wala, ang password ng may-ari ang ginagamit. |
| `PAYMENT_TICKET_SECRET` | Server | Opsyonal. Lumalagda sa tala ng bayad na ginagamit sa refund. Kapag wala, ang lihim ng processor ang ginagamit. |

Binubuksan ng `?demo=1` ang demo mode kahit may mga key.

## Pag-install

Sa iPhone: Ibahagi, pagkatapos Idagdag sa Home Screen. Sa Android: menu ng browser, pagkatapos I-install ang app.

Para sa mga tagasalin: [docs/TRANSLATIONS.md](docs/TRANSLATIONS.md).
