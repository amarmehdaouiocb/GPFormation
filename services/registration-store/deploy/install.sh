#!/usr/bin/env bash
set -euo pipefail

SOURCE_DIRECTORY="${1:-}"

if [[ -z "${SOURCE_DIRECTORY}" || ! -f "${SOURCE_DIRECTORY}/server.py" ]]; then
  echo "Usage: install.sh <uploaded-service-directory>" >&2
  exit 1
fi

python3 -c 'from cryptography.hazmat.primitives.ciphers.aead import AESGCM'
python3 -m py_compile "${SOURCE_DIRECTORY}/server.py" "${SOURCE_DIRECTORY}/backup.py"

if ! id gpformation-store >/dev/null 2>&1; then
  useradd --system --home-dir /nonexistent --shell /usr/sbin/nologin gpformation-store
fi

install -d -o root -g root -m 0755 /opt/gpformation-registration-store
install -d -o gpformation-store -g gpformation-store -m 0700 /var/lib/gpformation-registration-store
install -d -o root -g root -m 0755 /var/www/certbot

install -o root -g root -m 0644 "${SOURCE_DIRECTORY}/server.py" /opt/gpformation-registration-store/server.py
install -o root -g root -m 0644 "${SOURCE_DIRECTORY}/backup.py" /opt/gpformation-registration-store/backup.py

if [[ ! -f /etc/gpformation-registration-store.env ]]; then
  umask 077
  REGISTRATION_STORE_TOKEN="$(openssl rand -hex 32)"
  printf '%s\n' \
    'REGISTRATION_STORE_HOST=127.0.0.1' \
    'REGISTRATION_STORE_PORT=8787' \
    'REGISTRATION_STORE_DB_PATH=/var/lib/gpformation-registration-store/registrations.sqlite3' \
    'REGISTRATION_STORE_DOCUMENTS_PATH=/var/lib/gpformation-registration-store/documents' \
    "REGISTRATION_STORE_TOKEN=${REGISTRATION_STORE_TOKEN}" \
    > /etc/gpformation-registration-store.env
fi
chown root:gpformation-store /etc/gpformation-registration-store.env
chmod 0640 /etc/gpformation-registration-store.env

install -o root -g root -m 0644 \
  "${SOURCE_DIRECTORY}/gpformation-registration-store.service" \
  /etc/systemd/system/gpformation-registration-store.service
install -o root -g root -m 0644 \
  "${SOURCE_DIRECTORY}/deploy/gpformation-registration-store-backup.service" \
  /etc/systemd/system/gpformation-registration-store-backup.service
install -o root -g root -m 0644 \
  "${SOURCE_DIRECTORY}/deploy/gpformation-registration-store-backup.timer" \
  /etc/systemd/system/gpformation-registration-store-backup.timer

install -o root -g root -m 0644 \
  "${SOURCE_DIRECTORY}/deploy/99-gpformation-hardening.conf" \
  /etc/ssh/sshd_config.d/99-gpformation-hardening.conf
if ! sshd -t; then
  rm -f /etc/ssh/sshd_config.d/99-gpformation-hardening.conf
  echo "The SSH hardening configuration was rejected and removed" >&2
  exit 1
fi
systemctl reload ssh

install -o root -g root -m 0644 \
  "${SOURCE_DIRECTORY}/deploy/fail2ban-jail.local" \
  /etc/fail2ban/jail.d/gpformation.local
systemctl enable fail2ban
systemctl restart fail2ban

install -o root -g root -m 0644 \
  "${SOURCE_DIRECTORY}/deploy/nginx-http.conf" \
  /etc/nginx/sites-available/gpformation-registration-store
rm -f /etc/nginx/sites-enabled/default
ln -sfn \
  /etc/nginx/sites-available/gpformation-registration-store \
  /etc/nginx/sites-enabled/gpformation-registration-store
nginx -t
systemctl enable nginx
systemctl restart nginx

systemctl daemon-reload
systemctl enable --now gpformation-registration-store.service
systemctl enable --now gpformation-registration-store-backup.timer

ufw default deny incoming
ufw default allow outgoing
ufw limit OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

curl --fail --silent --show-error http://127.0.0.1:8787/health
systemctl --no-pager --full status gpformation-registration-store.service
