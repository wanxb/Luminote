# Admin Password Hash

Luminote stores the admin password as a PBKDF2 hash. It is not a plain SHA hash
and it is not only the final digest. Keep the full string exactly as generated.

## Format

```text
pbkdf2_sha256$100000$<salt_base64url>$<hash_base64url>
```

The value has four `$`-separated parts:

1. `pbkdf2_sha256`: algorithm marker.
2. `100000`: PBKDF2 iteration count. This is the maximum supported by
   Cloudflare Workers PBKDF2.
3. `<salt_base64url>`: random salt encoded with base64url.
4. `<hash_base64url>`: derived password hash encoded with base64url.

Example shape:

```dotenv
ADMIN_PASSWORD_HASH=pbkdf2_sha256$100000$randomSaltHere$derivedHashHere
ADMIN_SESSION_TOKEN=replace-with-a-long-random-session-token
```

Do not edit only the last segment and do not remove the salt or iteration count.
The whole string is needed for login verification.

## Generate A Hash

From the Worker directory:

```bash
cd worker
npm run hash-password -- "your-new-password"
```

Copy the printed `ADMIN_PASSWORD_HASH=...` line into `.dev.vars`, Cloudflare
secrets, or the `site_config.admin_password_hash` D1 column.

## Reset A Forgotten Password

Local D1:

```bash
cd worker
npm run hash-password -- "your-new-password"
npx wrangler d1 execute luminote-dev --local --persist-to .wrangler/state/local-speed --command "UPDATE site_config SET admin_password_hash = 'PASTE_HASH_HERE', updated_at = datetime('now') WHERE id = 1;" --config wrangler.toml
```

Remote D1:

```bash
cd worker
npm run hash-password -- "your-new-password"
npx wrangler d1 execute luminote-dev --remote --command "UPDATE site_config SET admin_password_hash = 'PASTE_HASH_HERE', updated_at = datetime('now') WHERE id = 1;" --config wrangler.toml
```

For a brand-new environment, `ADMIN_PASSWORD_HASH` is the preferred initial
configuration. `ADMIN_PASSWORD` may still be used only as a one-time bootstrap
source when no hash exists yet, but it is not accepted as a login fallback after
the database has a hash.
