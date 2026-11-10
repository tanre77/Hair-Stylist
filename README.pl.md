> **Uwaga:** To tłumaczenie powstało przy wsparciu maszyny. Wersja angielska jest rozstrzygająca.

Języki: [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [العربية](README.ar.md) · [हिन्दी](README.hi.md) · [Русский](README.ru.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [Bahasa Indonesia](README.id.md) · **[Polski](README.pl.md)** · [Nederlands](README.nl.md) · [Українська](README.uk.md) · [Filipino](README.fil.md) · [Kiswahili](README.sw.md)

# B and S

Barberzy i salony. Zarezerwuj fotel, wybierz usługę i osobę albo pierwszy wolny czas i zapłać zadatek albo całą wizytę.

Przykładowe lokale leżą wokół Powell i Columbus. W trybie demo księga, płatności i studio zostają na tym urządzeniu.

## Co możesz zrobić

- Wybrać usługę z ceną, czasem trwania i buforami
- Wybrać osobę albo dowolny wolny fotel
- Wziąć prawdziwy wolny termin, którego nie da się zarezerwować drugi raz
- Zapłacić zadatek albo całą wizytę, z gotowym albo własnym napiwkiem
- Zapłacić kartą albo przez Venmo. Apple Pay to oznaczona płatność demo i zostaje wyłączony, gdy są klucze karty na żywo
- Otworzyć link wizyty, żeby przełożyć albo odwołać
- Zwrócić płatność kartą na żywo tylko z tego linku albo jako zalogowany właściciel, i tylko w oknie salonu
- Otworzyć studio: kalendarz dnia i tygodnia, godziny personelu, usługi, zablokowany czas, klienci oraz zasady odwołań i nieobecności

Tryb demo jest domyślny, gdy brakuje kluczy karty. Włącza się też przy `VITE_DEMO_MODE=1` albo gdy strona jest otwarta z `?demo=1`. Odwiedzający wchodzą jako gość demo. Nie ma ekranu logowania. Ustaw `VITE_DEMO_MODE=0` i dodaj klucze poniżej, żeby korzystać z płatności kartą na żywo i logowania właściciela.

Numery kart są sprawdzane w przeglądarce i wyrzucane. Księga trzyma tylko token, markę i cztery ostatnie cyfry.

Obciążenie karty na żywo wycenia serwer na podstawie opublikowanej usługi, zasad zadatku salonu i napiwku najwyżej $500. Kwota wysłana przez przeglądarkę, która się nie zgadza, jest odrzucana. Zwrot wymaga podpisanego zapisu płatności oraz linku wizyty albo sesji właściciela i nie może przekroczyć zapłaconej kwoty.

## Środowisko

| Zmienna | Gdzie | Po co |
| --- | --- | --- |
| `VITE_DEMO_MODE` | Publicznie | `1` wymusza tryb demo. `0` go wyłącza. Bez wartości idzie za kluczami. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Publicznie | Pole karty. Stripe jest używany, gdy ten klucz jest ustawiony. |
| `STRIPE_SECRET_KEY` | Serwer | Tworzy i zwraca obciążenia. Nigdy nie trafia do przeglądarki. |
| `VITE_SQUARE_APPLICATION_ID` | Publicznie | Identyfikator aplikacji płatności w sieci, używany gdy Stripe nie jest ustawiony. |
| `VITE_SQUARE_LOCATION_ID` | Publicznie | Lokalizacja tej aplikacji. |
| `SQUARE_ACCESS_TOKEN` | Serwer | Pobiera opłatę i zwraca ją. Nigdy nie trafia do przeglądarki. |
| `OWNER_EMAIL` | Serwer | Logowanie do studia, tylko gdy tryb demo jest wyłączony. |
| `OWNER_PASSWORD` | Serwer | Hasło logowania do studia. |
| `OWNER_NAME` | Serwer | Imię pokazywane po zalogowaniu. |
| `OWNER_SESSION_SECRET` | Serwer | Opcjonalnie. Podpisuje sesję właściciela. Gdy go brak, używane jest hasło właściciela. |
| `PAYMENT_TICKET_SECRET` | Serwer | Opcjonalnie. Podpisuje zapis płatności używany przy zwrotach. Gdy go brak, używany jest sekret operatora płatności. |

`?demo=1` włącza tryb demo nawet wtedy, gdy klucze są obecne.

## Instalacja

Na iPhone: Udostępnij, potem Dodaj do ekranu początkowego. Na Android: menu przeglądarki, potem Zainstaluj aplikację.

Dla tłumaczy: [docs/TRANSLATIONS.md](docs/TRANSLATIONS.md).
