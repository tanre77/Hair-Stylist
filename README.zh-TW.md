> **說明：** 本譯文由機器輔助完成。如有出入，以英文版本為準。

語言: [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) · [简体中文](README.zh-CN.md) · **[繁體中文](README.zh-TW.md)** · [日本語](README.ja.md) · [한국어](README.ko.md) · [العربية](README.ar.md) · [हिन्दी](README.hi.md) · [Русский](README.ru.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [Bahasa Indonesia](README.id.md) · [Polski](README.pl.md) · [Nederlands](README.nl.md) · [Українська](README.uk.md) · [Filipino](README.fil.md) · [Kiswahili](README.sw.md)

# B and S

理髮店與沙龍。預約一個座位，選擇一項服務和一個人，或最早的空檔，並支付訂金或整次到店的費用。

示例店舖位於 Powell 與 Columbus 一帶。在示範模式下，預約簿、付款和工作室都留在這台裝置上。

## 你可以做什麼

- 選擇一項有價格、時長和緩衝時間的服務
- 指定一個人，或任一空閒座位
- 占用一個真實的空檔，不會被重複預約
- 支付訂金或整次到店費用，小費可用預設金額或自訂金額
- 用銀行卡或 Venmo 付款。Apple Pay 是帶標註的示範支付，在設定了真實銀行卡金鑰時保持關閉
- 打開到店連結，以便改期或取消
- 退還一筆真實銀行卡付款時，只能從該到店連結操作，或由已登入的店主操作，並且只能在店舖規定的時限內
- 打開工作室：日檢視和週檢視日曆、員工工時、服務、被占用的時間、客戶，以及取消和未到政策

沒有銀行卡金鑰時，預設是示範模式。當 `VITE_DEMO_MODE=1`，或頁面以 `?demo=1` 打開時，也會開啟。訪客以示範來賓的身分進入。沒有登入畫面。將 `VITE_DEMO_MODE` 設為 `0` 並加入下方金鑰，即可使用真實銀行卡付款和店主登入。

銀行卡號在瀏覽器裡核對後即捨棄。預約簿只保存權杖、卡組織和末四碼。

一筆真實扣款由伺服器根據已發布的服務、店舖的訂金政策，以及最多 $500 的小費來計價。瀏覽器傳來的金額若對不上，會被拒絕。退款需要已簽名的付款紀錄，再加上到店連結或店主工作階段，並且不能超過已付金額。

## 環境

| 變數 | 位置 | 用途 |
| --- | --- | --- |
| `VITE_DEMO_MODE` | 公開 | `1` 強制開啟示範模式。`0` 強制關閉。未設定時跟隨金鑰。 |
| `VITE_STRIPE_PUBLISHABLE_KEY` | 公開 | 銀行卡輸入欄。設定後即使用 Stripe。 |
| `STRIPE_SECRET_KEY` | 伺服器 | 建立並退還扣款。絕不會暴露給瀏覽器。 |
| `VITE_SQUARE_APPLICATION_ID` | 公開 | 網頁支付應用的識別碼。Stripe 未設定時使用。 |
| `VITE_SQUARE_LOCATION_ID` | 公開 | 該應用的地點。 |
| `SQUARE_ACCESS_TOKEN` | 伺服器 | 扣款與退款。絕不會暴露給瀏覽器。 |
| `OWNER_EMAIL` | 伺服器 | 工作室登入，僅在示範模式關閉時使用。 |
| `OWNER_PASSWORD` | 伺服器 | 工作室登入密碼。 |
| `OWNER_NAME` | 伺服器 | 登入後顯示的名字。 |
| `OWNER_SESSION_SECRET` | 伺服器 | 選用。為店主工作階段簽名。未設定時改用店主密碼。 |
| `PAYMENT_TICKET_SECRET` | 伺服器 | 選用。為退款所用的付款紀錄簽名。未設定時改用支付處理方的金鑰。 |

即使已經設定金鑰，`?demo=1` 仍會開啟示範模式。

## 安裝

在 iPhone 上：點「分享」，然後「加入主畫面」。在 Android 上：瀏覽器選單，然後「安裝應用程式」。

給譯者：[docs/TRANSLATIONS.md](docs/TRANSLATIONS.md)。
