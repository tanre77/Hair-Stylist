> **Not:** Bu çeviri makine desteklidir. Yetkili metin İngilizce olandır.

Diller: [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [العربية](README.ar.md) · [हिन्दी](README.hi.md) · [Русский](README.ru.md) · [Tiếng Việt](README.vi.md) · **[Türkçe](README.tr.md)** · [Bahasa Indonesia](README.id.md) · [Polski](README.pl.md) · [Nederlands](README.nl.md) · [Українська](README.uk.md) · [Filipino](README.fil.md) · [Kiswahili](README.sw.md)

# B and S

Berberler ve salonlar. Bir koltuk ayırtın, bir hizmet ve bir kişi ya da ilk boş saati seçin, kapora veya ziyaretin tamamını ödeyin.

Örnek dükkânlar Powell ve Columbus çevresindedir. Demo modunda defter, ödemeler ve stüdyo bu cihazda kalır.

## Neler yapabilirsiniz

- Fiyatı, süresi ve tamponları olan bir hizmet seçin
- Bir kişiyi veya boş herhangi bir koltuğu seçin
- İki kez rezerve edilmeyecek gerçek bir boş saati alın
- Hazır ya da özel bir bahşişle kapora veya ziyaretin tamamını ödeyin
- Kartla veya Venmo ile ödeyin. Apple Pay etiketli bir demo ödemedir ve canlı kart anahtarları varken kapalı kalır
- Yeniden planlamak veya iptal etmek için ziyaret bağlantısını açın
- Canlı bir kart ödemesini yalnızca o bağlantıdan veya oturum açmış sahip üzerinden iade edin; üstelik yalnızca dükkânın süresi içinde
- Stüdyoyu açın: gün ve hafta takvimi, personel saatleri, hizmetler, kapatılmış zaman, müşteriler ve iptal ile gelmeme politikaları

Kart anahtarları yoksa demo modu varsayılandır. `VITE_DEMO_MODE=1` olduğunda veya sayfa `?demo=1` ile açıldığında da açıktır. Gelenler demo konuğu olarak girer. Oturum açma ekranı yoktur. Canlı kart ödemeleri ve sahip oturumu için `VITE_DEMO_MODE=0` yapın ve aşağıdaki anahtarları ekleyin.

Kart numaraları tarayıcıda kontrol edilir ve atılır. Defter yalnızca bir belirteç, marka ve son dört haneyi saklar.

Canlı bir kart tahsilatı, yayımlanmış hizmetten, dükkânın kapora politikasından ve en fazla $500 bahşişten sunucuda fiyatlanır. Tarayıcının gönderdiği tutar uyuşmazsa reddedilir. İade için imzalı ödeme kaydı ile birlikte ziyaret bağlantısı veya bir sahip oturumu gerekir ve ödenenden fazla olamaz.

## Ortam

| Değişken | Nerede | Amaç |
| --- | --- | --- |
| `VITE_DEMO_MODE` | Herkese açık | `1` demo modunu zorlar. `0` kapatır. Boşsa anahtarlara uyar. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Herkese açık | Kart alanı. Bu ayarlıysa Stripe kullanılır. |
| `STRIPE_SECRET_KEY` | Sunucu | Tahsilat oluşturur ve iade eder. Tarayıcıya hiç açılmaz. |
| `VITE_SQUARE_APPLICATION_ID` | Herkese açık | Web ödemeleri uygulama kimliği. Stripe ayarlı değilken kullanılır. |
| `VITE_SQUARE_LOCATION_ID` | Herkese açık | O uygulamanın konumu. |
| `SQUARE_ACCESS_TOKEN` | Sunucu | Tahsil eder ve iade eder. Tarayıcıya hiç açılmaz. |
| `OWNER_EMAIL` | Sunucu | Stüdyo oturumu, yalnızca demo modu kapalıyken. |
| `OWNER_PASSWORD` | Sunucu | Stüdyo oturum parolası. |
| `OWNER_NAME` | Sunucu | Oturum açıldıktan sonra görünen ad. |
| `OWNER_SESSION_SECRET` | Sunucu | İsteğe bağlı. Sahip oturumunu imzalar. Yoksa sahip parolasına düşer. |
| `PAYMENT_TICKET_SECRET` | Sunucu | İsteğe bağlı. İadelerde kullanılan ödeme kaydını imzalar. Yoksa ödeme işleyicisinin sırrına düşer. |

`?demo=1`, anahtarlar olsa bile demo modunu açar.

## Yükleme

iPhone'da: Paylaş, sonra Ana Ekrana Ekle. Android'de: tarayıcı menüsü, sonra Uygulamayı yükle.

Çevirmenler için: [docs/TRANSLATIONS.md](docs/TRANSLATIONS.md).
