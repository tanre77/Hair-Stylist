> **Nota:** Esta tradução é assistida por máquina. O inglês é a versão oficial.

Idiomas: [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · **[Português (Brasil)](README.pt-BR.md)** · [Italiano](README.it.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [العربية](README.ar.md) · [हिन्दी](README.hi.md) · [Русский](README.ru.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [Bahasa Indonesia](README.id.md) · [Polski](README.pl.md) · [Nederlands](README.nl.md) · [Українська](README.uk.md) · [Filipino](README.fil.md) · [Kiswahili](README.sw.md)

# B and S

Barbeiros e salões. Reserve uma cadeira, escolha um serviço e uma pessoa ou o primeiro horário livre, e pague um sinal ou a visita inteira.

As lojas de exemplo ficam em torno de Powell e Columbus. No modo de demonstração, a agenda, os pagamentos e o estúdio ficam neste dispositivo.

## O que você pode fazer

- Escolher um serviço com preço, duração e intervalos
- Escolher uma pessoa ou qualquer cadeira livre
- Pegar um horário realmente livre, sem reserva duplicada
- Pagar um sinal ou a visita inteira, com gorjeta predefinida ou do valor que quiser
- Pagar com cartão ou Venmo. Apple Pay é um pagamento de demonstração com esse rótulo e fica desligado quando há chaves de cartão ao vivo
- Abrir o link da visita para remarcar ou cancelar
- Reembolsar um pagamento com cartão ao vivo só por esse link, ou por um proprietário que tenha entrado, e só dentro do prazo do salão
- Abrir o estúdio: calendário do dia e da semana, horários da equipe, serviços, tempo bloqueado, clientes e políticas de cancelamento e de não comparecimento

O modo de demonstração é o padrão quando faltam as chaves de cartão. Ele também fica ligado com `VITE_DEMO_MODE=1` ou quando a página é aberta com `?demo=1`. Quem entra chega como convidado de demonstração. Não há tela de entrada. Defina `VITE_DEMO_MODE=0` e acrescente as chaves abaixo para usar pagamentos com cartão ao vivo e a entrada do proprietário.

Os números de cartão são conferidos no navegador e descartados. A agenda guarda só um token, a bandeira e os quatro últimos dígitos.

Uma cobrança ao vivo é calculada no servidor a partir do serviço publicado, da política de sinal do salão e de uma gorjeta de no máximo $500. Um valor enviado pelo navegador que não coincida é recusado. Um reembolso precisa do registro de pagamento assinado mais o link da visita ou uma sessão do proprietário, e não pode passar do que foi pago.

## Ambiente

| Variável | Onde | Função |
| --- | --- | --- |
| `VITE_DEMO_MODE` | Público | `1` força o modo de demonstração. `0` o desliga. Sem valor, segue as chaves. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Público | Campo do cartão. Stripe é usado quando esta chave está definida. |
| `STRIPE_SECRET_KEY` | Servidor | Cria e reembolsa cobranças. Nunca é exposta ao navegador. |
| `VITE_SQUARE_APPLICATION_ID` | Público | Identificador da aplicação de pagamentos na web, usado quando Stripe não está definido. |
| `VITE_SQUARE_LOCATION_ID` | Público | Local dessa aplicação. |
| `SQUARE_ACCESS_TOKEN` | Servidor | Cobra e reembolsa. Nunca é exposto ao navegador. |
| `OWNER_EMAIL` | Servidor | Entrada no estúdio, só quando o modo de demonstração está desligado. |
| `OWNER_PASSWORD` | Servidor | Senha de entrada no estúdio. |
| `OWNER_NAME` | Servidor | Nome mostrado depois da entrada. |
| `OWNER_SESSION_SECRET` | Servidor | Opcional. Assina a sessão do proprietário. Se faltar, vale a senha do proprietário. |
| `PAYMENT_TICKET_SECRET` | Servidor | Opcional. Assina o registro de pagamento usado nos reembolsos. Se faltar, vale o segredo do processador. |

`?demo=1` liga o modo de demonstração mesmo quando há chaves.

## Instalar

No iPhone: Compartilhar e depois Adicionar à Tela de Início. No Android: menu do navegador e depois Instalar app.

Para tradutores: [docs/TRANSLATIONS.md](docs/TRANSLATIONS.md).
