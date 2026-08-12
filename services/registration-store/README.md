# GP Formation registration store

Small authenticated HTTP service backed by SQLite. The Next.js application encrypts
registration details before sending them here, so the VPS only persists opaque
ciphertext. The three or four required documents are uploaded directly to the VPS and
encrypted at rest with AES-256-GCM. Stripe payment transitions are stored atomically and can
safely be retried.

## Endpoints

- `GET /health` — public liveness and SQLite check.
- `PUT /v1/registrations/{reference}` — idempotently persist encrypted registration data.
- `PUT /v1/uploads/{reference}/{kind}` — upload one document with a short-lived signed URL.
- `POST /v1/documents/verify` — verify that all required documents are present.
- `GET /v1/sessions/upcoming` — return the five next open sessions with capacity.
- `GET|POST|PATCH|DELETE /v1/sessions...` — manage the public calendar (deletion is soft).
- `POST /v1/payment-intents` — link a manual-capture PaymentIntent to a registration.
- `POST /v1/payment-intents/authorized` — expose an authorized payment in the admin.
- `POST /v1/payment-intents/approval/claim` — atomically reserve the last available place before capture.
- `POST /v1/payment-intents/capture/*` — idempotently record capture and notification.
- `POST /v1/payment-intents/cancel` — record a rejected or expired authorization.
- `POST /v1/payments/claim` — atomically claim a paid Stripe Checkout Session.
- `POST /v1/payments/complete` — mark the notification email as sent.
- `GET /v1/registrations/paid` — list encrypted registrations whose payment and notification are complete.
- `GET /v1/downloads/{reference}/{kind}` — download a paid registration document with a short-lived signed URL.

The upload and download routes use HMAC-signed, expiring URLs. All other `/v1/*`
endpoints require `Authorization: Bearer <REGISTRATION_STORE_TOKEN>`. Uploads also
require an allowed GP Formation browser origin. A payment claim is rejected unless
the expected document kinds are present: driving licence recto/verso plus either the
passport identity page, or the recto/verso of another identity document.

## Runtime environment

```text
REGISTRATION_STORE_HOST=127.0.0.1
REGISTRATION_STORE_PORT=8787
REGISTRATION_STORE_DB_PATH=/var/lib/gpformation-registration-store/registrations.sqlite3
REGISTRATION_STORE_DOCUMENTS_PATH=/var/lib/gpformation-registration-store/documents
REGISTRATION_STORE_TOKEN=<random secret of at least 32 characters>
```

The service must bind to localhost and be exposed only through an HTTPS reverse proxy.
The API token also derives the document encryption key: rotating it requires
re-encrypting the existing document files first.

## Tests

```bash
python -m unittest -v test_server.py
```

## Production architecture

- The Next.js site stays on Vercel.
- Registration details are encrypted by Next.js before being sent to this service.
- The service runs behind Nginx on the OVH VPS and stores data in SQLite.
- Uploaded documents bypass Vercel's request-size limit, are validated by file signature,
  capped at 8 MiB each, and are encrypted before being written to disk.
- Stripe authorizes the card without capturing it (`capture_method=manual`).
- An admin validation atomically checks the session capacity, then captures the payment.
- The webhook and admin action both use the same idempotent email claim after capture.
- Any storage or email error returns HTTP 500 so Stripe retries the event.
- Admin document download links expire after two minutes and the VPS serves them only
  for registrations whose payment processing is complete.

## Vercel variables

The following server-side variables are required in Production:

```text
REGISTRATION_STORE_URL
REGISTRATION_STORE_TOKEN
REGISTRATION_ENCRYPTION_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

The legacy `NEXT_PUBLIC_STRIPE_RECOVERY_LINK` and
`STRIPE_RECOVERY_PAYMENT_LINK_ID` variables may stay during the migration so already
opened Payment Link checkouts can still be processed.

## Stripe setup before deployment

1. Create a webhook endpoint targeting `https://gpformation.fr/api/stripe/webhook`.
2. Subscribe it to `payment_intent.amount_capturable_updated`,
   `payment_intent.succeeded`, and `payment_intent.canceled`.
3. Store its `whsec_...` signing secret in `STRIPE_WEBHOOK_SECRET` on Vercel.
4. Store the matching Stripe secret and publishable API keys in
   `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
5. Redeploy, authorize a test card, approve it in `/admin`, and verify that only
   the approval captures the payment and sends the email.

Do not store either secret in this repository.

## Operations

- Service: `gpformation-registration-store.service`
- Database: `/var/lib/gpformation-registration-store/registrations.sqlite3`
- Encrypted documents: `/var/lib/gpformation-registration-store/documents/`
- Local backups: `/var/backups/gpformation-registration-store/`
- Backup timer: `gpformation-registration-store-backup.timer`
- TLS renewal timer: `snap.certbot.renew.timer`
