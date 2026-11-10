> **Nota:** Esta traducción está asistida por máquina. El inglés es la versión autorizada.

Idiomas: [English](README.md) · **[Español](README.es.md)** · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [العربية](README.ar.md) · [हिन्दी](README.hi.md) · [Русский](README.ru.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [Bahasa Indonesia](README.id.md) · [Polski](README.pl.md) · [Nederlands](README.nl.md) · [Українська](README.uk.md) · [Filipino](README.fil.md) · [Kiswahili](README.sw.md)

# B and S

Barberos y salones. Reserva un sillón, elige un servicio y una persona o el primer hueco libre, y paga un anticipo o la visita completa.

Las tiendas de ejemplo están alrededor de Powell y Columbus. En el modo de demostración, la agenda, los pagos y el estudio se quedan en este dispositivo.

## Qué puedes hacer

- Elegir un servicio con un precio, una duración y márgenes de tiempo
- Elegir a una persona o cualquier sillón libre
- Tomar un hueco libre de verdad, que no se reserva dos veces
- Pagar un anticipo o la visita completa, con una propina predefinida o a tu gusto
- Pagar con tarjeta o con Venmo. Apple Pay es un pago de demostración con esa etiqueta, y se queda apagado cuando hay claves de tarjeta en vivo
- Abrir el enlace de la visita para cambiar la hora o cancelar
- Reembolsar un pago con tarjeta en vivo solo desde ese enlace, o desde un propietario que haya iniciado sesión, y solo dentro del plazo del local
- Abrir el estudio: calendario del día y de la semana, horarios del personal, servicios, tiempo bloqueado, clientes y políticas de cancelación y de inasistencia

El modo de demostración es el predeterminado cuando faltan las claves de la tarjeta. También está activo si `VITE_DEMO_MODE=1` o si la página se abre con `?demo=1`. Quien entra lo hace como invitado de demostración. No hay pantalla de inicio de sesión. Pon `VITE_DEMO_MODE=0` y añade las claves de abajo para usar pagos con tarjeta en vivo y el inicio de sesión del propietario.

Los números de tarjeta se comprueban en el navegador y se descartan. La agenda guarda solo un token, la marca de la tarjeta y los últimos cuatro dígitos.

Un cargo en vivo se calcula en el servidor a partir del servicio publicado, la política de anticipo del local y una propina de como máximo $500. Un importe enviado por el navegador que no coincida se rechaza. Un reembolso necesita el registro de pago firmado, más el enlace de la visita o una sesión de propietario, y no puede superar lo pagado.

## Entorno

| Variable | Dónde | Para qué |
| --- | --- | --- |
| `VITE_DEMO_MODE` | Público | `1` fuerza el modo de demostración. `0` lo apaga. Si no está definido, sigue a las claves. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Público | Campo de la tarjeta. Se usa Stripe cuando esta clave está definida. |
| `STRIPE_SECRET_KEY` | Servidor | Crea y reembolsa cargos. Nunca se expone al navegador. |
| `VITE_SQUARE_APPLICATION_ID` | Público | Identificador de la aplicación de pagos web. Se usa cuando Stripe no está definido. |
| `VITE_SQUARE_LOCATION_ID` | Público | Ubicación de esa aplicación. |
| `SQUARE_ACCESS_TOKEN` | Servidor | Cobra y reembolsa. Nunca se expone al navegador. |
| `OWNER_EMAIL` | Servidor | Inicio de sesión del estudio, solo cuando el modo de demostración está apagado. |
| `OWNER_PASSWORD` | Servidor | Contraseña de inicio de sesión del estudio. |
| `OWNER_NAME` | Servidor | Nombre que se muestra después de iniciar sesión. |
| `OWNER_SESSION_SECRET` | Servidor | Opcional. Firma la sesión del propietario. Si falta, se usa la contraseña del propietario. |
| `PAYMENT_TICKET_SECRET` | Servidor | Opcional. Firma el registro de pago que se usa en los reembolsos. Si falta, se usa el secreto del procesador. |

`?demo=1` activa el modo de demostración aunque haya claves.

## Instalar

En iPhone: Compartir y luego Añadir a la pantalla de inicio. En Android: menú del navegador y luego Instalar aplicación.

Para traductores: [docs/TRANSLATIONS.md](docs/TRANSLATIONS.md).
