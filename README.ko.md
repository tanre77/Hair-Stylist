> **참고:** 이 번역은 기계의 도움을 받아 작성되었습니다. 기준은 영어 원문입니다.

언어: [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · **[한국어](README.ko.md)** · [العربية](README.ar.md) · [हिन्दी](README.hi.md) · [Русский](README.ru.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [Bahasa Indonesia](README.id.md) · [Polski](README.pl.md) · [Nederlands](README.nl.md) · [Українська](README.uk.md) · [Filipino](README.fil.md) · [Kiswahili](README.sw.md)

# B and S

바버와 살롱. 의자를 예약하고, 서비스와 담당자 또는 가장 빠른 빈 시간을 고른 뒤, 예약금이나 방문 금액 전부를 냅니다.

예시 가게는 Powell과 Columbus 주변에 있습니다. 데모 모드에서는 예약부, 결제, 스튜디오가 모두 이 기기에 남습니다.

## 할 수 있는 일

- 가격, 소요 시간, 앞뒤 여유 시간이 있는 서비스를 고릅니다
- 담당자를 지정하거나, 비어 있는 아무 의자나 고릅니다
- 겹쳐 예약되지 않는 실제 빈 시간을 잡습니다
- 예약금 또는 방문 금액 전부를, 정해진 팁이나 직접 입력한 팁과 함께 냅니다
- 카드 또는 Venmo로 결제합니다. Apple Pay는 표시가 붙은 데모 결제이며, 실제 카드 키가 있으면 나오지 않습니다
- 방문 링크를 열어 시간을 바꾸거나 취소합니다
- 실제 카드 결제의 환불은 그 방문 링크에서만, 또는 로그인한 점주만 할 수 있고, 가게가 정한 기한 안에서만 됩니다
- 스튜디오를 엽니다. 일과 주 달력, 직원 근무 시간, 서비스, 막아 둔 시간, 고객, 취소 및 노쇼 정책이 있습니다

카드 키가 없으면 데모 모드가 기본입니다. `VITE_DEMO_MODE=1`이거나 페이지를 `?demo=1`로 열어도 켜집니다. 방문자는 데모 손님으로 들어옵니다. 로그인 화면은 없습니다. 실제 카드 결제와 점주 로그인을 쓰려면 `VITE_DEMO_MODE=0`으로 두고 아래 키를 넣으세요.

카드 번호는 브라우저에서 확인한 뒤 버립니다. 예약부에는 토큰, 카드 브랜드, 끝 네 자리만 남습니다.

실제 카드 청구 금액은 공개된 서비스, 가게의 예약금 정책, 최대 $500의 팁을 바탕으로 서버에서 정해집니다. 브라우저가 보낸 금액이 맞지 않으면 거절됩니다. 환불에는 서명된 결제 기록과 함께 방문 링크 또는 점주 세션이 필요하며, 이미 낸 금액을 넘을 수 없습니다.

## 환경

| 변수 | 위치 | 용도 |
| --- | --- | --- |
| `VITE_DEMO_MODE` | 공개 | `1`은 데모 모드를 강제합니다. `0`은 끕니다. 비어 있으면 키를 따릅니다. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | 공개 | 카드 입력란. 이 값이 있으면 Stripe를 씁니다. |
| `STRIPE_SECRET_KEY` | 서버 | 청구를 만들고 환불합니다. 브라우저에 절대 노출되지 않습니다. |
| `VITE_SQUARE_APPLICATION_ID` | 공개 | 웹 결제 애플리케이션 ID. Stripe가 없을 때 씁니다. |
| `VITE_SQUARE_LOCATION_ID` | 공개 | 그 애플리케이션의 위치. |
| `SQUARE_ACCESS_TOKEN` | 서버 | 청구와 환불. 브라우저에 절대 노출되지 않습니다. |
| `OWNER_EMAIL` | 서버 | 스튜디오 로그인. 데모 모드가 꺼져 있을 때만 씁니다. |
| `OWNER_PASSWORD` | 서버 | 스튜디오 로그인 비밀번호. |
| `OWNER_NAME` | 서버 | 로그인 뒤에 보이는 이름. |
| `OWNER_SESSION_SECRET` | 서버 | 선택. 점주 세션에 서명합니다. 없으면 점주 비밀번호로 돌아갑니다. |
| `PAYMENT_TICKET_SECRET` | 서버 | 선택. 환불에 쓰는 결제 기록에 서명합니다. 없으면 결제 처리자의 비밀로 돌아갑니다. |

`?demo=1`은 키가 있어도 데모 모드를 켭니다.

## 설치

iPhone에서는 공유를 누른 다음 홈 화면에 추가합니다. Android에서는 브라우저 메뉴에서 앱 설치를 누릅니다.

번역하는 분께: [docs/TRANSLATIONS.md](docs/TRANSLATIONS.md).
