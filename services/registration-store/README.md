# GP Formation registration store

Small authenticated HTTP service backed by SQLite. The Next.js application encrypts
registration details before sending them here, so the VPS only persists opaque
ciphertext. Stripe payment transitions are stored atomically and can safely be retried.

## Endpoints

- `GET /health` — public liveness and SQLite check.
- `PUT /v1/registrations/{reference}` — idempotently persist encrypted registration data.
- `POST /v1/payments/claim` — atomically claim a paid Stripe Checkout Session.
- `POST /v1/payments/complete` — mark the notification email as sent.

All `/v1/*` endpoints require `Authorization: Bearer <REGISTRATION_STORE_TOKEN>`.

## Runtime environment

```text
REGISTRATION_STORE_HOST=127.0.0.1
REGISTRATION_STORE_PORT=8787
REGISTRATION_STORE_DB_PATH=/var/lib/gpformation-registration-store/registrations.sqlite3
REGISTRATION_STORE_TOKEN=<random secret of at least 32 characters>
```

The service must bind to localhost and be exposed only through an HTTPS reverse proxy.

## Tests

```bash
python -m unittest -v test_server.py
```

## Production architecture

- The Next.js site stays on Vercel.
- Registration details are encrypted by Next.js before being sent to this service.
- The service runs behind Nginx on the OVH VPS and stores data in SQLite.
- Stripe calls the Vercel webhook after a confirmed payment.
- The webhook atomically claims the payment, sends the confirmation email, then marks it complete.
- Any storage or email error returns HTTP 500 so Stripe retries the event.

## Vercel variables

The following server-side variables are required in Production:

```text
REGISTRATION_STORE_URL
REGISTRATION_STORE_TOKEN
REGISTRATION_ENCRYPTION_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_RECOVERY_PAYMENT_LINK_ID
```

`NEXT_PUBLIC_STRIPE_RECOVERY_LINK` must contain the public recovery-points Payment Link.
The form deliberately refuses to redirect to Stripe while either Stripe server-side
variable is missing.

## Stripe setup before deployment

1. Create a webhook endpoint targeting `https://gpformation.fr/api/stripe/webhook`.
2. Subscribe it to `checkout.session.completed` and
   `checkout.session.async_payment_succeeded`.
3. Store its `whsec_...` signing secret in `STRIPE_WEBHOOK_SECRET` on Vercel.
4. Store the `plink_...` identifier of the recovery-points Payment Link in
   `STRIPE_RECOVERY_PAYMENT_LINK_ID` on Vercel.
5. Redeploy Production, then send a Stripe test event and verify an HTTP 200 response.

Do not store either secret in this repository.

## Operations

- Service: `gpformation-registration-store.service`
- Database: `/var/lib/gpformation-registration-store/registrations.sqlite3`
- Local backups: `/var/backups/gpformation-registration-store/`
- Backup timer: `gpformation-registration-store-backup.timer`
- TLS renewal timer: `snap.certbot.renew.timer`
