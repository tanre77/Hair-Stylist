> **Lưu ý:** Bản dịch này có sự hỗ trợ của máy. Tiếng Anh là bản có giá trị chính thức.

Ngôn ngữ: [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [العربية](README.ar.md) · [हिन्दी](README.hi.md) · [Русский](README.ru.md) · **[Tiếng Việt](README.vi.md)** · [Türkçe](README.tr.md) · [Bahasa Indonesia](README.id.md) · [Polski](README.pl.md) · [Nederlands](README.nl.md) · [Українська](README.uk.md) · [Filipino](README.fil.md) · [Kiswahili](README.sw.md)

# B and S

Tiệm cắt tóc và salon. Đặt một ghế, chọn dịch vụ cùng một người hoặc giờ trống sớm nhất, rồi trả tiền đặt cọc hoặc cả lần ghé.

Các tiệm mẫu nằm quanh Powell và Columbus. Ở chế độ demo, sổ đặt chỗ, các khoản thanh toán và studio đều nằm trên thiết bị này.

## Bạn có thể làm gì

- Chọn một dịch vụ có giá, thời lượng và khoảng đệm
- Chọn một người hoặc bất kỳ ghế nào còn trống
- Lấy một khung giờ trống thật, không bị đặt trùng
- Trả tiền đặt cọc hoặc cả lần ghé, với tiền tip có sẵn hoặc tự nhập
- Trả bằng thẻ hoặc Venmo. Apple Pay là khoản thanh toán demo có nhãn, và tắt khi đã có khóa thẻ thật
- Mở liên kết lần ghé để đổi giờ hoặc hủy
- Hoàn một khoản thẻ thật chỉ từ liên kết đó, hoặc từ chủ tiệm đã đăng nhập, và chỉ trong khoảng thời gian của tiệm
- Mở studio: lịch ngày và tuần, giờ làm của nhân viên, dịch vụ, thời gian bị chặn, khách, cùng chính sách hủy và không đến

Chế độ demo là mặc định khi thiếu khóa thẻ. Nó cũng bật khi `VITE_DEMO_MODE=1` hoặc khi trang được mở với `?demo=1`. Người vào được xem là khách demo. Không có màn hình đăng nhập. Đặt `VITE_DEMO_MODE=0` và thêm các khóa bên dưới để dùng thanh toán thẻ thật và đăng nhập của chủ tiệm.

Số thẻ được kiểm tra trên trình duyệt rồi bỏ đi. Sổ chỉ lưu một token, thương hiệu thẻ và bốn chữ số cuối.

Một lần trừ thẻ thật được tính giá trên máy chủ từ dịch vụ đã công bố, chính sách đặt cọc của tiệm và tiền tip nhiều nhất là $500. Số tiền trình duyệt gửi lên nếu không khớp sẽ bị từ chối. Việc hoàn tiền cần bản ghi thanh toán đã ký cùng liên kết lần ghé hoặc phiên của chủ tiệm, và không được vượt quá số đã trả.

## Môi trường

| Biến | Ở đâu | Mục đích |
| --- | --- | --- |
| `VITE_DEMO_MODE` | Công khai | `1` buộc bật chế độ demo. `0` buộc tắt. Không đặt thì theo các khóa. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Công khai | Ô thẻ. Stripe được dùng khi khóa này có giá trị. |
| `STRIPE_SECRET_KEY` | Máy chủ | Tạo và hoàn các khoản trừ. Không bao giờ đưa ra trình duyệt. |
| `VITE_SQUARE_APPLICATION_ID` | Công khai | Mã ứng dụng thanh toán web, dùng khi Stripe chưa được đặt. |
| `VITE_SQUARE_LOCATION_ID` | Công khai | Địa điểm của ứng dụng đó. |
| `SQUARE_ACCESS_TOKEN` | Máy chủ | Trừ tiền và hoàn tiền. Không bao giờ đưa ra trình duyệt. |
| `OWNER_EMAIL` | Máy chủ | Đăng nhập studio, chỉ khi chế độ demo đang tắt. |
| `OWNER_PASSWORD` | Máy chủ | Mật khẩu đăng nhập studio. |
| `OWNER_NAME` | Máy chủ | Tên hiện sau khi đăng nhập. |
| `OWNER_SESSION_SECRET` | Máy chủ | Không bắt buộc. Ký phiên của chủ tiệm. Nếu thiếu thì dùng mật khẩu của chủ tiệm. |
| `PAYMENT_TICKET_SECRET` | Máy chủ | Không bắt buộc. Ký bản ghi thanh toán dùng để hoàn tiền. Nếu thiếu thì dùng bí mật của bên xử lý thanh toán. |

`?demo=1` bật chế độ demo ngay cả khi đã có khóa.

## Cài đặt

Trên iPhone: Chia sẻ, rồi Thêm vào Màn hình chính. Trên Android: menu trình duyệt, rồi Cài đặt ứng dụng.

Dành cho người dịch: [docs/TRANSLATIONS.md](docs/TRANSLATIONS.md).
