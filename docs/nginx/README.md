# GodsEye Nginx — Canonical Config

The canonical public root is the multi-hero GodsEye landing/application page.
The legacy waitlist/G4 page is served only at `/waitlist.html` and must not replace `/`.

## Source of truth

- **Canonical vhost:** `./godseye.digitalhustlerx.com.conf`
- **Live files that must stay synchronized:**
  - `/etc/nginx/sites-available/godseye.digitalhustlerx.com`
  - `/etc/nginx/sites-enabled/godseye.digitalhustlerx.com`
- **Canonical root rule:**

```nginx
location = / {
    try_files /index.html =404;
}
```

The `/app/` route remains an alternate SPA route. It is not the primary public entry.

## Apply safely

Before any edit, create a backup. Then copy the tracked config to both live locations,
run `nginx -t`, and reload nginx:

```bash
cp /etc/nginx/sites-enabled/godseye.digitalhustlerx.com \
  /root/nginx-backups/godseye.digitalhustlerx.com.before-edit-$(date +%s)
cp docs/nginx/godseye.digitalhustlerx.com.conf \
  /etc/nginx/sites-available/godseye.digitalhustlerx.com
cp docs/nginx/godseye.digitalhustlerx.com.conf \
  /etc/nginx/sites-enabled/godseye.digitalhustlerx.com
nginx -t && systemctl reload nginx
```

## Verification

```bash
curl -fsSL https://godseye.digitalhustlerx.com/ | grep -o \
  'GodsEye — AI Agents for Your Business'
grep -q 'try_files /index.html =404;' \
  /etc/nginx/sites-enabled/godseye.digitalhustlerx.com
```

The deployment guard in `scripts/deploy.sh` performs the live-root hash and hero-marker
checks automatically. Never restore `waitlist.html` to `/` without explicit approval.

## Root-cause note

If the live root changes unexpectedly, inspect scheduled agents, deployment scripts, shell
history, and both nginx config paths before changing browser cache or rebuilding assets.
