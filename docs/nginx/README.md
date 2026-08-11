# Godseye Nginx — Canonical Config

**HAZARD (recurs TWICE this month: 2026-08-15, 2026-08-19):**
The `location = /` block on `godseye.digitalhustlerx.com` was silently changed from

    try_files /waitlist.html /index.html;   # CORRECT — main domain root = waitlist

to

    try_files /index.html =404;             # WRONG — serves the SPA shell (615B) at root

This breaks AGENTS.md rule: **main domain root = waitlist** (strict lead capture).
The SPA is at `/app/`, NOT `/`.

## Source of truth and remediation

- **Canonical vhost:** `./godseye.digitalhustlerx.com.conf` (copied verbatim from the live
  `/etc/nginx/sites-available/`, verified serving 200/18923B on 2026-08-19).
- **Live files to keep in sync** (must match, md5 checksum):
  - `/etc/nginx/sites-available/godseye.digitalhustlerx.com`
  - `/etc/nginx/sites-enabled/godseye.digitalhustlerx.com`
- **Apply:** `cp docs/nginx/godseye.digitalhustlerx.com.conf /etc/nginx/sites-available/` then the same to sites-enabled, then `nginx -t` then `systemctl restart nginx`.
- **Verify root serves waitlist:** `curl -s -o /dev/null -w '%{http_code} %{size_download}B' https://godseye.digitalhustlerx.com/` — expect `200 18923B` (or `wc -c < dist/waitlist.html`).

## Root-cause note
Unknown what repointed it at 09:55 on 08-19. Check `.bash_history` / scheduled agent tasks on
the host. If any automation touches nginx, point it at THIS file as the deterministic source.
