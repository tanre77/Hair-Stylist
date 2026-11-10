> **说明：** 本译文由机器辅助完成。如有出入，以英文版本为准。

语言: [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) · **[简体中文](README.zh-CN.md)** · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [العربية](README.ar.md) · [हिन्दी](README.hi.md) · [Русский](README.ru.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [Bahasa Indonesia](README.id.md) · [Polski](README.pl.md) · [Nederlands](README.nl.md) · [Українська](README.uk.md) · [Filipino](README.fil.md) · [Kiswahili](README.sw.md)

# B and S

理发店与沙龙。预约一个座位，选择一项服务和一个人，或最早的空闲时间，并支付订金或整次到店的费用。

示例店铺位于 Powell 与 Columbus 一带。在演示模式下，预约簿、付款和工作室都留在这台设备上。

## 你可以做什么

- 选择一项有价格、时长和缓冲时间的服务
- 指定一个人，或任意空闲座位
- 占用一个真实的空档，不会被重复预约
- 支付订金或整次到店费用，小费可用预设金额或自定义金额
- 用银行卡或 Venmo 付款。Apple Pay 是带标注的演示支付，在配置了真实银行卡密钥时保持关闭
- 打开到店链接，以便改期或取消
- 退还一笔真实银行卡付款时，只能从该到店链接操作，或由已登录的店主操作，并且只能在店铺规定的时限内
- 打开工作室：日视图和周视图日历、员工工时、服务、被占用的时间、客户，以及取消和爽约政策

没有银行卡密钥时，默认是演示模式。当 `VITE_DEMO_MODE=1`，或页面以 `?demo=1` 打开时，也会开启。访客以演示来宾的身份进入。没有登录画面。将 `VITE_DEMO_MODE` 设为 `0` 并加入下方密钥，即可使用真实银行卡付款和店主登录。

银行卡号在浏览器里核对后即丢弃。预约簿只保存令牌、卡组织和末四位数字。

一笔真实扣款由服务器根据已发布的服务、店铺的订金政策，以及最多 $500 的小费来计价。浏览器传来的金额若对不上，会被拒绝。退款需要已签名的付款记录，再加上到店链接或店主会话，并且不能超过已付金额。

## 环境

| 变量 | 位置 | 用途 |
| --- | --- | --- |
| `VITE_DEMO_MODE` | 公开 | `1` 强制开启演示模式。`0` 强制关闭。未设置时跟随密钥。 |
| `VITE_STRIPE_PUBLISHABLE_KEY` | 公开 | 银行卡输入栏。设置后即使用 Stripe。 |
| `STRIPE_SECRET_KEY` | 服务器 | 创建并退还扣款。绝不会暴露给浏览器。 |
| `VITE_SQUARE_APPLICATION_ID` | 公开 | 网页支付应用的标识。Stripe 未设置时使用。 |
| `VITE_SQUARE_LOCATION_ID` | 公开 | 该应用的地点。 |
| `SQUARE_ACCESS_TOKEN` | 服务器 | 扣款与退款。绝不会暴露给浏览器。 |
| `OWNER_EMAIL` | 服务器 | 工作室登录，仅在演示模式关闭时使用。 |
| `OWNER_PASSWORD` | 服务器 | 工作室登录密码。 |
| `OWNER_NAME` | 服务器 | 登录后显示的名字。 |
| `OWNER_SESSION_SECRET` | 服务器 | 可选。为店主会话签名。未设置时改用店主密码。 |
| `PAYMENT_TICKET_SECRET` | 服务器 | 可选。为退款所用的付款记录签名。未设置时改用支付处理方的密钥。 |

即使已经配置密钥，`?demo=1` 仍会开启演示模式。

## 安装

在 iPhone 上：点“共享”，然后“添加到主屏幕”。在 Android 上：浏览器菜单，然后“安装应用”。

给译者：[docs/TRANSLATIONS.md](docs/TRANSLATIONS.md)。
