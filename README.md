# B and S

Barbers and Salons. Book a chair, pick a service and a person or the first open time, and pay a deposit or the full visit.

Sample shops sit around Powell and Columbus. In demo mode the book, the payments, and the studio all stay on this device.

## What you can do

- Choose a service with a price, a duration, and buffers
- Pick a person or any available chair
- Take a real open slot that won't double-book
- Pay a deposit or the full visit, with a preset or custom tip
- Pay by card, Venmo, or Apple Pay
- Open a visit link to reschedule or cancel
- Refund a card payment cancelled inside the shop's window
- Open the studio: day and week calendar, staff hours, services, blocked time, clients, and cancellation and no-show policies

Demo mode is the default when card keys are missing. It is also on when `VITE_DEMO_MODE=1` or the page is opened with `?demo=1`. Visitors come in as a demo guest. There is no sign-in screen. Set `VITE_DEMO_MODE=0` and add the keys below to use live card payments and owner sign-in.

Card numbers are checked in the browser and thrown away. The book stores a token, brand, and last four digits only.

## Environment

| Variable | Where | Purpose |
| --- | --- | --- |
| `VITE_DEMO_MODE` | Public | `1` forces demo mode. `0` forces it off. Unset follows the keys. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Public | Card field. Stripe is used when this is set. |
| `STRIPE_SECRET_KEY` | Server | Creates and refunds charges. Never exposed to the browser. |
| `VITE_SQUARE_APPLICATION_ID` | Public | Web payments application id, used when Stripe is unset. |
| `VITE_SQUARE_LOCATION_ID` | Public | Location for that application. |
| `SQUARE_ACCESS_TOKEN` | Server | Charges and refunds. Never exposed to the browser. |
| `OWNER_EMAIL` | Server | Studio sign-in, only when demo mode is off. |
| `OWNER_PASSWORD` | Server | Studio sign-in password. |
| `OWNER_NAME` | Server | Name shown after sign-in. |

`?demo=1` turns demo mode on even when keys are present.

## Install

On iPhone: Share, then Add to Home Screen. On Android: browser menu, then Install app.
