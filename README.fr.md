> **Note :** Cette traduction est assistée par machine. L'anglais fait foi.

Langues: [English](README.md) · [Español](README.es.md) · **[Français](README.fr.md)** · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [العربية](README.ar.md) · [हिन्दी](README.hi.md) · [Русский](README.ru.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [Bahasa Indonesia](README.id.md) · [Polski](README.pl.md) · [Nederlands](README.nl.md) · [Українська](README.uk.md) · [Filipino](README.fil.md) · [Kiswahili](README.sw.md)

# B and S

Barbiers et salons. Réservez un fauteuil, choisissez une prestation et une personne ou le premier créneau libre, puis payez un acompte ou la visite entière.

Les boutiques d'exemple se trouvent autour de Powell et de Columbus. En mode démo, l'agenda, les paiements et le studio restent sur cet appareil.

## Ce que vous pouvez faire

- Choisir une prestation avec un prix, une durée et des temps tampon
- Choisir une personne ou n'importe quel fauteuil libre
- Prendre un vrai créneau ouvert, sans double réservation
- Payer un acompte ou la visite entière, avec un pourboire proposé ou libre
- Payer par carte ou avec Venmo. Apple Pay est un paiement démo portant cette mention, et il reste désactivé lorsque les clés de carte en direct sont présentes
- Ouvrir un lien de visite pour déplacer ou annuler
- Rembourser un paiement par carte en direct seulement depuis ce lien, ou en tant que propriétaire connecté, et seulement dans le délai du salon
- Ouvrir le studio : calendrier du jour et de la semaine, horaires de l'équipe, prestations, temps bloqué, clients, et règles d'annulation et de rendez-vous manqué

Le mode démo est le mode par défaut lorsque les clés de carte manquent. Il est aussi actif quand `VITE_DEMO_MODE=1`, ou quand la page est ouverte avec `?demo=1`. Les visiteurs arrivent comme invités de démo. Il n'y a pas d'écran de connexion. Réglez `VITE_DEMO_MODE=0` et ajoutez les clés ci-dessous pour utiliser les paiements par carte en direct et la connexion du propriétaire.

Les numéros de carte sont vérifiés dans le navigateur, puis écartés. L'agenda ne conserve qu'un jeton, la marque et les quatre derniers chiffres.

Un débit en direct est calculé sur le serveur à partir de la prestation publiée, de la règle d'acompte du salon et d'un pourboire d'au plus $500. Un montant envoyé par le navigateur qui ne correspond pas est refusé. Un remboursement exige l'enregistrement de paiement signé, plus le lien de visite ou une session de propriétaire, et il ne peut pas dépasser la somme payée.

## Environnement

| Variable | Où | Rôle |
| --- | --- | --- |
| `VITE_DEMO_MODE` | Public | `1` force le mode démo. `0` le force à l'arrêt. Sans valeur, il suit les clés. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Public | Champ de carte. Stripe est utilisé lorsque cette clé est définie. |
| `STRIPE_SECRET_KEY` | Serveur | Crée et rembourse les débits. Jamais exposée au navigateur. |
| `VITE_SQUARE_APPLICATION_ID` | Public | Identifiant de l'application de paiement web, utilisé quand Stripe n'est pas défini. |
| `VITE_SQUARE_LOCATION_ID` | Public | Lieu de cette application. |
| `SQUARE_ACCESS_TOKEN` | Serveur | Encaisse et rembourse. Jamais exposé au navigateur. |
| `OWNER_EMAIL` | Serveur | Connexion au studio, seulement lorsque le mode démo est arrêté. |
| `OWNER_PASSWORD` | Serveur | Mot de passe de connexion au studio. |
| `OWNER_NAME` | Serveur | Nom affiché après la connexion. |
| `OWNER_SESSION_SECRET` | Serveur | Facultatif. Signe la session du propriétaire. À défaut, le mot de passe du propriétaire est utilisé. |
| `PAYMENT_TICKET_SECRET` | Serveur | Facultatif. Signe l'enregistrement de paiement utilisé pour les remboursements. À défaut, le secret du prestataire de paiement est utilisé. |

`?demo=1` active le mode démo même lorsque les clés sont présentes.

## Installation

Sur iPhone : Partager, puis Sur l'écran d'accueil. Sur Android : menu du navigateur, puis Installer l'application.

Pour les traducteurs : [docs/TRANSLATIONS.md](docs/TRANSLATIONS.md).
