> **Catatan:** Terjemahan ini dibantu mesin. Bahasa Inggris adalah versi yang berlaku.

Bahasa: [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [العربية](README.ar.md) · [हिन्दी](README.hi.md) · [Русский](README.ru.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · **[Bahasa Indonesia](README.id.md)** · [Polski](README.pl.md) · [Nederlands](README.nl.md) · [Українська](README.uk.md) · [Filipino](README.fil.md) · [Kiswahili](README.sw.md)

# B and S

Tukang cukur dan salon. Pesan sebuah kursi, pilih layanan dan seseorang atau waktu kosong pertama, lalu bayar uang muka atau seluruh kunjungan.

Toko contoh berada di sekitar Powell dan Columbus. Dalam mode demo, buku, pembayaran, dan studio tetap di perangkat ini.

## Yang bisa Anda lakukan

- Memilih layanan dengan harga, durasi, dan jeda
- Memilih seseorang atau kursi kosong mana pun
- Mengambil slot kosong yang sungguh ada, yang tidak akan dipesan ganda
- Membayar uang muka atau seluruh kunjungan, dengan tip tetap atau sesuai keinginan
- Membayar dengan kartu atau Venmo. Apple Pay adalah pembayaran demo yang berlabel, dan tetap mati saat kunci kartu langsung ada
- Membuka tautan kunjungan untuk menjadwalkan ulang atau membatalkan
- Mengembalikan pembayaran kartu langsung hanya dari tautan itu, atau dari pemilik yang sudah masuk, dan hanya di dalam jangka waktu toko
- Membuka studio: kalender hari dan minggu, jam staf, layanan, waktu yang diblokir, pelanggan, serta kebijakan pembatalan dan tidak datang

Mode demo adalah bawaan saat kunci kartu tidak ada. Mode ini juga menyala bila `VITE_DEMO_MODE=1` atau halaman dibuka dengan `?demo=1`. Pengunjung masuk sebagai tamu demo. Tidak ada layar masuk. Atur `VITE_DEMO_MODE=0` dan tambahkan kunci di bawah untuk memakai pembayaran kartu langsung dan masuk sebagai pemilik.

Nomor kartu diperiksa di peramban lalu dibuang. Buku hanya menyimpan token, merek, dan empat digit terakhir.

Tagihan kartu langsung dihitung di server dari layanan yang diterbitkan, kebijakan uang muka toko, dan tip paling banyak $500. Jumlah yang dikirim peramban dan tidak cocok akan ditolak. Pengembalian dana membutuhkan catatan pembayaran yang ditandatangani plus tautan kunjungan atau sesi pemilik, dan tidak boleh melebihi yang sudah dibayar.

## Lingkungan

| Variabel | Di mana | Kegunaan |
| --- | --- | --- |
| `VITE_DEMO_MODE` | Publik | `1` memaksa mode demo. `0` mematikannya. Kosong berarti mengikuti kunci. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Publik | Kolom kartu. Stripe dipakai ketika ini diisi. |
| `STRIPE_SECRET_KEY` | Server | Membuat dan mengembalikan tagihan. Tidak pernah dibuka ke peramban. |
| `VITE_SQUARE_APPLICATION_ID` | Publik | Id aplikasi pembayaran web, dipakai ketika Stripe tidak diisi. |
| `VITE_SQUARE_LOCATION_ID` | Publik | Lokasi aplikasi itu. |
| `SQUARE_ACCESS_TOKEN` | Server | Menagih dan mengembalikan dana. Tidak pernah dibuka ke peramban. |
| `OWNER_EMAIL` | Server | Masuk ke studio, hanya ketika mode demo mati. |
| `OWNER_PASSWORD` | Server | Kata sandi masuk studio. |
| `OWNER_NAME` | Server | Nama yang tampil setelah masuk. |
| `OWNER_SESSION_SECRET` | Server | Opsional. Menandatangani sesi pemilik. Jika kosong, kata sandi pemilik yang dipakai. |
| `PAYMENT_TICKET_SECRET` | Server | Opsional. Menandatangani catatan pembayaran untuk pengembalian dana. Jika kosong, rahasia pemroses yang dipakai. |

`?demo=1` menyalakan mode demo walaupun kunci sudah ada.

## Pasang

Di iPhone: Bagikan, lalu Tambahkan ke Layar Utama. Di Android: menu peramban, lalu Pasang aplikasi.

Untuk penerjemah: [docs/TRANSLATIONS.md](docs/TRANSLATIONS.md).
