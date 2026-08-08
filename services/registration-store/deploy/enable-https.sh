#!/usr/bin/env bash
set -euo pipefail

SOURCE_DIRECTORY="${1:-}"
IP_ADDRESS="152.228.234.228"

if [[ -z "${SOURCE_DIRECTORY}" || ! -f "${SOURCE_DIRECTORY}/deploy/nginx-https.conf" ]]; then
  echo "Usage: enable-https.sh <uploaded-service-directory>" >&2
  exit 1
fi

if ! snap list certbot >/dev/null 2>&1; then
  snap install certbot --classic
fi

/snap/bin/certbot certonly \
  --non-interactive \
  --agree-tos \
  --register-unsafely-without-email \
  --preferred-profile shortlived \
  --webroot \
  --webroot-path /var/www/certbot \
  --ip-address "${IP_ADDRESS}" \
  --cert-name "${IP_ADDRESS}" \
  --keep-until-expiring

install -o root -g root -m 0644 \
  "${SOURCE_DIRECTORY}/deploy/nginx-https.conf" \
  /etc/nginx/sites-available/gpformation-registration-store

install -d -o root -g root -m 0755 /etc/letsencrypt/renewal-hooks/deploy
cat > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx <<'HOOK'
#!/usr/bin/env sh
systemctl reload nginx
HOOK
chmod 0755 /etc/letsencrypt/renewal-hooks/deploy/reload-nginx

nginx -t
systemctl reload nginx

/snap/bin/certbot certificates
systemctl list-timers --all snap.certbot.renew.timer --no-pager
